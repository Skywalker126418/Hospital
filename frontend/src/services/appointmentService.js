import api from './api';

export const appointmentService = {
  getAppointments: async (params = {}) => {
    return await api.get('/appointments', { params });
  },

  getAppointmentById: async (id) => {
    return await api.get(`/appointments/${id}`);
  },

  createAppointment: async (appointmentData) => {
    return await api.post('/appointments', appointmentData);
  },

  updateStatus: async (id, status, notes) => {
    return await api.patch(`/appointments/${id}/status`, { status, notes });
  },

  reschedule: async (id, appointment_date, appointment_time) => {
    return await api.patch(`/appointments/${id}/reschedule`, { appointment_date, appointment_time });
  },
};
