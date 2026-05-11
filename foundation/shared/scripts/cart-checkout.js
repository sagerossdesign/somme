import { getCartCount, getCartState } from './cart-state.js';

export const startSquareCheckout = async (button) => {
  if (!button || getCartCount() === 0) {
    return;
  }

  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = 'processing';

  try {
    if (!getCartState().items.length) {
      throw new Error('cart is empty');
    }

    window.location.href = '/checkout.html';
  } catch (error) {
    button.textContent = 'checkout unavailable';
    window.setTimeout(() => {
      button.textContent = originalLabel;
      button.disabled = false;
    }, 1400);
    return;
  }

  button.textContent = originalLabel;
};
