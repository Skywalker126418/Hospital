import api from './api';

export const patientService = {
  getPatients: async (params = {}) => {
    return await api.get('/patients', { params });
  },

  getPatientById: async (id) => {
    return await api.get(`/patients/${id}`);
  },

  createPatient: async (patientData) => {
    return await api.post('/patients', patientData);
  },

  updatePatient: async (id, patientData) => {
    return await api.put(`/patients/${id}`, patientData);
  },
};
