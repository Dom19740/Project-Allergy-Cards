import { d as defineHandler, g as getQuery, c as createError } from "../../_libs/h3.mjs";
import "../../_libs/rou3.mjs";
import "../../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
const restoreByEmail_get = defineHandler(async (event) => {
  const query = getQuery(event);
  const email = query.email;
  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing email parameter"
    });
  }
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Lemon Squeezy API key is not configured on the server"
    });
  }
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
