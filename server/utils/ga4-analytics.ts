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

// Counts campaign_landing events (fired once per webapp pageload that
// carries a fresh ?ref=) grouped by the "ref" custom dimension, which must
// already be registered in GA4 (Admin > Custom definitions) - unregistered
// event params aren't queryable via this API at all.
//
// Calls the GA4 Data API's plain REST endpoint directly rather than the
// official @google-analytics/data SDK: that SDK pulls in google-gax/
// @grpc/grpc-js, which rely on __dirname and dynamic require() and don't
// survive being bundled into ESM by Vite/Nitro (confirmed via a runtime
// crash - "__dirname is not defined in ES module scope"). google-auth-library
// alone (just for minting an access token from the service account) bundles
// fine.
export const getWebappOpenCountsByRef = async (): Promise<Record<string, number>> => {
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
      body: JSON.stringify({
        dateRanges: [{ startDate: "2025-01-01", endDate: "today" }],
        dimensions: [{ name: "customEvent:ref" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: { matchType: "EXACT", value: "campaign_landing" },
          },
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`GA4 Data API request failed (${response.status}): ${await response.text()}`);
  }

  const data: any = await response.json();
  const counts: Record<string, number> = {};
  for (const row of data.rows ?? []) {
    const ref = row.dimensionValues?.[0]?.value;
    const count = row.metricValues?.[0]?.value;
    if (ref) {
      counts[ref] = Number(count ?? 0);
    }
  }
  return counts;
};
