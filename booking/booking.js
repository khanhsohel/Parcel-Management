/**
 * Booking Service Module Controller (booking.js)
 */

let currentBookingData = null;

window.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) return;

  const urlParams = new URLSearchParams(window.location.search);
  const searchId = urlParams.get('bookingId');
  if (searchId) {
    const bookings = getBookings();
    const pkg = bookings.find(b => b.bookingId === searchId);
    if (pkg) {
      renderInvoice(pkg);
      return;
    }
  }

  setupBookingForm(user);
});

function showSection(sectionId) {
  const sections = document.querySelectorAll('.content-view');
  sections.forEach(sec => sec.classList.remove('active'));
  
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');
}

function setupBookingForm(user) {
  const form = document.getElementById('form-booking');
  form.reset();

  const senderNameInput = document.getElementById('book-sender-name');
  const senderAddrInput = document.getElementById('book-sender-address');
  const senderContactInput = document.getElementById('book-sender-contact');

  if (user.role === 'customer') {
    senderNameInput.value = user.name;
    senderAddrInput.value = user.address;
    senderContactInput.value = user.mobile;

    senderNameInput.readOnly = true;
    senderAddrInput.readOnly = true;
    senderContactInput.readOnly = true;
  } else {
    senderNameInput.value = '';
    senderAddrInput.value = '';
    senderContactInput.value = '';

    senderNameInput.readOnly = false;
    senderAddrInput.readOnly = false;
    senderContactInput.readOnly = false;
  }

  const now = new Date();
  now.setHours(now.getHours() + 1);
  now.setMinutes(0);
  document.getElementById('book-pickup-time').value = now.toISOString().slice(0, 16);

  calculateCost();
}

function calculateCost() {
  const weight = parseFloat(document.getElementById('book-parcel-weight').value) || 0;
  const sizeClass = document.getElementById('book-parcel-size').value;
  const speed = document.getElementById('book-shipping-speed').value;
  const packaging = document.getElementById('book-shipping-pack').value;
  const insurance = document.getElementById('book-service-insurance').checked;
  const tracking = document.getElementById('book-service-tracking').checked;

  let totalCost = 0;

  const sizeRates = { 'small': 5.00, 'medium': 10.00, 'large': 20.00, 'extra-large': 40.00 };
  totalCost += sizeRates[sizeClass] || 5.00;
  totalCost += weight * 0.01;

  const packagingRates = { 'standard': 0.00, 'custom': 5.00, 'eco': 3.00, 'fragile': 8.00 };
  totalCost += packagingRates[packaging] || 0.00;

  const speedRates = { 'standard': 0.00, 'express': 10.00, 'next-day': 20.00 };
  totalCost += speedRates[speed] || 0.00;

  if (insurance) totalCost += 5.00;
  if (tracking) totalCost += 2.00;

  document.getElementById('book-calculated-cost').textContent = `$${totalCost.toFixed(2)}`;
  return totalCost;
}

['book-parcel-weight', 'book-parcel-size', 'book-shipping-speed', 'book-shipping-pack'].forEach(id => {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('change', calculateCost);
    element.addEventListener('input', calculateCost);
  }
});
document.getElementById('book-service-insurance').addEventListener('change', calculateCost);
document.getElementById('book-service-tracking').addEventListener('change', calculateCost);

document.getElementById('form-booking').addEventListener('submit', function(e) {
  e.preventDefault();

  const weight = parseFloat(document.getElementById('book-parcel-weight').value);
  if (weight <= 0) {
    showToast('Parcel weight must be greater than 0 grams.', 'danger');
    return;
  }

  const receiverPin = document.getElementById('book-receiver-pin').value;
  if (receiverPin.length < 5 || receiverPin.length > 10) {
    showToast('PIN code must be between 5 and 10 digits.', 'danger');
    return;
  }

  const calculatedCost = calculateCost();

  currentBookingData = {
    senderName: document.getElementById('book-sender-name').value.trim(),
    senderAddress: document.getElementById('book-sender-address').value.trim(),
    senderContact: document.getElementById('book-sender-contact').value.trim(),
    receiverName: document.getElementById('book-receiver-name').value.trim(),
    receiverAddress: document.getElementById('book-receiver-address').value.trim(),
    receiverPin: receiverPin.trim(),
    receiverContact: document.getElementById('book-receiver-contact').value.trim(),
    weight: weight,
    size: document.getElementById('book-parcel-size').value,
    contents: document.getElementById('book-parcel-desc').value.trim(),
    insurance: document.getElementById('book-service-insurance').checked,
    tracking: document.getElementById('book-service-tracking').checked,
    speed: document.getElementById('book-shipping-speed').value,
    packaging: document.getElementById('book-shipping-pack').value,
    pickupTime: document.getElementById('book-pickup-time').value,
    cost: calculatedCost
  };

  document.getElementById('payment-bill-amount').textContent = `$${calculatedCost.toFixed(2)}`;
  showSection('view-payment');
});

