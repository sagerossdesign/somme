export const CART_STORAGE_KEY = 'somme-cart';
export const CART_UI_STORAGE_KEY = 'somme-cart-ui';

export const getCartState = () => {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!raw) {
      return { items: [] };
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed.items)) {
      return { items: [] };
    }

    return parsed;
  } catch (error) {
    return { items: [] };
  }
};

export const setCartState = (state) => {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('somme:cart-updated', { detail: state }));
};

export const getCartCount = (state = getCartState()) =>
  state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

export const formatCurrency = (amount, currencyCode) => {
  if (!amount || !currencyCode) {
    return null;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(Number(amount) / 100);
};

export const getCartSubtotal = (state = getCartState()) =>
  state.items.reduce((sum, item) => {
    const amount = Number(item.priceAmount || 0);
    const quantity = Number(item.quantity || 0);
    return sum + amount * quantity;
  }, 0);

export const getCartUiState = () => {
  try {
    const raw = window.localStorage.getItem(CART_UI_STORAGE_KEY);

    if (!raw) {
      return { isOpen: false };
    }

    const parsed = JSON.parse(raw);
    return {
      isOpen: Boolean(parsed.isOpen),
    };
  } catch (error) {
    return { isOpen: false };
  }
};

export const setCartUiState = (state) => {
  const normalized = {
    isOpen: Boolean(state?.isOpen),
  };

  window.localStorage.setItem(CART_UI_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent('somme:cart-ui-updated', { detail: normalized }));
};

export const syncCartItemMetadata = (payload = {}) => {
  const state = getCartState();
  let hasChanges = false;

  state.items = state.items.map((item) => {
    const matchesVariation =
      payload.variationId && item.variationId && item.variationId === payload.variationId;
    const matchesSlug = payload.slug && item.slug === payload.slug;

    if (!matchesVariation && !matchesSlug) {
      return item;
    }

    hasChanges = true;

    return {
      ...item,
      name: payload.name || item.name,
      itemId: payload.itemId || item.itemId,
      variationId: payload.variationId || item.variationId,
      locationId: payload.locationId || item.locationId,
      priceAmount:
        payload.priceAmount !== undefined && payload.priceAmount !== null
          ? String(payload.priceAmount)
          : item.priceAmount,
      currencyCode: payload.currencyCode || item.currencyCode,
      priceFormatted: payload.priceFormatted || item.priceFormatted,
      imageSrc: payload.imageSrc || item.imageSrc,
    };
  });

  if (hasChanges) {
    setCartState(state);
  }
};

const catalogRefreshes = new Map();

export const refreshMissingCartMetadata = async () => {
  const state = getCartState();
  const staleItems = state.items.filter(
    (item) => item.slug && (!item.priceAmount || !item.currencyCode || !item.variationId)
  );

  if (!staleItems.length) {
    return;
  }

  const uniqueSlugs = [...new Set(staleItems.map((item) => item.slug))];

  await Promise.all(
    uniqueSlugs.map(async (slug) => {
      if (catalogRefreshes.has(slug)) {
        return catalogRefreshes.get(slug);
      }

      const refreshPromise = fetch(`/api/catalog/${slug}`, {
        headers: {
          accept: 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            return null;
          }

          return response.json();
        })
        .then((payload) => {
          const product = payload?.product;

          if (!product) {
            return;
          }

          syncCartItemMetadata({
            slug,
            name: product.itemName,
            itemId: product.itemId,
            variationId: product.variationId,
            locationId: product.locationId,
            priceAmount: product.priceAmount,
            currencyCode: product.currencyCode,
            priceFormatted: product.priceFormatted,
          });
        })
        .finally(() => {
          catalogRefreshes.delete(slug);
        });

      catalogRefreshes.set(slug, refreshPromise);
      return refreshPromise;
    })
  );
};
