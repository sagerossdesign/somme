const SQUARE_VERSION = '2026-01-21';

const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
    status: init.status || 200,
  });

const getSquareBaseUrl = (environment = 'sandbox') =>
  environment === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';

export const onRequestPost = async ({ env, request }) => {
  if (!env.SQUARE_ACCESS_TOKEN) {
    return json(
      {
        error: 'Square access token is not configured.',
        code: 'missing_square_access_token',
      },
      { status: 503 }
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    return json(
      {
        error: 'Invalid checkout payload.',
        code: 'invalid_checkout_payload',
      },
      { status: 400 }
    );
  }

  const items = Array.isArray(payload?.items) ? payload.items : [];

  if (!items.length) {
    return json(
      {
        error: 'Cart is empty.',
        code: 'empty_cart',
      },
      { status: 400 }
    );
  }

  const locationId = env.SQUARE_LOCATION_ID || items.find((item) => item.locationId)?.locationId;

  if (!locationId) {
    return json(
      {
        error: 'Square location id is not configured.',
        code: 'missing_square_location_id',
      },
      { status: 503 }
    );
  }

  const lineItems = items.map((item) => ({
    quantity: String(item.quantity || 1),
    catalog_object_id: item.variationId,
  }));

  if (lineItems.some((item) => !item.catalog_object_id)) {
    return json(
      {
        error: 'One or more cart items are missing Square variation ids.',
        code: 'missing_square_variation_id',
      },
      { status: 400 }
    );
  }

  const checkoutResponse = await fetch(
    `${getSquareBaseUrl(env.SQUARE_ENVIRONMENT)}/v2/online-checkout/payment-links`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
        'content-type': 'application/json',
        'square-version': SQUARE_VERSION,
      },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        quick_pay: undefined,
        order: {
          location_id: locationId,
          line_items: lineItems,
        },
        checkout_options: {
          redirect_url: env.SQUARE_CHECKOUT_REDIRECT_URL || new URL(request.url).origin,
        },
      }),
    }
  );

  if (!checkoutResponse.ok) {
    const details = await checkoutResponse.text();
    return json(
      {
        error: 'Square checkout request failed.',
        code: 'square_checkout_request_failed',
        details,
      },
      { status: checkoutResponse.status }
    );
  }

  const checkoutPayload = await checkoutResponse.json();

  return json({
    checkoutUrl:
      checkoutPayload.payment_link?.url ||
      checkoutPayload.related_resources?.payment_link?.url ||
      null,
    orderId: checkoutPayload.payment_link?.order_id || null,
  });
};
