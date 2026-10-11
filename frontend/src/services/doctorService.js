import api from './api';

export const doctorService = {
  getDoctors: async (params = {}) => {
    return await api.get('/doctors', { params });
  },

  getDoctorById: async (id) => {
    return await api.get(`/doctors/${id}`);
  },

  getDoctorSlots: async (doctorId, date) => {
    return await api.get(`/doctors/${doctorId}/slots`, { params: { date } });
  },

  updateDutyStatus: async (id, duty_status) => {
    return await api.patch(`/doctors/${id}/duty-status`, { duty_status });
  },
};
