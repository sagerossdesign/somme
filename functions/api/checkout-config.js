import { json } from './_square.js';

export const onRequestGet = async ({ env }) => {
  const applicationId = env.SQUARE_APPLICATION_ID || env.SQUARE_APP_ID || null;
  const locationId = env.SQUARE_LOCATION_ID || null;
  const environment = env.SQUARE_ENVIRONMENT || 'sandbox';

  if (!applicationId || !locationId) {
    return json(
      {
        error: 'Square checkout config is incomplete.',
        code: 'missing_square_checkout_config',
        missing: {
          applicationId: !applicationId,
          locationId: !locationId,
        },
      },
      { status: 503 }
    );
  }

  return json(
    {
      applicationId,
      locationId,
      environment,
    },
    {
      headers: {
        'cache-control': 'no-store',
      },
    }
  );
};
