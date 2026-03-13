import {
  formatMoney,
  getSquareBaseUrl,
  getVariationPrice,
  json,
  listCatalogObjects,
  normalizeText,
} from './_square.js';

const buildImageMap = (objects) =>
  new Map(
    objects
      .filter((object) => object.type === 'IMAGE' && !object.is_deleted)
      .map((image) => [image.id, image.image_data?.url || null])
  );

const normalizeCatalogProducts = (objects) => {
  const imageMap = buildImageMap(objects);
  const items = objects.filter(
    (object) => object.type === 'ITEM' && !object.is_deleted && !object.item_data?.is_archived
  );

  return items.map((item) => {
    const variation = getVariationPrice(item);
    const priceMoney = variation?.item_variation_data?.price_money;
    const imageIds = item.item_data?.image_ids || [];

    return {
      id: item.id,
      name: item.item_data?.name || '',
      normalizedName: normalizeText(item.item_data?.name || ''),
      description: item.item_data?.description || '',
      imageIds,
      images: imageIds.map((imageId) => imageMap.get(imageId)).filter(Boolean),
      variationIds: (item.item_data?.variations || []).map((entry) => entry.id),
      primaryVariationId: variation?.id || null,
      priceAmount: priceMoney?.amount ?? null,
      currencyCode: priceMoney?.currency ?? null,
      priceFormatted: formatMoney(priceMoney?.amount, priceMoney?.currency),
      sellable: Boolean(variation?.item_variation_data?.sellable),
      trackInventory: Boolean(variation?.item_variation_data?.track_inventory),
    };
  });
};

export const onRequestGet = async ({ env }) => {
  if (!env.SQUARE_ACCESS_TOKEN) {
    return json(
      {
        error: 'Square access token is not configured.',
        code: 'missing_square_access_token',
      },
      { status: 503 }
    );
  }

  try {
    const objects = await listCatalogObjects({
      baseUrl: getSquareBaseUrl(env.SQUARE_ENVIRONMENT),
      accessToken: env.SQUARE_ACCESS_TOKEN,
      types: ['ITEM', 'IMAGE'],
    });
    const products = normalizeCatalogProducts(objects);

    return json(
      {
        count: products.length,
        names: products.map((product) => product.name),
        products,
      },
      {
        headers: {
          'cache-control': 'public, max-age=60, s-maxage=300',
        },
      }
    );
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
};
