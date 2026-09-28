import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  Search,
  User,
  Printer
} from 'lucide-react';
import { prescriptionService } from '../../services/prescriptionService';
import { consultationService } from '../../services/consultationService';
import { patientService } from '../../services/patientService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import MedicineRow from '../../components/prescriptions/MedicineRow';
import LoadingSpinner from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const Prescriptions = () => {
  const [searchParams] = useSearchParams();
  const initialConsultationId = searchParams.get('consultationId');
  const initialPatientId = searchParams.get('patientId');

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialConsultationId ? 'create' : 'list');

  // Form State for creating prescription
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultationId, setSelectedConsultationId] = useState(initialConsultationId || '');
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || '');
  const [instructions, setInstructions] = useState('Take with food. Complete the full designated course.');
  const [medicineItems, setMedicineItems] = useState([
    { medicine_name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Three times daily (8h)', duration: '7 days', instructions: 'Take with food' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View prescription modal
  const [viewPrescription, setViewPrescription] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const { success, error: toastError } = useToast();

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const [rxRes, consultRes] = await Promise.all([
        prescriptionService.getPrescriptions({ limit: 20 }),
        consultationService.getConsultations({ limit: 20 }),
      ]);

      if (rxRes.success) setPrescriptions(rxRes.data);
      if (consultRes.success) {
        setConsultations(consultRes.data);
        if (!selectedConsultationId && consultRes.data.length > 0) {
          setSelectedConsultationId(consultRes.data[0].id);
          setSelectedPatientId(consultRes.data[0].patient_id);
        }
      }
    } catch (err) {
      toastError('Failed to load prescriptions or consultations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const handleAddMedicineRow = () => {
    setMedicineItems((prev) => [
      ...prev,
      { medicine_name: '', dosage: '500mg', frequency: 'Twice daily (12h)', duration: '5 days', instructions: '' }
    ]);
  };

  const handleRemoveMedicineRow = (index) => {
    setMedicineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicineItems((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleConsultationSelect = (e) => {
    const id = e.target.value;
    setSelectedConsultationId(id);
    const consult = consultations.find((c) => c.id.toString() === id.toString());
    if (consult) {
      setSelectedPatientId(consult.patient_id);
    }
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!selectedConsultationId || !selectedPatientId) {
      toastError('Please select a valid consultation.');
      return;
    }

    // Verify all rows have medicine_name
    for (const item of medicineItems) {
      if (!item.medicine_name.trim()) {
        toastError('Please provide medicine name for all rows.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        consultation_id: parseInt(selectedConsultationId, 10),
        patient_id: parseInt(selectedPatientId, 10),
        instructions,
        items: medicineItems,
      };

      await prescriptionService.createPrescription(payload);
      success('✓ Pharmacological Prescription Created Successfully');
      setActiveTab('list');
      loadPrescriptions();
    } catch (err) {
      toastError(err.message || 'Failed to save prescription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (rx) => {
    setViewPrescription(rx);
    setIsViewOpen(true);
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading prescription directory..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prescription Management"
        subtitle="Issue electronic prescriptions with multi-medicine dosing instructions and audit pharmacological records."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'list'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Prescription Archives
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Plus className="w-4 h-4" /> Issue New Prescription
            </button>
          </div>
        }
      />

      {activeTab === 'create' ? (
        <form onSubmit={handleSubmitPrescription} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10 space-y-6 max-w-4xl mx-auto">
          {/* Associated Consultation */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <label className="block text-sm font-bold text-slate-900">
              Select Diagnostic Consultation <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedConsultationId}
              onChange={handleConsultationSelect}
              className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm bg-slate-50 focus:bg-white focus:border-brand-500"
              required
            >
              {consultations.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.consultation_date?.slice(0, 10)} — {c.patient_name} ({c.patient_code}) — Diagnosis: {c.diagnosis}
                </option>
              ))}
            </select>
          </div>

          {/* Medicine Rows (Rule 29: MedicineRow components) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Prescribed Medications</h3>
                <p className="text-xs text-slate-500">Configure dosage, frequency, and treatment duration for each drug.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                icon={Plus}
                onClick={handleAddMedicineRow}
              >
                Add Medication
              </Button>
            </div>

            <div className="space-y-3">
              {medicineItems.map((item, idx) => (
                <MedicineRow
                  key={idx}
                  index={idx}
                  item={item}
                  onChange={handleMedicineChange}
                  onRemove={handleRemoveMedicineRow}
                  isRemovable={medicineItems.length > 1}
                />
              ))}
            </div>
          </div>

          {/* General Physician Instructions */}
          <div className="pt-2">
            <Input
              label="General Patient Guidance & Administration Instructions"
              name="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Take with warm water, avoid dairy for 1 hour, store in cool dry place"
            />
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setActiveTab('list')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={isSubmitting}
              icon={Save}
            >
              Finalize & Save Prescription
            </Button>
          </div>
        </form>
      ) : (
        /* Prescriptions Archive Table */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {prescriptions.length === 0 ? (
            <EmptyState
              title="No prescriptions found"
              description="No pharmacological orders have been written yet."
              actionLabel="Issue Prescription"
              onAction={() => setActiveTab('create')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Rx ID / Date</th>
                    <th className="px-5 py-3.5">Patient Details</th>
                    <th className="px-5 py-3.5">Attending Physician</th>
                    <th className="px-5 py-3.5">Diagnosis</th>
                    <th className="px-5 py-3.5">Medications</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescriptions.map((rx) => (
                    <tr key={rx.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-4 font-mono text-xs">
                        <div className="font-bold text-slate-900">RX-{rx.id.toString().padStart(5, '0')}</div>
                        <div className="text-slate-400">{rx.prescription_date?.slice(0, 10)}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{rx.patient_name}</div>
                        <div className="text-xs text-slate-400">{rx.patient_code}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">{rx.doctor_name}</div>
                        <div className="text-xs text-slate-400">{rx.doctor_specialization}</div>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-700 max-w-xs truncate">
                        {rx.diagnosis}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {rx.items?.length || 0} drugs prescribed
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Eye}
                          onClick={() => handleView(rx)}
                        >
                          View Rx
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Printable Prescription Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={viewPrescription ? `Official Prescription — RX-${viewPrescription.id.toString().padStart(5, '0')}` : 'Prescription'}
        subtitle="Hospital Pharmacological Dispensing Order"
      >
        {viewPrescription && (
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block">Patient Name:</span>
                <span className="font-bold text-slate-900 text-sm">{viewPrescription.patient_name}</span>
                <p className="text-slate-400 mt-0.5">{viewPrescription.patient_code}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Prescribing Physician:</span>
                <span className="font-bold text-brand-600 text-sm">{viewPrescription.doctor_name}</span>
                <p className="text-slate-400 mt-0.5">{viewPrescription.doctor_specialization}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                Medication Dispensing Schedule
              </h4>
              <div className="space-y-2">
                {viewPrescription.items?.map((item, i) => (
                  <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{item.medicine_name}</span>
                      <span className="text-brand-600 font-semibold ml-2">[{item.dosage}]</span>
                      <p className="text-slate-500 mt-0.5">{item.instructions || 'No specific instructions'}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-800">{item.frequency}</span>
                      <p className="text-slate-400 text-[11px]">{item.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {viewPrescription.instructions && (
              <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-900">
                <strong className="block mb-0.5">Physician Note:</strong>
                {viewPrescription.instructions}
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <Button
                size="sm"
                variant="outline"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Prescription Order
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Prescriptions;
