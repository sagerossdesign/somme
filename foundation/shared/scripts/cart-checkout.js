import { getCartCount, getCartState } from './cart-state.js';

export const startSquareCheckout = async (button) => {
  if (!button || getCartCount() === 0) {
    return;
  }

  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = 'processing';

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        items: getCartState().items,
      }),
    });

    if (!response.ok) {
      throw new Error('checkout request failed');
    }

    const payload = await response.json();

    if (!payload.checkoutUrl) {
      throw new Error('checkout url missing');
    }

    window.location.href = payload.checkoutUrl;
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
