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
    if (payload?.code === 'missing_square_checkout_config' && payload?.missing) {
      const missing = Object.entries(payload.missing)
        .filter(([, isMissing]) => Boolean(isMissing))
        .map(([key]) => key)
        .join(', ');
      throw new Error(
        missing
          ? `Square checkout config is incomplete: missing ${missing}.`
          : payload.error || 'checkout config unavailable'
      );
    }

    throw new Error(payload?.error || 'checkout config unavailable');
  }

  return payload;
};

const createField = ({
  label,
  name,
  type = 'text',
  autocomplete,
  required = true,
  placeholder = '',
}) => {
  const field = createElement('label', 'checkout-field');
  const labelNode = createElement('span', 'checkout-label', label);
  const input = document.createElement('input');
  input.className = 'checkout-input';
  input.type = type;
  input.name = name;
  input.placeholder = placeholder;
  input.required = required;

  if (autocomplete) {
    input.autocomplete = autocomplete;
  }

  field.append(labelNode, input);
  return { field, input };
};

const createSelectField = ({ label, name, options = [], required = true }) => {
  const field = createElement('label', 'checkout-field');
  const labelNode = createElement('span', 'checkout-label', label);
  const select = document.createElement('select');
  select.className = 'checkout-input checkout-select';
  select.name = name;
  select.required = required;

  options.forEach(({ value, label: optionLabel }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = optionLabel;
    select.append(option);
  });

  field.append(labelNode, select);
  return { field, select };
};

const buildBillingContact = (values) => ({
  givenName: values.firstName,
  familyName: values.lastName,
  email: values.email,
  phone: values.phone,
  addressLines: [values.addressLine1, values.addressLine2].filter(Boolean),
  city: values.city,
  state: values.state,
  postalCode: values.postalCode,
  countryCode: values.country,
});

const collectFormValues = (refs) => ({
  firstName: refs.firstName.value.trim(),
  lastName: refs.lastName.value.trim(),
  email: refs.email.value.trim(),
  phone: refs.phone.value.trim(),
  addressLine1: refs.addressLine1.value.trim(),
  addressLine2: refs.addressLine2.value.trim(),
  city: refs.city.value.trim(),
  state: refs.state.value.trim(),
  postalCode: refs.postalCode.value.trim(),
  country: refs.country.value,
});

