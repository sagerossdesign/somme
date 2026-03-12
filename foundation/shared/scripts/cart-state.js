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
