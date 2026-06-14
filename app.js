const OAS_STORAGE = {
  customers: 'oasBayCustomers',
  technicians: 'oasBayTechnicians'
};

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (error) {
    return [];
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function makeId(prefix) {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-UG', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((item) => item.value);
}

function getServiceFees(services) {
  const labourServices = ['engine_oil_filter', 'gearbox_oil_filter', 'brake_fluid', 'brake_pads', 'greasing', 'minor_repairs'];
  const labour = services.some((service) => labourServices.includes(service)) ? 20000 : 0;
  const alignment = services.includes('wheel_alignment') ? 30000 : 0;
  const balance = services.includes('wheel_balance') ? 20000 : 0;
  const total = labour + alignment + balance;

  return {
    labour,
    alignment,
    balance,
    total
  };
}

function getServiceLabels(services) {
  const labels = {
    engine_oil_filter: 'Engine oil and filter',
    gearbox_oil_filter: 'Gearbox oil and filter',
    brake_fluid: 'Brake fluid',
    brake_pads: 'Brake pads',
    greasing: 'Greasing',
    minor_repairs: 'Minor repairs',
    wheel_alignment: 'Wheel alignment',
    wheel_balance: 'Wheel balance'
  };

  return services.map((service) => labels[service] || service);
}

function populateTechnicianSelects() {
  const technicians = readStorage(OAS_STORAGE.technicians);
  const selects = document.querySelectorAll('[data-technician-select]');

  selects.forEach((select) => {
    const currentValue = select.dataset.value || '';
    select.innerHTML = '<option value="">Select technician</option>';

    if (technicians.length === 0) {
      select.insertAdjacentHTML('beforeend', '<option value="" disabled>No registered technician</option>');
      return;
    }

    technicians.forEach((technician) => {
      const option = document.createElement('option');
      option.value = technician.id;
      option.textContent = `${technician.fullName} - ${technician.specialty || 'General'}`;
      select.appendChild(option);
    });

    if (currentValue) {
      select.value = currentValue;
    }
  });
}

function updateStats() {
  const customers = readStorage(OAS_STORAGE.customers);
  const technicians = readStorage(OAS_STORAGE.technicians);
  const revenue = customers.reduce((sum, customer) => sum + Number(customer.total || 0), 0);

  const elements = {
    customers: document.getElementById('customerCount'),
    technicians: document.getElementById('technicianCount'),
    services: document.getElementById('serviceCount'),
    revenue: document.getElementById('revenueCount')
  };

  if (elements.customers) elements.customers.textContent = customers.length;
  if (elements.technicians) elements.technicians.textContent = technicians.length;
  if (elements.services) elements.services.textContent = customers.reduce((sum, customer) => sum + (customer.services ? customer.services.length : 0), 0);
  if (elements.revenue) elements.revenue.textContent = formatCurrency(revenue);
}

function renderRecentCustomers() {
  const list = document.getElementById('recentCustomers');
  if (!list) return;

  const customers = readStorage(OAS_STORAGE.customers).slice(-6).reverse();
  list.innerHTML = '';

  if (customers.length === 0) {
    list.innerHTML = '<div class="empty">No customer records yet. Register the first customer from the Customer Registration page.</div>';
    return;
  }

  customers.forEach((customer) => {
    const item = document.createElement('div');
    item.className = 'recent-item';
    item.innerHTML = `
      <strong>${escapeHtml(customer.customerName)}</strong>
      <span>${escapeHtml(customer.vehicleReg)} • ${escapeHtml(customer.servicesLabel)}</span>
      <span> • ${formatCurrency(customer.total)}</span>
    `;
    list.appendChild(item);
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showToast(message) {
  const notice = document.getElementById('notice');
  if (!notice) return;

  notice.textContent = message;
  notice.classList.add('show');

  setTimeout(() => {
    notice.classList.remove('show');
  }, 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  renderRecentCustomers();
  populateTechnicianSelects();
});
