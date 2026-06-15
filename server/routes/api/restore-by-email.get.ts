import { defineHandler } from "nitro";
import { getQuery, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const query = getQuery(event);
  const email = query.email;

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing email parameter",
    });
  }

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Server configuration error",
    });
  }

  try {
    // Query Lemon Squeezy orders filtered by email
    const response = await fetch(`https://api.lemonsqueezy.com/v1/orders?filter[user_email]=${encodeURIComponent(String(email))}`, {
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
        statusMessage: "Failed to query orders from Lemon Squeezy",
      });
    }

    const data = await response.json();
    const orders = data.data || [];

    // Check if there is any paid order
    const hasPaidOrder = orders.some((order: any) => order.attributes?.status === "paid");

    if (hasPaidOrder) {
      return { success: true };
    } else {
      return { success: false, message: "No paid orders found for this email" };
    }
  } catch (error: any) {
    console.error("Error restoring purchase by email:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
