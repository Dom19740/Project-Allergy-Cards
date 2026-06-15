import { defineHandler } from "nitro";
import { createError, getCookie, getQuery } from "nitro/h3";

const PURCHASE_VERIFICATION_COOKIE = "purchase_verification_token";

export default defineHandler(async (event) => {
  const token = getCookie(event, PURCHASE_VERIFICATION_COOKIE);
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

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
    const response = await fetch(`https://api.lemonsqueezy.com/v1/orders?filter[user_email]=${encodeURIComponent(String(email))}`, {
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${apiKey}`,
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
    const hasPaidOrder = orders.some((order: any) => order.attributes?.status === "paid");

    if (hasPaidOrder) {
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
