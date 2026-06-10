import { defineHandler } from "nitro";
import { getQuery, createError } from "nitro/h3";

const FALLBACK_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiIyYTdjNTc0NGU1OTQ4ZTMxYzhmOGJkOTY3Yjg3YjljODMzZDU5NzE4YWJhZmRhMWY5NzE4ZDYwMmE1OTY5ZTgyZWYxYmU3YmNmMzVhOTFjNiIsImlhdCI6MTc3OTI1NTkwOS41MzQ3ODksImV4cCI6MTc5NTEzMjgwMC4wMjU1OTcsInN1YiI6IjcxMzE5MjEiLCJzY29wZXMiOltdfQ.v_wQbBDm8mCWi4na1TwcDzPaDneZ2Qi4he0OonxoLrcqbNUkKzJfTztsSZ10NHeNGungzJiLKzeitRgYNjedowKDD0YI7LimfjaA05sST2r_VokQgdmJ-ZvUgbRljcCpk3-1t8fNm3XUlsk_Pdlro7sNI09sBQNs5UcRqag-GJ8piNujirIgMJRi4pXPZLg4jGODEpBolVSroFYyfIZpS1n5Cr3TKd2Cn-GsI1EUTON8Hez0RUmEa2tXXAO6lckigp2rIdRgdatL8V-Jg1wYxDAq6r8estJTdowcryRu81BH0vMyew2CezQpjAlvxQD-qOaHB3KaoAEZcs4I77zFUG-r9gebsnFC1IzXr8M3lREDueqydMsfc5048sksBsKuTBzVn0l3PlPBjdl_1mW-DkRZ2Sevd8exWTqdYr8ZdtI9u8fd9bz6T-d4PIaav9wgmJ7fQbqmVT3R2Dsa8lZdS3AT7OjQzdhFSwHg88ZcLcSBq8M-GkaiBcSoPhV2cf_fZzotv_JxeawV4atPyCt9RK9xI5xowMAZSe57e-ndMkECLOm_HDEjGlaWg9jT5lXU0CRbTaP97H7Xg6fwy-mltPybdS7Gf1lA7mPFQqBiuh82tmq_6fx7xa-eYPBRF7zfBiAX7v3";

export default defineHandler(async (event) => {
  const query = getQuery(event);
  const orderId = query.order_id;

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing order_id parameter",
    });
  }

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY || FALLBACK_API_KEY;

  try {
    const response = await fetch(`https://api.lemonsqueezy.com/v1/orders/${orderId}`, {
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lemon Squeezy API error response:", errorText);
      throw createError({
        statusCode: 400,
        statusMessage: "Failed to fetch order from Lemon Squeezy",
      });
    }

    const data = await response.json();
    const status = data.data?.attributes?.status;

    if (status === "paid") {
      return { success: true };
    } else {
      return { success: false, status };
    }
  } catch (error: any) {
    console.error("Error verifying order:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