const formatPaymentAmount = (amount, currencyCode) => {
  if (typeof amount !== 'number' || !currencyCode) {
    return null;
  }

  const zeroDecimalCurrencies = new Set(['JPY']);
  return zeroDecimalCurrencies.has(currencyCode)
    ? String(amount)
    : (amount / 100).toFixed(2);
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
  const paymentPanel = createElement('section', 'checkout-panel checkout-payment-panel');
  const summaryPanel = createElement('aside', 'checkout-panel checkout-summary');

  const kicker = createElement('p', 'checkout-kicker', 'checkout');
  const title = createElement('h1', 'checkout-title', 'checkout');
  const body = createElement(
    'p',
    'checkout-muted',
    'enter your details, shipping address, and payment information to complete your order.'
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

  const customerSection = createElement('section', 'checkout-section');
  customerSection.append(
    createElement('h2', 'checkout-section-title', 'personal information')
  );
  const customerGrid = createElement('div', 'checkout-grid checkout-grid-two');
  const { field: firstNameField, input: firstNameInput } = createField({
    label: 'first name',
    name: 'firstName',
    autocomplete: 'given-name',
  });
  const { field: lastNameField, input: lastNameInput } = createField({
    label: 'last name',
    name: 'lastName',
    autocomplete: 'family-name',
  });
  const { field: emailField, input: emailInput } = createField({
    label: 'email',
    name: 'email',
    type: 'email',
    autocomplete: 'email',
  });
  const { field: phoneField, input: phoneInput } = createField({
    label: 'phone',
    name: 'phone',
    type: 'tel',
    autocomplete: 'tel',
  });
  customerGrid.append(firstNameField, lastNameField, emailField, phoneField);
  customerSection.append(customerGrid);

  const shippingSection = createElement('section', 'checkout-section');
  shippingSection.append(
    createElement('h2', 'checkout-section-title', 'shipping address')
  );
  const shippingGrid = createElement('div', 'checkout-grid checkout-grid-two');
  const { field: addressLine1Field, input: addressLine1Input } = createField({
    label: 'address line 1',
    name: 'addressLine1',
    autocomplete: 'shipping address-line1',
  });
  const { field: addressLine2Field, input: addressLine2Input } = createField({
    label: 'address line 2',
    name: 'addressLine2',
    autocomplete: 'shipping address-line2',
    required: false,
  });
  const { field: cityField, input: cityInput } = createField({
    label: 'city',
    name: 'city',
    autocomplete: 'shipping address-level2',
  });
  const { field: stateField, input: stateInput } = createField({
    label: 'province / state',
    name: 'state',
    autocomplete: 'shipping address-level1',
  });
  const { field: postalCodeField, input: postalCodeInput } = createField({
    label: 'postal code',
    name: 'postalCode',
    autocomplete: 'shipping postal-code',
  });
  const { field: countryField, select: countrySelect } = createSelectField({
    label: 'country',
    name: 'country',
    options: [
      { value: 'CA', label: 'Canada' },
      { value: 'US', label: 'United States' },
    ],
  });
  shippingGrid.append(
    addressLine1Field,
    addressLine2Field,
    cityField,
    stateField,
    postalCodeField,
    countryField
  );
  shippingSection.append(shippingGrid);

  const paymentSection = createElement('section', 'checkout-section');
  paymentSection.append(
    createElement('h2', 'checkout-section-title', 'payment')
  );
  const paymentNote = createElement(
    'p',
    'checkout-muted',
    'card details are collected in Square’s secure payment form below.'
  );
  const cardField = createElement('label', 'checkout-field');
  const cardLabel = createElement('span', 'checkout-label', 'card details');
  const cardContainer = createElement('div');
  cardContainer.id = 'card-container';
  cardField.append(cardLabel, cardContainer);
  paymentSection.append(paymentNote, cardField);

  const submit = createElement(
    'button',
    'checkout-submit',
    `pay ${formatCurrency(subtotal, currencyCode) || ''}`
  );
  submit.type = 'submit';
  submit.disabled = true;

  form.append(customerSection, shippingSection, paymentSection, submit);
  paymentPanel.append(form);

  const summaryTitle = createElement('h2', 'checkout-section-title', 'order summary');
  const summaryNote = createElement(
    'p',
    'checkout-summary-note',
    'shipping and any Square-side adjustments will be finalized during payment.'
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

  const fieldRefs = {
    firstName: firstNameInput,
    lastName: lastNameInput,
    email: emailInput,
    phone: phoneInput,
    addressLine1: addressLine1Input,
    addressLine2: addressLine2Input,
    city: cityInput,
    state: stateInput,
    postalCode: postalCodeInput,
    country: countrySelect,
  };

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

      if (!form.reportValidity()) {
        return;
      }

      submit.disabled = true;
      submit.textContent = 'processing';
      setStatus(status, '');

      try {
        const values = collectFormValues(fieldRefs);
        const amount = formatPaymentAmount(subtotal, currencyCode);
        const billingContact = buildBillingContact(values);
        const tokenResult = await card.tokenize({
          intent: 'CHARGE',
          amount,
          currencyCode,
          customerInitiated: true,
          sellerKeyedIn: false,
          billingContact,
        });

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
            buyerEmail: values.email,
            customer: {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              phone: values.phone,
            },
            shippingAddress: {
              addressLine1: values.addressLine1,
              addressLine2: values.addressLine2,
              city: values.city,
              state: values.state,
              postalCode: values.postalCode,
              country: values.country,
            },
            items,
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || 'Payment failed.');
        }

        setCartState({ items: [] });
        setStatus(status, 'payment received. your order is complete.', 'success');
        form.remove();
        const successBlock = createElement('div', 'checkout-success');
        successBlock.append(
          createElement('p', 'checkout-section-title', 'payment received'),
          createElement(
            'p',
            'checkout-muted',
            'your order has been placed and your receipt is ready below.'
          )
        );
        paymentPanel.append(successBlock);

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
