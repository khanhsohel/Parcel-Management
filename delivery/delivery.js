/**
 * Delivery Update Module Controller (delivery.js)
 */

window.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) return;

  const urlParams = new URLSearchParams(window.location.search);
  const searchId = urlParams.get('bookingId');
  if (searchId) {
    document.getElementById('delivery-search-booking-id').value = searchId;
    findDeliveryBooking(searchId);
  }
});

document.getElementById('form-delivery-search').addEventListener('submit', function(e) {
  e.preventDefault();
  const idInput = document.getElementById('delivery-search-booking-id').value.trim();
  findDeliveryBooking(idInput);
});

function findDeliveryBooking(bookingId) {
  const bookings = getBookings();
  const pkg = bookings.find(b => b.bookingId === bookingId);

  if (!pkg) {
    showToast('Package not found.', 'danger');
    document.getElementById('delivery-details-box').style.display = 'none';
    return;
  }

  document.getElementById('delivery-details-box').style.display = 'block';
  document.getElementById('delivery-preview-rec').textContent = pkg.receiverName;
  document.getElementById('delivery-preview-status').textContent = pkg.status;
  
  const previewStatus = document.getElementById('delivery-preview-status');
  previewStatus.className = 'badge';
  if (pkg.status === 'Booked') previewStatus.classList.add('badge-warning');
  else if (pkg.status === 'Picked up' || pkg.status === 'In Transit') previewStatus.classList.add('badge-info');
  else if (pkg.status === 'Delivered') previewStatus.classList.add('badge-success');
  else if (pkg.status === 'Returned') previewStatus.classList.add('badge-danger');

  document.getElementById('delivery-status-select').value = pkg.status;
}

document.getElementById('form-delivery-save').addEventListener('submit', function(e) {
  e.preventDefault();

  const bookingId = document.getElementById('delivery-search-booking-id').value.trim();
  const newStatus = document.getElementById('delivery-status-select').value;

  const bookings = getBookings();
  const index = bookings.findIndex(b => b.bookingId === bookingId);

  if (index !== -1) {
    bookings[index].status = newStatus;
    
    if (newStatus === 'Delivered' && !bookings[index].dropoffTime) {
      const now = new Date();
      const pad = (n) => n < 10 ? '0' + n : n;
      bookings[index].dropoffTime = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }

    saveBookings(bookings);
    showToast(`Shipment status updated to: ${newStatus}`, 'success');

    document.getElementById('form-delivery-search').reset();
    document.getElementById('delivery-details-box').style.display = 'none';
  } else {
    showToast('Failed to save status updates.', 'danger');
  }
});
