import { getSquareBaseUrl, json } from '../_square.js';

const fetchJson = async (url, accessToken) => {
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      'square-version': '2026-01-22',
    },
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

  const baseUrl = getSquareBaseUrl(env.SQUARE_ENVIRONMENT);

  const [locationsResult, catalogResult] = await Promise.all([
    fetchJson(`${baseUrl}/v2/locations`, env.SQUARE_ACCESS_TOKEN),
    fetchJson(`${baseUrl}/v2/catalog/list?types=ITEM`, env.SQUARE_ACCESS_TOKEN),
  ]);

  return json(
    {
      environment: env.SQUARE_ENVIRONMENT || 'sandbox',
      configuredLocationId: env.SQUARE_LOCATION_ID || null,
      locations: locationsResult.ok
        ? (locationsResult.payload?.locations || []).map((location) => ({
            id: location.id,
            name: location.name,
            status: location.status,
          }))
        : [],
      catalogCount: catalogResult.ok ? (catalogResult.payload?.objects || []).length : 0,
      catalogNames: catalogResult.ok
        ? (catalogResult.payload?.objects || [])
            .filter((object) => object.type === 'ITEM' && !object.is_deleted && !object.item_data?.is_archived)
            .map((object) => object.item_data?.name)
            .filter(Boolean)
        : [],
      locationsRequest: {
        ok: locationsResult.ok,
        status: locationsResult.status,
      },
      catalogRequest: {
        ok: catalogResult.ok,
        status: catalogResult.status,
      },
    },
    {
      headers: {
        'cache-control': 'no-store',
      },
    }
  );
};
