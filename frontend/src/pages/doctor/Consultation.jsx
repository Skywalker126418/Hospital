import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  User,
  FlaskConical,
  Save,
  ArrowLeft
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { consultationService } from '../../services/consultationService';
import { patientService } from '../../services/patientService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/Loading';

const Consultation = () => {
  const [searchParams] = useSearchParams();
  const appointmentIdParam = searchParams.get('appointmentId');
  const patientIdParam = searchParams.get('patientId');

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(appointmentIdParam || '');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [formData, setFormData] = useState({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    follow_up_date: '',
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedConsultation, setSavedConsultation] = useState(null);

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // Load eligible appointments (confirmed or scheduled)
  useEffect(() => {
    const fetchEligibleAppointments = async () => {
      try {
        setLoading(true);
        const res = await appointmentService.getAppointments({ limit: 30 });
        if (res.success) {
          const validList = res.data.filter((a) => a.status !== 'cancelled');
          setAppointments(validList);

          if (appointmentIdParam) {
            const current = validList.find((a) => a.id.toString() === appointmentIdParam);
            if (current) {
              setSelectedAppointmentId(current.id);
              setSelectedPatient({
                id: current.patient_id,
                name: current.patient_name,
                code: current.patient_code,
                dob: current.patient_dob,
                allergies: current.allergies,
                blood: current.blood_group,
                reason: current.reason,
              });
            }
          } else if (validList.length > 0) {
            const first = validList[0];
            setSelectedAppointmentId(first.id);
            setSelectedPatient({
              id: first.patient_id,
              name: first.patient_name,
              code: first.patient_code,
              dob: first.patient_dob,
              allergies: first.allergies,
              blood: first.blood_group,
              reason: first.reason,
            });
          }
        }
      } catch (err) {
        toastError('Failed to load consultation appointment queue.');
      } finally {
        setLoading(false);
      }
    };

    fetchEligibleAppointments();
  }, [appointmentIdParam]);

  const handleAppointmentSelect = (e) => {
    const id = e.target.value;
    setSelectedAppointmentId(id);
    const found = appointments.find((a) => a.id.toString() === id.toString());
    if (found) {
      setSelectedPatient({
        id: found.patient_id,
        name: found.patient_name,
        code: found.patient_code,
        dob: found.patient_dob,
        allergies: found.allergies,
        blood: found.blood_group,
        reason: found.reason,
      });
      // Pre-fill symptoms with the stated appointment reason if empty
      if (!formData.symptoms && found.reason) {
        setFormData((prev) => ({ ...prev, symptoms: `Presented with: ${found.reason}` }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointmentId) {
      toastError('Please select a valid scheduled appointment.');
      return;
    }
    if (!formData.symptoms.trim() || !formData.diagnosis.trim() || !formData.treatment.trim()) {
      toastError('Please fill in symptoms, clinical diagnosis, and treatment plan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        appointment_id: parseInt(selectedAppointmentId, 10),
        patient_id: selectedPatient.id,
        symptoms: formData.symptoms.trim(),
        diagnosis: formData.diagnosis.trim(),
        treatment: formData.treatment.trim(),
        notes: formData.notes.trim(),
        follow_up_date: formData.follow_up_date || null,
      };

      const res = await consultationService.createConsultation(payload);
      success('✓ Clinical Consultation Saved & Visit Completed');
      setSavedConsultation({
        id: res.data.id,
        diagnosis: formData.diagnosis,
        patient_id: selectedPatient.id,
      });
    } catch (err) {
      toastError(err.message || 'Failed to save consultation records.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading consultation room..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Clinical Consultation & Medical Notes"
        subtitle="Document patient symptoms, enter medical diagnosis, prescribe treatments, and establish follow-up schedules."
        actions={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/doctor/dashboard')}>
            Back to Dashboard
          </Button>
        }
      />

      {savedConsultation ? (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 sm:p-10 text-center animate-fade-in space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">✓ Consultation Successfully Recorded</h2>
            <p className="text-sm text-slate-500 mt-1">
              Clinical record ID #{savedConsultation.id} committed. The appointment status is marked as Completed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              icon={FileText}
              onClick={() => navigate(`/doctor/prescriptions?consultationId=${savedConsultation.id}&patientId=${savedConsultation.patient_id}`)}
            >
              Issue Prescription for this Visit
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={FlaskConical}
              onClick={() => navigate(`/doctor/lab-results?patientId=${savedConsultation.patient_id}`)}
            >
              Order Laboratory Diagnostic
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setSavedConsultation(null);
                setFormData({
                  symptoms: '',
                  diagnosis: '',
                  treatment: '',
                  notes: '',
                  follow_up_date: '',
                });
              }}
            >
              Start Another Visit
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10">
          {/* Appointment & Patient Selection */}
          <div className="space-y-4 pb-6 border-b border-slate-100">
            <label className="block text-sm font-bold text-slate-900">
              Active Appointment Queue
            </label>
            <select
              value={selectedAppointmentId}
              onChange={handleAppointmentSelect}
              className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              required
            >
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.appointment_date} {a.appointment_time?.slice(0, 5)} — {a.patient_name} ({a.patient_code}) [{a.status.toUpperCase()}]
                </option>
              ))}
            </select>

            {/* Patient Snapshot Card */}
            {selectedPatient && (
              <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{selectedPatient.name}</span>
                  <span className="ml-2 font-mono text-brand-700">{selectedPatient.code}</span>
                  <p className="text-slate-600 mt-0.5">
                    Blood: <strong className="text-slate-800">{selectedPatient.blood || 'Unspecified'}</strong> • Allergies: <strong className="text-rose-700">{selectedPatient.allergies || 'None'}</strong>
                  </p>
                </div>
                <div className="text-slate-500 text-right sm:border-l sm:border-brand-200 sm:pl-4">
                  <span className="block font-medium text-slate-700">Reason on file:</span>
                  <span className="italic">{selectedPatient.reason || 'General checkup'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Clinical Findings & Symptoms */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">
              Presented Symptoms & Clinical Findings <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="symptoms"
              rows={3}
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="e.g. Dry cough for 5 days, bilateral lung sounds normal, oral temp 37.8C, SpO2 98%"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">
              Clinical Diagnosis <span className="text-rose-500">*</span>
            </label>
            <Input
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="e.g. Acute Upper Respiratory Infection (Bronchial Irritation), Essential Hypertension"
              required
            />
          </div>

          {/* Treatment Plan */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">
              Treatment & Intervention Plan <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="treatment"
              rows={3}
              value={formData.treatment}
              onChange={handleChange}
              placeholder="e.g. Prescribed bronchodilator syrup, oral antibiotics 500mg, hydration, 3 days rest"
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>

          {/* Notes & Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Doctor's Internal Clinical Notes (Optional)
              </label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Confidential observations or differential diagnosis..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <Input
                label="Scheduled Follow-up Date (Optional)"
                name="follow_up_date"
                type="date"
                value={formData.follow_up_date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/doctor/dashboard')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={isSubmitting}
              icon={Save}
            >
              Save Consultation Record
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Consultation;
