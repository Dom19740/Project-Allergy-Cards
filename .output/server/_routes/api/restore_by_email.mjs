import { d as defineHandler, g as getQuery, c as createError } from "../../_libs/h3.mjs";
import "../../_libs/rou3.mjs";
import "../../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
const FALLBACK_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiIyYTdjNTc0NGU1OTQ4ZTMxYzhmOGJkOTY3Yjg3YjljODMzZDU5NzE4YWJhZmRhMWY5NzE4ZDYwMmE1OTY5ZTgyZWYxYmU3YmNmMzVhOTFjNiIsImlhdCI6MTc3OTI1NTkwOS41MzQ3ODksImV4cCI6MTc5NTEzMjgwMC4wMjU1OTcsInN1YiI6IjcxMzE5MjEiLCJzY29wZXMiOltdfQ.v_wQbBDm8mCWi4na1TwcDzPaDneZ2Qi4he0OonxoLrcqbNUkKzJfTztsSZ10NHeNGungzJiLKzeitRgYNjedowKDD0YI7LimfjaA05sST2r_VokQgdmJ-ZvUgbRljcCpk3-1t8fNm3XUlsk_Pdlro7sNI09sBQNs5UcRqag-GJ8piNujirIgMJRi4pXPZLg4jGODEpBolVSroFYyfIZpS1n5Cr3TKd2Cn-GsI1EUTON8Hez0RUmEa2tXXAO6lckigp2rIdRgdatL8V-Jg1wYxDAq6r8estJTdowcryRu81BH0vMyew2CezQpjAlvxQD-qOaHB3KaoAEZcs4I77zFUG-r9gebsnFC1IzXr8M3lREDueqydMsfc5048sksBsKuTBzVn0l3PlPBjdl_1mW-DkRZ2Sevd8exWTqdYr8ZdtI9u8fd9bz6T-d4PIaav9wgmJ7fQbqmVT3R2Dsa8lZdS3AT7OjQzdhFSwHg88ZcLcSBq8M-GkaiBcSoPhV2cf_fZzotv_JxeawV4atPyCt9RK9xI5xowMAZSe57e-ndMkECLOm_HDEjGlaWg9jT5lXU0CRbTaP97H7Xg6fwy-mltPybdS7Gf1lA7mPFQqBiuh82tmq_6fx7xa-eYPBRF7zfBiAX7v3";
const restoreByEmail_get = defineHandler(async (event) => {
  const query = getQuery(event);
  const email = query.email;
  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing email parameter"
    });
  }
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY || FALLBACK_API_KEY;
  try {
    const response = await fetch(`https://api.lemonsqueezy.com/v1/orders?filter[user_email]=${encodeURIComponent(String(email))}`, {
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${apiKey}`
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lemon Squeezy API error response:", errorText);
      throw createError({
        statusCode: 400,
        statusMessage: "Failed to query orders from Lemon Squeezy"
      });
    }
    const data = await response.json();
    const orders = data.data || [];
    const hasPaidOrder = orders.some((order) => order.attributes?.status === "paid");
    if (hasPaidOrder) {
      return { success: true };
    } else {
      return { success: false, message: "No paid orders found for this email" };
    }
  } catch (error) {
    console.error("Error restoring purchase by email:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal Server Error"
    });
  }
});
export {
  restoreByEmail_get as default
};
