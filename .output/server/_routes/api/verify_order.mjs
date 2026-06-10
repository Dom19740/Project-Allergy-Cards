import { d as defineHandler, g as getQuery, c as createError } from "../../_libs/h3.mjs";
import "../../_libs/rou3.mjs";
import "../../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
const verifyOrder_get = defineHandler(async (event) => {
  const query = getQuery(event);
  const orderId = query.order_id;
  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing order_id parameter"
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
    const response = await fetch(`https://api.lemonsqueezy.com/v1/orders/${orderId}`, {
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
        statusMessage: "Failed to fetch order from Lemon Squeezy"
      });
    }
    const data = await response.json();
    const status = data.data?.attributes?.status;
    if (status === "paid") {
      return { success: true };
    } else {
      return { success: false, status };
    }
  } catch (error) {
    console.error("Error verifying order:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal Server Error"
    });
  }
});
export {
  verifyOrder_get as default
};
