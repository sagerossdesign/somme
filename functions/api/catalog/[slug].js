import { products } from '../../../sites/somme/products/product-data.js';

const SQUARE_VERSION = '2026-01-22';

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

const normalizeText = (value = '') => value.trim().toLowerCase();

const formatMoney = (amount, currencyCode) => {
  if (typeof amount !== 'number' || !currencyCode) {
    return null;
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  });

  return formatter.format(amount / 100);
};

const getVariationPrice = (item = {}) => {
  const variations = item.item_data?.variations || [];
  const pricedVariation = variations.find(
    (variation) => typeof variation.item_variation_data?.price_money?.amount === 'number'
  );

  return pricedVariation || variations[0] || null;
};

const getLocationOverride = (variation = {}, locationId) => {
  const overrides = variation.item_variation_data?.location_overrides || [];

  if (!locationId) {
    return overrides[0] || null;
  }

  return overrides.find((override) => override.location_id === locationId) || null;
};

const getVariationInventory = async ({
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

const scoreItem = (item, lookup) => {
  const itemName = normalizeText(item.item_data?.name);

  if (itemName === lookup) {
    return 3;
  }

  if (itemName.startsWith(lookup)) {
    return 2;
  }

  if (itemName.includes(lookup)) {
    return 1;
  }

  return 0;
};

const selectBestMatch = (items, lookup) =>
  [...items]
    .map((item) => ({ item, score: scoreItem(item, lookup) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)[0]?.item || null;

const normalizeCatalogItem = async (slug, item, locationId, env) => {
  const variation = getVariationPrice(item);
  const priceMoney = variation?.item_variation_data?.price_money;
  const variationData = variation?.item_variation_data || {};
  const locationOverride = getLocationOverride(variation, locationId);
  const inventoryCounts = await getVariationInventory({
    baseUrl: getSquareBaseUrl(env.SQUARE_ENVIRONMENT),
    accessToken: env.SQUARE_ACCESS_TOKEN,
    locationId,
    variationId: variation?.id,
  });
  const inStockCount = inventoryCounts
    ? inventoryCounts
        .filter((count) => count.state === 'IN_STOCK')
        .reduce((sum, count) => sum + Number(count.quantity || 0), 0)
    : null;
  const soldOut = Boolean(locationOverride?.sold_out);
  const trackInventory = Boolean(
    locationOverride?.track_inventory ?? variationData.track_inventory
  );
  const available = soldOut ? false : trackInventory && inStockCount !== null ? inStockCount > 0 : true;

  return {
    slug,
    itemId: item.id,
    itemName: item.item_data?.name || slug,
    itemDescription: item.item_data?.description || '',
    variationId: variation?.id || null,
    variationName: variation?.item_variation_data?.name || null,
    priceAmount: priceMoney?.amount ?? null,
    currencyCode: priceMoney?.currency ?? null,
    priceFormatted: formatMoney(priceMoney?.amount, priceMoney?.currency),
    locationId: locationId || null,
    available,
    soldOut,
    trackInventory,
    inStockCount,
  };
};

export const onRequestGet = async ({ env, params }) => {
  const slug = params.slug;
  const entry = products[slug];

  if (!entry) {
    return json({ error: 'Unknown product slug.' }, { status: 404 });
  }

  if (!env.SQUARE_ACCESS_TOKEN) {
    return json(
      {
        error: 'Square access token is not configured.',
        code: 'missing_square_access_token',
      },
      { status: 503 }
    );
  }

  const searchTerm = entry.square?.searchTerm || entry.product?.name || slug;
  const baseUrl = getSquareBaseUrl(env.SQUARE_ENVIRONMENT);

  const response = await fetch(`${baseUrl}/v2/catalog/search-catalog-items`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
      'content-type': 'application/json',
      'square-version': SQUARE_VERSION,
    },
    body: JSON.stringify({
      text_filter: searchTerm,
      archived_state: 'ARCHIVED_STATE_NOT_ARCHIVED',
      limit: 10,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    return json(
      {
        error: 'Square catalog request failed.',
        code: 'square_catalog_request_failed',
        details: errorText,
      },
      { status: response.status }
    );
  }

  const payload = await response.json();
  const items = payload.items || [];
  const match = selectBestMatch(items, normalizeText(searchTerm));

  if (!match) {
    return json(
      {
        error: `No Square catalog item matched "${searchTerm}".`,
        code: 'square_catalog_item_not_found',
      },
      { status: 404 }
    );
  }

  return json(
    {
      product: await normalizeCatalogItem(slug, match, env.SQUARE_LOCATION_ID, env),
    },
    {
      headers: {
        'cache-control': 'public, max-age=60, s-maxage=300',
      },
    }
  );
};
