/**
 * Pickup Scheduling Module Controller (pickup.js)
 */

window.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) return;
});

document.getElementById('form-pickup-search').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const idInput = document.getElementById('pickup-search-booking-id').value.trim();
  const bookings = getBookings();
  const pkg = bookings.find(b => b.bookingId === idInput);

  if (!pkg) {
    showToast('Package not found.', 'danger');
    document.getElementById('pickup-details-box').style.display = 'none';
    return;
  }

  document.getElementById('pickup-details-box').style.display = 'block';
  document.getElementById('pickup-preview-cust').textContent = pkg.customerId;
  document.getElementById('pickup-preview-sender').textContent = `${pkg.senderName} (${pkg.senderContact})`;
  document.getElementById('pickup-preview-rec').textContent = `${pkg.receiverName} (${pkg.receiverContact})`;

  if (pkg.pickupTime) {
    document.getElementById('pickup-datetime').value = pkg.pickupTime;
  } else {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    tmr.setHours(9);
    tmr.setMinutes(0);
    document.getElementById('pickup-datetime').value = tmr.toISOString().slice(0, 16);
  }

  if (pkg.dropoffTime) {
    document.getElementById('dropoff-datetime').value = pkg.dropoffTime;
  } else {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 2);
    nextDay.setHours(17);
    nextDay.setMinutes(0);
    document.getElementById('dropoff-datetime').value = nextDay.toISOString().slice(0, 16);
  }
});

document.getElementById('form-pickup-save').addEventListener('submit', function(e) {
  e.preventDefault();

  const bookingId = document.getElementById('pickup-search-booking-id').value.trim();
  const pickup = document.getElementById('pickup-datetime').value;
  const dropoff = document.getElementById('dropoff-datetime').value;

  const bookings = getBookings();
  const index = bookings.findIndex(b => b.bookingId === bookingId);

  if (index !== -1) {
    bookings[index].pickupTime = pickup;
    bookings[index].dropoffTime = dropoff;
    
    if (bookings[index].status === 'Booked') {
      bookings[index].status = 'Picked up';
    }

    saveBookings(bookings);
    showToast('Pickup schedules saved successfully!', 'success');
    
    document.getElementById('form-pickup-search').reset();
    document.getElementById('pickup-details-box').style.display = 'none';
  } else {
    showToast('Failed to update details.', 'danger');
  }
});
