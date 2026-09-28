import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FlaskConical,
  Plus,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  Edit,
  Save,
  FileCheck
} from 'lucide-react';
import { laboratoryService } from '../../services/laboratoryService';
import { patientService } from '../../services/patientService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const LabResults = () => {
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId');

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Order Test Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(!!initialPatientId);
  const [patients, setPatients] = useState([]);
  const [orderPatientId, setOrderPatientId] = useState(initialPatientId || '');
  const [orderTestName, setOrderTestName] = useState('Complete Blood Count (CBC)');
  const [orderDescription, setOrderDescription] = useState('Evaluate cellular blood profile, WBC, hemoglobin, and platelets');
  const [isOrdering, setIsOrdering] = useState(false);

  // Update Result Modal State
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [targetTest, setTargetTest] = useState(null);
  const [resultText, setResultText] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [newStatus, setNewStatus] = useState('completed');
  const [isSavingResult, setIsSavingResult] = useState(false);

  const { success, error: toastError } = useToast();

  const commonTestPresets = [
    { name: 'Complete Blood Count (CBC)', desc: 'Evaluate cellular blood profile, WBC, hemoglobin, and platelets' },
    { name: 'Comprehensive Lipid Profile Panel', desc: 'Total cholesterol, HDL, LDL, and Triglycerides assay' },
    { name: 'Cardiac Troponin I & CK-MB', desc: 'Myocardial necrosis markers for acute coronary evaluation' },
    { name: 'Basic Metabolic Panel (BMP)', desc: 'Glucose, Calcium, Sodium, Potassium, CO2, Chloride, BUN, Creatinine' },
    { name: 'Urinalysis & Microscopic Exam', desc: 'Screen for urinary tract infection, proteinuria, renal parameters' },
    { name: 'Liver Function Panel (LFT)', desc: 'ALT, AST, ALP, Albumin, Total Bilirubin evaluation' }
  ];

  const loadLabTests = async () => {
    try {
      setLoading(true);
      const res = await laboratoryService.getTests({
        status: statusFilter,
        search: searchQuery,
        limit: 30,
      });
      if (res.success) setTests(res.data);
    } catch (err) {
      toastError('Failed to load laboratory tests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabTests();
  }, [statusFilter]);

  // Load patient suggestions for ordering
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await patientService.getPatients({ limit: 50 });
        if (res.success) {
          setPatients(res.data);
          if (!orderPatientId && res.data.length > 0) {
            setOrderPatientId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, []);

  const handleOrderTest = async (e) => {
    e.preventDefault();
    if (!orderPatientId || !orderTestName) {
      toastError('Please select a patient and lab test.');
      return;
    }

    setIsOrdering(true);
    try {
      await laboratoryService.createTest({
        patient_id: parseInt(orderPatientId, 10),
        test_name: orderTestName,
        description: orderDescription,
      });
      success('✓ Diagnostic Laboratory Test Ordered');
      setIsOrderModalOpen(false);
      loadLabTests();
    } catch (err) {
      toastError(err.message || 'Failed to order laboratory test.');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleOpenResultModal = (test) => {
    setTargetTest(test);
    setResultText(test.result || '');
    setTechnicianNotes(test.technician_notes || '');
    setNewStatus(test.status === 'pending' ? 'completed' : test.status);
    setIsResultModalOpen(true);
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    setIsSavingResult(true);
    try {
      await laboratoryService.updateResult(targetTest.id, {
        status: newStatus,
        result: resultText,
        technician_notes: technicianNotes,
      });
      success('Laboratory findings updated successfully.');
      setIsResultModalOpen(false);
      loadLabTests();
    } catch (err) {
      toastError(err.message || 'Failed to update lab results.');
    } finally {
      setIsSavingResult(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diagnostic Laboratory Services"
        subtitle="Request clinical pathology, hematology, and biochemistry assays, and inspect diagnostic findings."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setIsOrderModalOpen(true)}>
            Order Laboratory Test
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadLabTests();
          }}
          className="flex-1 w-full flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by test name, patient name, or code..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
        >
          <option value="">All Test Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Laboratory Tests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner size="md" text="Loading diagnostic specimens..." />
        ) : tests.length === 0 ? (
          <EmptyState
            title="No laboratory tests found"
            description="Request a laboratory diagnostic test to initiate pathology processing."
            actionLabel="Order Test"
            onAction={() => setIsOrderModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Lab Order ID / Date</th>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Assay Test Name</th>
                  <th className="px-5 py-3.5">Requesting Doctor</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tests.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4 font-mono text-xs">
                      <div className="font-bold text-slate-900">LAB-{t.id.toString().padStart(5, '0')}</div>
                      <div className="text-slate-400">{t.request_date?.slice(0, 10)}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{t.patient_name}</div>
                      <div className="text-xs text-slate-400">{t.patient_code}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{t.test_name}</div>
                      <div className="text-xs text-slate-500 max-w-xs truncate">{t.description}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">{t.doctor_name}</div>
                      <div className="text-xs text-slate-400">{t.doctor_specialization}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge-${t.status}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        size="sm"
                        variant={t.status === 'completed' ? 'outline' : 'primary'}
                        icon={t.status === 'completed' ? Eye : Edit}
                        onClick={() => handleOpenResultModal(t)}
                      >
                        {t.status === 'completed' ? 'View Findings' : 'Enter Result'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Test Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Order Laboratory Diagnostic Test"
        subtitle="Requisition diagnostic pathology or hematological blood tests"
      >
        <form onSubmit={handleOrderTest} className="space-y-4 text-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Patient <span className="text-rose-500">*</span>
            </label>
            <select
              value={orderPatientId}
              onChange={(e) => setOrderPatientId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2.5 px-3 bg-white text-sm focus:border-brand-500"
              required
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.patient_code}) — {p.gender}, {p.age}y
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Test Presets
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              {commonTestPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setOrderTestName(preset.name);
                    setOrderDescription(preset.desc);
                  }}
                  className={`p-2 rounded-lg border text-left transition ${
                    orderTestName === preset.name
                      ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Assay Name"
            value={orderTestName}
            onChange={(e) => setOrderTestName(e.target.value)}
            required
          />

          <Input
            label="Clinical Reason / Description"
            value={orderDescription}
            onChange={(e) => setOrderDescription(e.target.value)}
            placeholder="e.g. Fasting blood glucose, baseline renal monitoring"
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isOrdering}>
              Confirm Lab Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enter / View Result Modal */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title={targetTest ? `Diagnostic Findings — ${targetTest.test_name}` : 'Lab Result'}
        subtitle={`Patient: ${targetTest?.patient_name} (${targetTest?.patient_code})`}
      >
        <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block mb-1">Requisition Clinical Purpose:</span>
            <p className="font-medium text-slate-800">{targetTest?.description || 'Standard Diagnostic Evaluation'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Diagnostic Assay Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2.5 px-3 bg-white text-sm focus:border-brand-500"
              required
            >
              <option value="in_progress">In Progress (Specimen Analyzing)</option>
              <option value="completed">Completed (Findings Verified)</option>
              <option value="pending">Pending Specimen Draw</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Laboratory Findings & Numerical Markers
            </label>
            <textarea
              rows={4}
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              placeholder="e.g. WBC: 7.4 x10^9/L (Normal 4.5-11.0), Hemoglobin: 14.8 g/dL (Normal 13.8-17.2), Platelets: 250 x10^9/L. All parameters within expected physiological limits."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm font-mono focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Technician Quality Control & Equipment Notes
            </label>
            <input
              type="text"
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
              placeholder="e.g. Automated hematology analyzer calibrated, serum unhemolyzed"
              className="w-full rounded-xl border border-slate-300 py-2.5 px-3.5 text-sm focus:border-brand-500 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsResultModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSavingResult} icon={Save}>
              Save Findings
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LabResults;
