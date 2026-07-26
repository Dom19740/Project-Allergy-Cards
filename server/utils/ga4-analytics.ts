import { GoogleAuth } from "google-auth-library";

// Not secret - the numeric identifier for the GA4 property linked to this
// app's Firebase project (GA4 Admin > Property Settings > Property ID).
const GA4_PROPERTY_ID = "538321662";

let auth: GoogleAuth | null = null;

const getAuth = (): GoogleAuth => {
  if (!auth) {
    const raw = process.env.GOOGLE_ANALYTICS_CREDENTIALS;
    if (!raw) {
      throw new Error("Google Analytics is not configured (GOOGLE_ANALYTICS_CREDENTIALS missing)");
    }
    auth = new GoogleAuth({
      credentials: JSON.parse(raw),
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });
  }
  return auth;
};

interface GA4Row {
  dimensionValues?: { value?: string }[];
  metricValues?: { value?: string }[];
}

// Calls the GA4 Data API's plain REST endpoint directly rather than the
// official @google-analytics/data SDK: that SDK pulls in google-gax/
// @grpc/grpc-js, which rely on __dirname and dynamic require() and don't
// survive being bundled into ESM by Vite/Nitro (confirmed via a runtime
// crash - "__dirname is not defined in ES module scope"). google-auth-library
// alone (just for minting an access token from the service account) bundles
// fine.
const runReport = async (body: Record<string, unknown>): Promise<GA4Row[]> => {
  const client = await getAuth().getClient();
  const { token } = await client.getAccessToken();
  if (!token) {
    throw new Error("Failed to obtain a Google Analytics access token");
  }

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error(`GA4 Data API request failed (${response.status}): ${await response.text()}`);
  }

  const data: any = await response.json();
  return data.rows ?? [];
};

// Fixed cutoff, not "today" as a relative keyword - a relative "today" would
// shift forward every day and lose prior days' real data. Set to the date
// this cutoff was introduced, so all of that day's testing is included but
// prior test-purchase noise (license-tester Play purchases fire the same
// analytics event as real ones, with nothing distinguishing them) is
// excluded. Bump forward manually if more test activity happens later and
// needs excluding too.
const ALL_TIME_RANGE = { startDate: "2026-07-24", endDate: "today" };

const eventNameFilter = (eventName: string) => ({
  fieldName: "eventName",
  stringFilter: { matchType: "EXACT" as const, value: eventName },
});

// caseSensitive: false since GA4's exact casing for the "platform" dimension
// ("Android"/"ANDROID"/"android") isn't confirmed and an exact-but-wrong-case
// match would silently return zero rows instead of erroring.
const platformFilter = (platform: string) => ({
  fieldName: "platform",
  stringFilter: { matchType: "EXACT" as const, value: platform, caseSensitive: false },
});

// Counts unique users who landed with a given ref (campaign_landing fires on
// every webapp pageload that carries a fresh ?ref=, so eventCount would
// inflate every time the same visitor reloads/revisits with the param still
// in the URL) grouped by the "ref" custom dimension, which must already be
// registered in GA4 (Admin > Custom definitions) - unregistered event params
// aren't queryable via this API at all. Web-only in practice: campaign_landing
// only fires when a ?ref= is present in the page's own query string, which
// native Android cold starts never have.
export const getWebappOpenCountsByRef = async (): Promise<Record<string, number>> => {
  const rows = await runReport({
    dateRanges: [ALL_TIME_RANGE],
    dimensions: [{ name: "customEvent:ref" }],
    metrics: [{ name: "totalUsers" }],
    dimensionFilter: { filter: eventNameFilter("campaign_landing") },
  });

  const counts: Record<string, number> = {};
  for (const row of rows) {
    const ref = row.dimensionValues?.[0]?.value;
    if (ref) counts[ref] = Number(row.metricValues?.[0]?.value ?? 0);
  }
  return counts;
};

