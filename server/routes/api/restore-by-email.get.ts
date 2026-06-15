import { defineHandler } from "nitro";
import { createError, getQuery } from "nitro/h3";

export default defineHandler(async (event) => {
  const query = getQuery(event);
  const email = query.email;
  const verificationToken = query.verification_token;

  if (!email || typeof email !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing email parameter",
    });
  }

  if (!verificationToken || typeof verificationToken !== "string") {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
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
    const response = await fetch(`https://api.lemonsqueezy.com/v1/orders?filter[user_email]=${encodeURIComponent(email)}`, {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw createError({
        statusCode: 400,
        statusMessage: "Unable to verify purchase",
      });
    }

    const data = await response.json();
    const orders = data.data || [];
    const matchingOrder = orders.find((order: any) => {
      const orderToken = order.attributes?.first_order_item?.variant_id?.toString?.();
      return order.attributes?.status === "paid" && orderToken === verificationToken;
    });

    if (matchingOrder) {
      return { success: true };
    }

    throw createError({
      statusCode: 403,
      statusMessage: "Purchase not verified",
    });
  } catch (error: any) {
    if (error?.statusCode) {
      throw error;
    }

    console.error("Error restoring purchase by email:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
