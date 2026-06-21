/**
 * Booking History Module Controller (history.js)
 */

const state = {
  historyPagination: {
    customer: { page: 1, limit: 5 },
    officer: { page: 1, limit: 5 }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user) return;

  const customerView = document.getElementById('view-customer-history');
  const officerView = document.getElementById('view-officer-history');

  if (user.role === 'customer') {
    customerView.classList.add('active');
    officerView.classList.remove('active');
    renderCustomerHistory(user);
  } else if (user.role === 'officer') {
    officerView.classList.add('active');
    customerView.classList.remove('active');
    renderOfficerHistory();
  }
});

function renderCustomerHistory(user) {
  const bookings = getBookings();
  const myBookings = bookings.filter(b => b.customerId === user.userId);
  myBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const tbody = document.getElementById('table-body-customer-history');
  if (!tbody) return;
  tbody.innerHTML = '';

  const pagination = state.historyPagination.customer;
  const totalRecords = myBookings.length;
  const totalPages = Math.ceil(totalRecords / pagination.limit) || 1;

  if (pagination.page > totalPages) pagination.page = totalPages;
  if (pagination.page < 1) pagination.page = 1;

  const startIdx = (pagination.page - 1) * pagination.limit;
  const paginatedList = myBookings.slice(startIdx, startIdx + pagination.limit);

  document.getElementById('cust-hist-page-info').textContent = `Page ${pagination.page} of ${totalPages}`;
  document.getElementById('btn-cust-hist-prev').disabled = (pagination.page <= 1);
  document.getElementById('btn-cust-hist-next').disabled = (pagination.page >= totalPages);

  if (paginatedList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No history found. Create your first parcel shipment booking!</td></tr>`;
    return;
  }

  paginatedList.forEach(pkg => {
    let badgeClass = 'badge-warning';
    if (pkg.status === 'Picked up' || pkg.status === 'In Transit') badgeClass = 'badge-info';
    else if (pkg.status === 'Delivered') badgeClass = 'badge-success';
    else if (pkg.status === 'Returned') badgeClass = 'badge-danger';

    const bDate = pkg.bookingDate ? pkg.bookingDate.split(' ')[0] : 'N/A';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pkg.customerId}</td>
      <td class="font-mono">${pkg.bookingId}</td>
      <td>${bDate}</td>
      <td>${pkg.receiverName}</td>
      <td>${pkg.receiverAddress}</td>
      <td>$${pkg.cost.toFixed(2)}</td>
      <td><span class="badge ${badgeClass}">${pkg.status}</span></td>
      <td>
        <button class="btn btn-secondary btn-small" onclick="quickViewInvoice('${pkg.bookingId}')">Invoice</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.quickViewInvoice = function(bookingId) {
  window.location.href = `../booking/booking.html?bookingId=${bookingId}`;
};

document.getElementById('btn-cust-hist-prev').addEventListener('click', function() {
  if (state.historyPagination.customer.page > 1) {
    state.historyPagination.customer.page--;
    const user = getCurrentUser();
    renderCustomerHistory(user);
  }
});

document.getElementById('btn-cust-hist-next').addEventListener('click', function() {
  const user = getCurrentUser();
  const bookings = getBookings();
  const myBookings = bookings.filter(b => b.customerId === user.userId);
  const totalPages = Math.ceil(myBookings.length / state.historyPagination.customer.limit);
  
  if (state.historyPagination.customer.page < totalPages) {
    state.historyPagination.customer.page++;
    renderCustomerHistory(user);
  }
});

function renderOfficerHistory() {
  const bookings = getBookings();
  const tbody = document.getElementById('table-body-officer-history');
  if (!tbody) return;
  tbody.innerHTML = '';

  const filterCust = document.getElementById('off-hist-search-customer').value.trim().toLowerCase();
  const dateStart = document.getElementById('off-hist-date-start').value;
  const dateEnd = document.getElementById('off-hist-date-end').value;

  let filteredList = bookings.slice();

  if (filterCust) filteredList = filteredList.filter(b => b.customerId.toLowerCase().includes(filterCust));
  if (dateStart) filteredList = filteredList.filter(b => b.bookingDate.split(' ')[0] >= dateStart);
  if (dateEnd) filteredList = filteredList.filter(b => b.bookingDate.split(' ')[0] <= dateEnd);

  filteredList.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  const pagination = state.historyPagination.officer;
  const totalPages = Math.ceil(filteredList.length / pagination.limit) || 1;

  if (pagination.page > totalPages) pagination.page = totalPages;
  if (pagination.page < 1) pagination.page = 1;

  const startIdx = (pagination.page - 1) * pagination.limit;
  const paginatedList = filteredList.slice(startIdx, startIdx + pagination.limit);

  document.getElementById('off-hist-page-info').textContent = `Page ${pagination.page} of ${totalPages}`;
  document.getElementById('btn-off-hist-prev').disabled = (pagination.page <= 1);
  document.getElementById('btn-off-hist-next').disabled = (pagination.page >= totalPages);

  if (paginatedList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center;">No history entries found matching filters.</td></tr>`;
    return;
  }

  paginatedList.forEach(pkg => {
    let badgeClass = 'badge-warning';
    if (pkg.status === 'Picked up' || pkg.status === 'In Transit') badgeClass = 'badge-info';
    else if (pkg.status === 'Delivered') badgeClass = 'badge-success';
    else if (pkg.status === 'Returned') badgeClass = 'badge-danger';

    const bDate = pkg.bookingDate ? pkg.bookingDate.split(' ')[0] : 'N/A';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${pkg.customerId}</td>
      <td class="font-mono">${pkg.bookingId}</td>
      <td>${bDate}</td>
      <td>${pkg.receiverName}</td>
      <td>${pkg.receiverAddress}</td>
      <td>$${pkg.cost.toFixed(2)}</td>
      <td><span class="badge ${badgeClass}">${pkg.status}</span></td>
      <td>
        <button class="btn btn-secondary btn-small" onclick="quickViewInvoice('${pkg.bookingId}')">Invoice</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.getElementById('btn-off-hist-search').addEventListener('click', function() {
  state.historyPagination.officer.page = 1;
  renderOfficerHistory();
});

document.getElementById('btn-off-hist-reset').addEventListener('click', function() {
  document.getElementById('off-hist-search-customer').value = '';
  document.getElementById('off-hist-date-start').value = '';
  document.getElementById('off-hist-date-end').value = '';
  state.historyPagination.officer.page = 1;
  renderOfficerHistory();
});

document.getElementById('btn-off-hist-prev').addEventListener('click', function() {
  if (state.historyPagination.officer.page > 1) {
    state.historyPagination.officer.page--;
    renderOfficerHistory();
  }
});

document.getElementById('btn-off-hist-next').addEventListener('click', function() {
  const bookings = getBookings();
  const filterCust = document.getElementById('off-hist-search-customer').value.trim().toLowerCase();
  const dateStart = document.getElementById('off-hist-date-start').value;
  const dateEnd = document.getElementById('off-hist-date-end').value;

  let filteredList = bookings.slice();
  if (filterCust) filteredList = filteredList.filter(b => b.customerId.toLowerCase().includes(filterCust));
  if (dateStart) filteredList = filteredList.filter(b => b.bookingDate.split(' ')[0] >= dateStart);
  if (dateEnd) filteredList = filteredList.filter(b => b.bookingDate.split(' ')[0] <= dateEnd);

  const totalPages = Math.ceil(filteredList.length / state.historyPagination.officer.limit);
  if (state.historyPagination.officer.page < totalPages) {
    state.historyPagination.officer.page++;
    renderOfficerHistory();
  }
});