document.getElementById('btn-payment-back').addEventListener('click', function() {
  showSection('view-booking');
});

document.getElementById('form-payment-mode').addEventListener('submit', function(e) {
  e.preventDefault();
  
  document.getElementById('form-card-details').reset();
  document.getElementById('card-preview-number').textContent = '•••• •••• •••• ••••';
  document.getElementById('card-preview-holder').textContent = 'NAME SURNAME';
  document.getElementById('card-preview-expiry').textContent = 'MM/YY';

  showSection('view-card-details');
});

document.getElementById('btn-card-back').addEventListener('click', function() {
  showSection('view-payment');
});

document.getElementById('card-number').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  let formatted = '';
  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += ' ';
    formatted += value[i];
  }
  e.target.value = formatted;
  document.getElementById('card-preview-number').textContent = formatted || '•••• •••• •••• ••••';
});

document.getElementById('card-holder').addEventListener('input', function(e) {
  document.getElementById('card-preview-holder').textContent = e.target.value.toUpperCase() || 'NAME SURNAME';
});

document.getElementById('card-expiry').addEventListener('input', function(e) {
  let val = e.target.value.replace(/\D/g, '');
  if (val.length > 2) {
    val = val.substring(0, 2) + '/' + val.substring(2, 4);
  }
  e.target.value = val;
  document.getElementById('card-preview-expiry').textContent = val || 'MM/YY';
});

document.getElementById('form-card-details').addEventListener('submit', function(e) {
  e.preventDefault();

  const cardNo = document.getElementById('card-number').value.replace(/\s/g, '');
  const expiry = document.getElementById('card-expiry').value.trim();
  const cvv = document.getElementById('card-cvv').value.trim();

  if (cardNo.length !== 16) {
    showToast('Card number must be exactly 16 digits.', 'danger');
    return;
  }
  if (!expiry.includes('/') || expiry.length !== 5) {
    showToast('Expiry Date must be in MM/YY format.', 'danger');
    return;
  }
  if (cvv.length !== 3) {
    showToast('CVV must be exactly 3 digits.', 'danger');
    return;
  }

  const overlay = document.getElementById('payment-loader-overlay');
  overlay.style.display = 'flex';

  setTimeout(() => {
    overlay.style.display = 'none';

    const random12Id = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    
    const d = new Date();
    const pad = (n) => n < 10 ? '0' + n : n;
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const user = getCurrentUser();
    const bookingObject = {
      ...currentBookingData,
      bookingId: random12Id,
      customerId: user.role === 'customer' ? user.userId : 'walk-in-customer',
      status: 'Booked',
      bookingDate: dateStr,
      paymentTime: dateStr,
      dropoffTime: ''
    };

    const bookings = getBookings();
    bookings.push(bookingObject);
    saveBookings(bookings);

    showToast('Payment Successful!', 'success');
    renderInvoice(bookingObject);
  }, 1800);
});

function renderInvoice(booking) {
  document.getElementById('inv-booking-id').textContent = booking.bookingId;
  document.getElementById('inv-payment-time').textContent = booking.paymentTime;
  document.getElementById('inv-rec-name').textContent = booking.receiverName;
  document.getElementById('inv-rec-address').textContent = booking.receiverAddress;
  document.getElementById('inv-rec-pin').textContent = booking.receiverPin;
  document.getElementById('inv-rec-mobile').textContent = booking.receiverContact;
  document.getElementById('inv-weight').textContent = booking.weight;
  document.getElementById('inv-contents').textContent = booking.contents;
  document.getElementById('inv-service-cost').textContent = `$${booking.cost.toFixed(2)}`;

  const speedMap = { 'standard': 'Standard Shipping', 'express': 'Express Delivery', 'next-day': 'Next-Day Air' };
  const packMap = { 'standard': 'Standard packaging', 'custom': 'Custom Box packaging', 'eco': 'Eco-friendly mailer', 'fragile': 'Fragile Handle padding' };
  
  document.getElementById('inv-shipping-speed').textContent = speedMap[booking.speed] || booking.speed;
  document.getElementById('inv-packing-pref').textContent = packMap[booking.packaging] || booking.packaging;

  document.getElementById('inv-pickup-time').textContent = booking.pickupTime ? booking.pickupTime.replace('T', ' ') : 'Not Scheduled';
  document.getElementById('inv-dropoff-time').textContent = booking.dropoffTime ? booking.dropoffTime.replace('T', ' ') : 'Not Scheduled';

  showSection('view-invoice');
}

document.getElementById('btn-invoice-print').addEventListener('click', function() {
  window.print();
});

document.getElementById('btn-invoice-home').addEventListener('click', function() {
  window.location.href = '../dashboard/dashboard.html';
});
