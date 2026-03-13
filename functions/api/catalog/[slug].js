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

const listCatalogItems = async ({ baseUrl, accessToken }) => {
  let cursor;
  const items = [];

  do {
    const query = new URLSearchParams({
      types: 'ITEM',
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
    items.push(...(payload.objects || []));
    cursor = payload.cursor;
  } while (cursor);

  return items;
};

const findCatalogItemByExactName = (items, lookup) => {
  const normalizedLookup = normalizeText(lookup);

  return items.find((item) => {
    if (item.type !== 'ITEM' || item.is_deleted || item.item_data?.is_archived) {
      return false;
    }

    return normalizeText(item.item_data?.name) === normalizedLookup;
  }) || null;
};

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
  let items;

  try {
    items = await listCatalogItems({
      baseUrl,
      accessToken: env.SQUARE_ACCESS_TOKEN,
    });
  } catch (error) {
    return json(
      {
        error: 'Square catalog request failed.',
        code: 'square_catalog_request_failed',
        details: error.message,
      },
      { status: 502 }
    );
  }

  const match = findCatalogItemByExactName(items, searchTerm);

  if (!match) {
    return json(
      {
        error: `No Square catalog item matched "${searchTerm}".`,
        code: 'square_catalog_item_not_found',
        requestedName: searchTerm,
        availableNames: items
          .filter((item) => item.type === 'ITEM' && !item.is_deleted && !item.item_data?.is_archived)
          .map((item) => item.item_data?.name)
          .filter(Boolean)
          .slice(0, 50),
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