// Android never attaches a "ref" event param (only web does), so Play
// installs/purchases are grouped by GA4's own automatic campaign
// attribution instead - "firstUserCampaignName", populated from the Play
// Install Referrer string includes.js already sends
// (utm_campaign=<ref>), so its value lines up with the same ref names used
// everywhere else. This depends on GA4 correctly carrying that first-touch
// attribution forward to later events (e.g. a purchase in a later app
// session) - unverified as of this build, called out explicitly to the user.
export const getPlayInstallCountsByRef = async (): Promise<Record<string, number>> => {
  const rows = await runReport({
    dateRanges: [ALL_TIME_RANGE],
    dimensions: [{ name: "firstUserCampaignName" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      andGroup: {
        expressions: [{ filter: eventNameFilter("first_open") }, { filter: platformFilter("android") }],
      },
    },
  });

  const counts: Record<string, number> = {};
  for (const row of rows) {
    const ref = row.dimensionValues?.[0]?.value;
    if (ref) counts[ref] = Number(row.metricValues?.[0]?.value ?? 0);
  }
  return counts;
};

export interface PlayPurchaseSummary {
  count: number;
  // Cents, to match the Lemon Squeezy ledger's unit - GA4's purchaseRevenue
  // metric is a decimal amount, converted here.
  total: number;
}

// Platform filter matters here (unlike opens) because "purchase" fires on
// both web and Android - without it, web purchases would double-count into
// this Play-specific total too.
export const getPlayPurchaseCountsByRef = async (): Promise<Record<string, PlayPurchaseSummary>> => {
  const rows = await runReport({
    dateRanges: [ALL_TIME_RANGE],
    dimensions: [{ name: "firstUserCampaignName" }],
    metrics: [{ name: "eventCount" }, { name: "purchaseRevenue" }],
    dimensionFilter: {
      andGroup: {
        expressions: [{ filter: eventNameFilter("purchase") }, { filter: platformFilter("android") }],
      },
    },
  });

  const result: Record<string, PlayPurchaseSummary> = {};
  for (const row of rows) {
    const ref = row.dimensionValues?.[0]?.value;
    if (!ref) continue;
    const count = Number(row.metricValues?.[0]?.value ?? 0);
    const revenue = Number(row.metricValues?.[1]?.value ?? 0);
    result[ref] = { count, total: Math.round(revenue * 100) };
  }
  return result;
};

// A single-row (no dimension breakdown) count/revenue query, for site-wide
// totals that include organic traffic - unlike the per-ref queries above,
// which are structurally referral-only for web (see getWebappOpenCountsByRef).
const runTotalQuery = async (
  eventName: string,
  platform: string
): Promise<{ count: number; total: number }> => {
  const rows = await runReport({
    dateRanges: [ALL_TIME_RANGE],
    metrics: [{ name: "eventCount" }, { name: "purchaseRevenue" }],
    dimensionFilter: {
      andGroup: {
        expressions: [{ filter: eventNameFilter(eventName) }, { filter: platformFilter(platform) }],
      },
    },
  });
  const row = rows[0];
  return {
    count: Number(row?.metricValues?.[0]?.value ?? 0),
    total: Math.round(Number(row?.metricValues?.[1]?.value ?? 0) * 100),
  };
};

export interface SiteTotals {
  webOpens: number;
  webPurchaseCount: number;
  webPurchaseTotal: number;
  playInstalls: number;
  playPurchaseCount: number;
  playPurchaseTotal: number;
}

// Site-wide totals across ALL traffic, referral or not - the counterpart to
// the per-ref breakdowns above, which only ever show referral-attributed
// activity (by design for web, by GA4 automatic attribution for Play).
// "first_visit" is GA4's own auto-collected event for a visitor's first-ever
// web session, the closest web equivalent to "first_open" on Android.
export const getSiteTotals = async (): Promise<SiteTotals> => {
  const [webOpens, webPurchases, playOpens, playPurchases] = await Promise.all([
    runTotalQuery("first_visit", "web"),
    runTotalQuery("purchase", "web"),
    runTotalQuery("first_open", "android"),
    runTotalQuery("purchase", "android"),
  ]);

  return {
    webOpens: webOpens.count,
    webPurchaseCount: webPurchases.count,
    webPurchaseTotal: webPurchases.total,
    playInstalls: playOpens.count,
    playPurchaseCount: playPurchases.count,
    playPurchaseTotal: playPurchases.total,
  };
};
