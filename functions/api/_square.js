const SQUARE_VERSION = '2026-01-22';

export const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
    status: init.status || 200,
  });

export const getSquareBaseUrl = (environment = 'sandbox') =>
  environment === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';

export const normalizeText = (value = '') => value.trim().toLowerCase();

export const formatMoney = (amount, currencyCode) => {
  if (typeof amount !== 'number' || !currencyCode) {
    return null;
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  });

  return formatter.format(amount / 100);
};

export const getVariationPrice = (item = {}) => {
  const variations = item.item_data?.variations || [];
  const pricedVariation = variations.find(
    (variation) => typeof variation.item_variation_data?.price_money?.amount === 'number'
  );

  return pricedVariation || variations[0] || null;
};

export const getLocationOverride = (variation = {}, locationId) => {
  const overrides = variation.item_variation_data?.location_overrides || [];

  if (!locationId) {
    return overrides[0] || null;
  }

  return overrides.find((override) => override.location_id === locationId) || null;
};

export const listCatalogObjects = async ({ baseUrl, accessToken, types = ['ITEM'] }) => {
  let cursor;
  const objects = [];

  do {
    const query = new URLSearchParams({
      types: types.join(','),
    });

    if (cursor) {
      query.set('cursor', cursor);
    }

    const response = await fetch(`${baseUrl}/v2/catalog/list?${query.toString()}`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'square-version': SQUARE_VERSION,
      },
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || 'catalog_list_failed');
    }

    const payload = await response.json();
    objects.push(...(payload.objects || []));
    cursor = payload.cursor;
  } while (cursor);

  return objects;
};

export const getVariationInventory = async ({
  baseUrl,
  accessToken,
  locationId,
  variationId,
}) => {
  if (!variationId || !locationId) {
    return null;
  }

  const response = await fetch(
    `${baseUrl}/v2/inventory/${variationId}?location_ids=${encodeURIComponent(locationId)}`,
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'square-version': SQUARE_VERSION,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return payload.counts || [];
};
