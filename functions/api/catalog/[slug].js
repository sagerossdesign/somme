import { productSlugAliases, products } from '../../../sites/somme/products/product-data.js';
import {
  formatMoney,
  getLocationOverride,
  getSquareBaseUrl,
  getVariationInventory,
  getVariationPrice,
  json,
  listCatalogObjects,
  normalizeText,
} from '../_square.js';

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
  const sellable = variationData.sellable !== false;
  const available = !sellable
    ? false
    : soldOut
      ? false
      : trackInventory && inStockCount !== null
        ? inStockCount > 0
        : true;

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
    sellable,
    soldOut,
    trackInventory,
    inStockCount,
  };
};

export const onRequestGet = async ({ env, params }) => {
  const slug = productSlugAliases[params.slug] || params.slug;
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

  const catalogName = entry.square?.catalogName || entry.product?.name || slug;
  const baseUrl = getSquareBaseUrl(env.SQUARE_ENVIRONMENT);
  let objects;

  try {
    objects = await listCatalogObjects({
      baseUrl,
      accessToken: env.SQUARE_ACCESS_TOKEN,
      types: ['ITEM'],
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

  const items = objects.filter((object) => object.type === 'ITEM');
  const match = findCatalogItemByExactName(items, catalogName);

  if (!match) {
    return json(
      {
        error: `No Square catalog item matched "${catalogName}".`,
        code: 'square_catalog_item_not_found',
        requestedSlug: params.slug,
        resolvedSlug: slug,
        requestedName: catalogName,
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
