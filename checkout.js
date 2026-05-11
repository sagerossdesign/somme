import {
  formatCurrency,
  getCartState,
  getCartSubtotal,
  setCartState,
} from './foundation/shared/scripts/cart-state.js';

const createElement = (tag, className, text) => {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
};

const buildCartItems = (items = []) => {
  const list = createElement('div', 'checkout-items');

  items.forEach((item) => {
    const row = createElement('article', 'checkout-item');
    const image = document.createElement('img');
    image.className = 'checkout-item-image';
    image.src = item.imageSrc;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');

    const copy = createElement('div', 'checkout-item-copy');
    const title = createElement('p', 'checkout-item-name', item.name || item.slug || 'blend');
    const meta = createElement(
      'p',
      'checkout-item-meta',
      `${item.quantity || 1} × ${formatCurrency(item.priceAmount, item.currencyCode) || item.priceFormatted || ''}`
    );

    copy.append(title, meta);
    row.append(image, copy);
    list.append(row);
  });

  return list;
};

const setStatus = (node, message, tone = '') => {
  node.textContent = message || '';

  if (tone) {
    node.dataset.tone = tone;
  } else {
    delete node.dataset.tone;
  }
};

const loadCheckoutConfig = async () => {
  const response = await fetch('/api/checkout-config', {
    headers: {
      accept: 'application/json',
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || 'checkout config unavailable');
  }

  return payload;
};

const mountCheckout = async () => {
  const root = document.querySelector('#app');

  if (!root) {
    throw new Error('Expected checkout root.');
  }

  const cart = getCartState();
  const items = cart.items || [];
  const subtotal = getCartSubtotal(cart);
  const currencyCode = items.find((item) => item.currencyCode)?.currencyCode || 'USD';

  const page = createElement('main', 'checkout-page');
  const header = createElement('header', 'checkout-header');
  const homeLink = createElement('a', 'checkout-home', 'sōmme');
  homeLink.href = '/';
  const backLink = createElement('a', 'checkout-back', 'back to tea');
  backLink.href = '/products/sensual.html';
  header.append(homeLink, backLink);

  const shell = createElement('div', 'checkout-shell');
  const paymentPanel = createElement('section', 'checkout-panel');
  const summaryPanel = createElement('aside', 'checkout-panel checkout-summary');

  const kicker = createElement('p', 'checkout-kicker', 'checkout');
  const title = createElement('h1', 'checkout-title', 'complete your ritual');
  const body = createElement(
    'p',
    'checkout-muted',
    'your card details stay inside Square’s secure payment fields while the rest of the experience stays on-site.'
  );
  const copy = createElement('div', 'checkout-copy');
  copy.append(kicker, title, body);

  const status = createElement('p', 'checkout-status');

  paymentPanel.append(copy, status);

  if (!items.length) {
    const empty = createElement('div', 'checkout-empty');
    const emptyTitle = createElement('p', 'checkout-section-title', 'your cart is empty');
    const emptyBody = createElement(
      'p',
      'checkout-muted',
      'add a blend before opening checkout.'
    );
    const emptyLink = createElement('a', 'checkout-link', 'browse tea');
    emptyLink.href = '/products/sensual.html';
    empty.append(emptyTitle, emptyBody, emptyLink);
    paymentPanel.append(empty);
    shell.append(paymentPanel);
    page.append(header, shell);
    root.replaceChildren(page);
    return;
  }

  const form = createElement('form', 'checkout-form');
  form.noValidate = true;

  const emailField = createElement('label', 'checkout-field');
  const emailLabel = createElement('span', 'checkout-label', 'email');
  const emailInput = document.createElement('input');
  emailInput.className = 'checkout-input';
  emailInput.type = 'email';
  emailInput.name = 'email';
  emailInput.autocomplete = 'email';
  emailInput.required = true;
  emailField.append(emailLabel, emailInput);

  const cardField = createElement('label', 'checkout-field');
  const cardLabel = createElement('span', 'checkout-label', 'card');
  const cardContainer = createElement('div');
  cardContainer.id = 'card-container';
  cardField.append(cardLabel, cardContainer);

  const submit = createElement(
    'button',
    'checkout-submit',
    `pay ${formatCurrency(subtotal, currencyCode) || ''}`
  );
  submit.type = 'submit';
  submit.disabled = true;

  form.append(emailField, cardField, submit);
  paymentPanel.append(form);

  const summaryTitle = createElement('h2', 'checkout-section-title', 'order summary');
  const summaryNote = createElement(
    'p',
    'checkout-muted',
    'taxes and any Square-side adjustments will finalize during payment.'
  );
  const totalRow = createElement('div', 'checkout-summary-total');
  totalRow.append(
    createElement('p', 'checkout-total-label', 'subtotal'),
    createElement('p', 'checkout-total-value', formatCurrency(subtotal, currencyCode) || '')
  );
  summaryPanel.append(summaryTitle, summaryNote, buildCartItems(items), totalRow);

  shell.append(paymentPanel, summaryPanel);
  page.append(header, shell);
  root.replaceChildren(page);

  try {
    if (!window.Square) {
      throw new Error('Square Web Payments SDK did not load.');
    }

    const config = await loadCheckoutConfig();
    const payments = window.Square.payments(config.applicationId, config.locationId);
    const card = await payments.card();
    await card.attach('#card-container');
    submit.disabled = false;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!emailInput.reportValidity()) {
        return;
      }

      submit.disabled = true;
      submit.textContent = 'processing';
      setStatus(status, '');

      try {
        const tokenResult = await card.tokenize();

        if (tokenResult.status !== 'OK') {
          throw new Error('Card details could not be tokenized.');
        }

        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({
            sourceId: tokenResult.token,
            buyerEmail: emailInput.value.trim(),
            items,
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || 'Payment failed.');
        }

        setCartState({ items: [] });
        setStatus(
          status,
          'payment received. your order is complete.',
          'success'
        );
        form.remove();

        if (payload.receiptUrl) {
          const receiptLink = createElement('a', 'checkout-link', 'view receipt');
          receiptLink.href = payload.receiptUrl;
          receiptLink.target = '_blank';
          receiptLink.rel = 'noreferrer';
          paymentPanel.append(receiptLink);
        }
      } catch (error) {
        setStatus(
          status,
          error?.message || 'checkout unavailable right now.',
          'error'
        );
        submit.disabled = false;
        submit.textContent = `pay ${formatCurrency(subtotal, currencyCode) || ''}`;
      }
    });
  } catch (error) {
    setStatus(
      status,
      error?.message || 'checkout unavailable right now.',
      'error'
    );
  }
};

mountCheckout();
