import { SQUARE_VERSION, getSquareBaseUrl, json } from './_square.js';

const postSquareJson = async (url, accessToken, body) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      'square-version': SQUARE_VERSION,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text || null;
  }

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
};

const normalizeLineItems = (items = []) =>
  items
    .map((item) => ({
      quantity: String(Math.max(1, Number(item.quantity || 1))),
      catalog_object_id: item.variationId || '',
    }))
    .filter((item) => item.catalog_object_id);

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
  } catch {
    return json(
      {
        error: 'Invalid checkout payload.',
        code: 'invalid_checkout_payload',
      },
      { status: 400 }
    );
  }

  const sourceId = payload?.sourceId || '';
  const verificationToken = payload?.verificationToken || undefined;
  const buyerEmail = payload?.buyerEmail || undefined;
  const items = Array.isArray(payload?.items) ? payload.items : [];

  if (!sourceId) {
    return json(
      {
        error: 'Missing Square payment source.',
        code: 'missing_square_source_id',
      },
      { status: 400 }
    );
  }

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

  const lineItems = normalizeLineItems(items);

  if (!lineItems.length || lineItems.length !== items.length) {
    return json(
      {
        error: 'One or more cart items are missing Square variation ids.',
        code: 'missing_square_variation_id',
      },
      { status: 400 }
    );
  }

  const baseUrl = getSquareBaseUrl(env.SQUARE_ENVIRONMENT);
  const orderResult = await postSquareJson(`${baseUrl}/v2/orders`, env.SQUARE_ACCESS_TOKEN, {
    idempotency_key: crypto.randomUUID(),
    order: {
      location_id: locationId,
      line_items: lineItems,
    },
  });

  if (!orderResult.ok) {
    return json(
      {
        error: 'Square order creation failed.',
        code: 'square_order_creation_failed',
        details: orderResult.payload,
      },
      { status: orderResult.status }
    );
  }

  const order = orderResult.payload?.order;
  const amountMoney = order?.net_amount_due_money || order?.total_money || null;

  if (!order?.id || typeof amountMoney?.amount !== 'number' || !amountMoney?.currency) {
    return json(
      {
        error: 'Square order total was unavailable.',
        code: 'square_order_total_unavailable',
        details: orderResult.payload,
      },
      { status: 502 }
    );
  }

  const paymentResult = await postSquareJson(`${baseUrl}/v2/payments`, env.SQUARE_ACCESS_TOKEN, {
    idempotency_key: crypto.randomUUID(),
    source_id: sourceId,
    location_id: locationId,
    order_id: order.id,
    amount_money: amountMoney,
    autocomplete: true,
    verification_token: verificationToken,
    buyer_email_address: buyerEmail,
  });

  if (!paymentResult.ok) {
    return json(
      {
        error: 'Square payment request failed.',
        code: 'square_payment_request_failed',
        details: paymentResult.payload,
      },
      { status: paymentResult.status }
    );
  }

  return json({
    success: true,
    orderId: order.id,
    paymentId: paymentResult.payload?.payment?.id || null,
    receiptUrl: paymentResult.payload?.payment?.receipt_url || null,
  });
};
