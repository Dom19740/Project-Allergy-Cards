import { defineHandler } from "nitro";
import { getQuery, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const query = getQuery(event);
  const orderId = query.order_id;

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing order_id parameter",
    });
  }

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Lemon Squeezy API key is not configured on the server",
    });
  }

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