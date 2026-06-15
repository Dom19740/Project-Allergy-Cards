import { defineHandler } from "nitro";
import { createError, getQuery } from "nitro/h3";

export default defineHandler(async (event) => {
  const query = getQuery(event);
  const orderId = query.order_id;
  const verificationToken = query.verification_token;

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing order_id parameter",
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
    const response = await fetch(`https://api.lemonsqueezy.com/v1/orders/${orderId}`, {
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
    const status = data.data?.attributes?.status;
    const orderVerificationToken = data.data?.attributes?.first_order_item?.variant_id?.toString?.();

    if (status === "paid" && orderVerificationToken === verificationToken) {
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

    console.error("Error verifying order:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
