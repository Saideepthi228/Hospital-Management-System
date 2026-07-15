const BASE_URL = 'http://localhost:8080';

async function request(endpoint, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

// ── Auth ──
export const authAPI = {
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Patients ──
export const patientAPI = {
  getAll: () => request('/patients'),
  getById: (id) => request(`/patients/${id}`),
  create: (data) => request('/patients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/patients/${id}`, { method: 'DELETE' }),
};

// ── Doctors ──
export const doctorAPI = {
  getAll: () => request('/doctors'),
  getById: (id) => request(`/doctors/${id}`),
  create: (data) => request('/doctors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/doctors/${id}`, { method: 'DELETE' }),
};

// ── Appointments ──
export const appointmentAPI = {
  getAll: () => request('/appointments'),
  getById: (id) => request(`/appointments/${id}`),
  create: (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),
};

// ── Bills ──
export const billAPI = {
  getAll: () => request('/bills'),
  getById: (id) => request(`/bills/${id}`),
  create: (data) => request('/bills', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/bills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/bills/${id}`, { method: 'DELETE' }),
  getByPatient: (patientId) => request(`/bills/patient/${patientId}`),
};

// ── Prescriptions ──
export const prescriptionAPI = {
  getAll: () => request('/prescriptions'),
  getById: (id) => request(`/prescriptions/${id}`),
  create: (data) => request('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/prescriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/prescriptions/${id}`, { method: 'DELETE' }),
  getByPatient: (patientId) => request(`/prescriptions/patient/${patientId}`),
  getByDoctor: (doctorId) => request(`/prescriptions/doctor/${doctorId}`),
};
