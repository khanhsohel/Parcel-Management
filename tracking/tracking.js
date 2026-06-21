/**
 * Tracking Module Controller (tracking.js)
 */

window.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) return;

  setupTrackingView(user);
});

function setupTrackingView(user) {
  document.getElementById('form-tracking-search').reset();
  document.getElementById('tracking-result-box').style.display = 'none';

  const officerSection = document.getElementById('officer-tracking-section');
  if (user.role === 'officer') {
    officerSection.style.display = 'block';
    renderOfficerPackagesList();
  } else {
    officerSection.style.display = 'none';
  }

  const urlParams = new URLSearchParams(window.location.search);
  const searchId = urlParams.get('bookingId');
  if (searchId) {
    document.getElementById('track-booking-id').value = searchId;
    performTrackingSearch(searchId);
  }
}

document.getElementById('form-tracking-search').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const idInput = document.getElementById('track-booking-id').value.trim();
  if (idInput.length !== 12) {
    showToast('Booking ID must be exactly 12 digits.', 'danger');
    return;
  }

  performTrackingSearch(idInput);
});

function performTrackingSearch(bookingId) {
  const bookings = getBookings();
  const pkg = bookings.find(b => b.bookingId === bookingId);

  if (!pkg) {
    showToast('No shipment found for the provided Booking ID.', 'danger');
    document.getElementById('tracking-result-box').style.display = 'none';
    return;
  }

  const resultBox = document.getElementById('tracking-result-box');
  resultBox.style.display = 'block';

  const statusBadge = document.getElementById('track-result-status');
  statusBadge.textContent = pkg.status;
  statusBadge.className = 'value badge';
  
  if (pkg.status === 'Booked') statusBadge.classList.add('badge-warning');
  else if (pkg.status === 'Picked up' || pkg.status === 'In Transit') statusBadge.classList.add('badge-info');
  else if (pkg.status === 'Delivered') statusBadge.classList.add('badge-success');
  else if (pkg.status === 'Returned') statusBadge.classList.add('badge-danger');

  document.getElementById('track-result-id').textContent = pkg.bookingId;
  document.getElementById('track-result-route').textContent = `${pkg.senderName} ➔ ${pkg.receiverName}`;
  document.getElementById('track-result-contents').textContent = pkg.contents;
  document.getElementById('track-result-weight').textContent = pkg.weight;
  
  const speedMap = { 'standard': 'Standard Shipping', 'express': 'Express', 'next-day': 'Next-Day Air' };
  document.getElementById('track-result-type').textContent = speedMap[pkg.speed] || pkg.speed;

  document.getElementById('track-result-pickup').textContent = pkg.pickupTime ? pkg.pickupTime.replace('T', ' ') : 'Not Scheduled';
  document.getElementById('track-result-dropoff').textContent = pkg.dropoffTime ? pkg.dropoffTime.replace('T', ' ') : 'Not Scheduled';

  const steps = ['step-booked', 'step-picked-up', 'step-in-transit', 'step-delivered'];
  steps.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('done', 'active');
  });

  const deliveredLabel = document.querySelector('#step-delivered .step-label');
  if (deliveredLabel) deliveredLabel.textContent = 'Delivered';

  if (pkg.status === 'Booked') {
    document.getElementById('step-booked').classList.add('active');
  } else if (pkg.status === 'Picked up') {
    document.getElementById('step-booked').classList.add('done');
    document.getElementById('step-picked-up').classList.add('active');
  } else if (pkg.status === 'In Transit') {
    document.getElementById('step-booked').classList.add('done');
    document.getElementById('step-picked-up').classList.add('done');
    document.getElementById('step-in-transit').classList.add('active');
  } else if (pkg.status === 'Delivered') {
    document.getElementById('step-booked').classList.add('done');
    document.getElementById('step-picked-up').classList.add('done');
    document.getElementById('step-in-transit').classList.add('done');
    document.getElementById('step-delivered').classList.add('done');
  } else if (pkg.status === 'Returned') {
    document.getElementById('step-booked').classList.add('done');
    document.getElementById('step-picked-up').classList.add('done');
    document.getElementById('step-in-transit').classList.add('done');
    
    const deliveredStep = document.getElementById('step-delivered');
    if (deliveredStep) {
      deliveredStep.classList.add('active');
      deliveredLabel.textContent = 'Returned';
    }
  }
}

function renderOfficerPackagesList(filterCustomer = '', filterBooking = '') {
  const bookings = getBookings();
  const tbody = document.getElementById('table-body-officer-tracking');
  if (!tbody) return;

  tbody.innerHTML = '';

  let list = bookings.slice();
  
  if (filterCustomer.trim()) {
    list = list.filter(b => b.customerId.toLowerCase().includes(filterCustomer.toLowerCase().trim()));
  }
  if (filterBooking.trim()) {
    list = list.filter(b => b.bookingId.includes(filterBooking.trim()));
  }

  list.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No packages found in the database.</td></tr>`;
    return;
  }

  list.forEach(pkg => {
    let badgeClass = 'badge-warning';
    if (pkg.status === 'Picked up') badgeClass = 'badge-info';
    else if (pkg.status === 'In Transit') badgeClass = 'badge-info';
    else if (pkg.status === 'Delivered') badgeClass = 'badge-success';
    else if (pkg.status === 'Returned') badgeClass = 'badge-danger';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-mono">${pkg.bookingId}</td>
      <td>${pkg.customerId}</td>
      <td>${pkg.receiverName}</td>
      <td>${pkg.speed.toUpperCase()}</td>
      <td><span class="badge ${badgeClass}">${pkg.status}</span></td>
      <td>
        <button class="btn btn-secondary btn-small" onclick="quickTrackAction('${pkg.bookingId}')" style="margin-right: 5px;">Track</button>
        <button class="btn btn-primary btn-small" onclick="quickDeliveryStatusAction('${pkg.bookingId}')">Update</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.quickTrackAction = function(bookingId) {
  document.getElementById('track-booking-id').value = bookingId;
  performTrackingSearch(bookingId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.quickDeliveryStatusAction = function(bookingId) {
  window.location.href = `../delivery/delivery.html?bookingId=${bookingId}`;
};

document.getElementById('btn-off-track-filter').addEventListener('click', function() {
  const custVal = document.getElementById('off-track-search-customer').value;
  const bookVal = document.getElementById('off-track-search-booking').value;
  renderOfficerPackagesList(custVal, bookVal);
});
