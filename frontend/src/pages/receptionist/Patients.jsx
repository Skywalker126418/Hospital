import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  Stethoscope,
  FlaskConical,
  Receipt,
  X
} from 'lucide-react';
import { patientService } from '../../services/patientService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner, { TableSkeleton } from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });

  // View Patient Details State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('overview');

  // Edit Patient State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const { success, error } = useToast();
  const location = useLocation();

  const fetchPatients = async (page = 1, searchQuery = search, status = statusFilter) => {
    try {
      setLoading(true);
      const res = await patientService.getPatients({
        page,
        limit: pagination.limit,
        search: searchQuery,
        status,
      });
      if (res.success) {
        setPatients(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch patients list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (code) {
      setSearch(code);
      fetchPatients(1, code, '');
    } else {
      fetchPatients(1);
    }
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(1, search, statusFilter);
  };

  const handleViewPatient = async (id) => {
    try {
      setProfileLoading(true);
      setIsViewModalOpen(true);
      setActiveProfileTab('overview');
      const res = await patientService.getPatientById(id);
      if (res.success) {
        setSelectedPatient(res.data);
      }
    } catch (err) {
      error(err.message || 'Failed to load patient profile.');
      setIsViewModalOpen(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleOpenEdit = (pat) => {
    setEditFormData({
      ...pat,
      date_of_birth: pat.date_of_birth ? pat.date_of_birth.slice(0, 10) : '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      await patientService.updatePatient(editFormData.id, editFormData);
      success('Patient information updated successfully.');
      setIsEditModalOpen(false);
      fetchPatients(pagination.page);
    } catch (err) {
      error(err.message || 'Failed to update patient details.');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Medical Directory"
        subtitle="Manage permanent patient records, view clinical histories, and update contact profiles."
        actions={
          <Link to="/receptionist/patients/register">
            <Button variant="primary" icon={UserPlus}>
              Register New Patient
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, patient code (PAT-...), phone, or email..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearch('');
                fetchPatients(1, '', statusFilter);
              }}
            >
              Clear
            </Button>
          )}
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              fetchPatients(1, search, e.target.value);
            }}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Patients</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : patients.length === 0 ? (
          <EmptyState
            title="No patient records found"
            description="Try adjusting your search criteria or register a new patient."
            actionLabel="Register Patient"
            onAction={() => (window.location.href = '/receptionist/patients/register')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Patient ID</th>
                  <th className="px-5 py-3.5">Full Name</th>
                  <th className="px-5 py-3.5">Age / Gender</th>
                  <th className="px-5 py-3.5">Phone Contact</th>
                  <th className="px-5 py-3.5">Blood Group</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4 font-mono font-medium text-xs text-brand-600">
                      {pat.patient_code}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{pat.full_name}</div>
                      <div className="text-xs text-slate-400">{pat.email || 'No email provided'}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {pat.age} yrs • {pat.gender}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {pat.phone}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {pat.blood_group || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pat.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {pat.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Eye}
                          onClick={() => handleViewPatient(pat.id)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Edit}
                          onClick={() => handleOpenEdit(pat)}
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.totalRecords} records)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => fetchPatients(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchPatients(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Patient Detailed Profile Modal (Rule 21) */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedPatient ? `${selectedPatient.full_name} (${selectedPatient.patient_code})` : 'Patient Record'}
        subtitle="Comprehensive clinical history, past consultations, prescriptions, lab results, and appointments"
        maxWidth="max-w-4xl"
      >
        {profileLoading || !selectedPatient ? (
          <LoadingSpinner size="md" text="Loading comprehensive clinical records..." />
        ) : (
          <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
              {[
                { id: 'overview', label: 'Demographics & Vitals' },
                { id: 'consultations', label: `Consultations (${selectedPatient.consultations?.length || 0})` },
                { id: 'prescriptions', label: `Prescriptions (${selectedPatient.prescriptions?.length || 0})` },
                { id: 'lab', label: `Lab Results (${selectedPatient.laboratory_tests?.length || 0})` },
                { id: 'appointments', label: `Appointments (${selectedPatient.appointments?.length || 0})` },
                { id: 'billing', label: `Billing & Invoices (${selectedPatient.bills?.length || 0})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveProfileTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    activeProfileTab === tab.id
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeProfileTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                    Patient Details
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Birth:</span>
                    <span className="font-medium text-slate-800">{selectedPatient.date_of_birth?.slice(0, 10)} ({selectedPatient.age} years)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gender:</span>
                    <span className="font-medium text-slate-800">{selectedPatient.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">National ID:</span>
                    <span className="font-medium text-slate-800">{selectedPatient.national_id || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-medium text-slate-800">{selectedPatient.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-medium text-slate-800">{selectedPatient.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Address:</span>
                    <span className="font-medium text-slate-800 text-right">{selectedPatient.address}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                    Clinical Flags & Emergency
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Blood Group:</span>
                    <span className="px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800">
                      {selectedPatient.blood_group || 'Unspecified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Documented Allergies:</span>
                    <p className={`p-2 rounded font-medium ${
                      selectedPatient.allergies && selectedPatient.allergies !== 'None known'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {selectedPatient.allergies || 'No documented allergies'}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block mb-1">Emergency Contact:</span>
                    <p className="font-semibold text-slate-800">
                      {selectedPatient.emergency_contact_name || 'None listed'}
                    </p>
                    <p className="text-slate-600">{selectedPatient.emergency_contact_phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Consultations */}
            {activeProfileTab === 'consultations' && (
              <div className="space-y-3">
                {selectedPatient.consultations?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center">No consultations recorded yet.</p>
                ) : (
                  selectedPatient.consultations.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                        <span className="font-bold text-slate-800">{c.consultation_date?.slice(0, 10)}</span>
                        <span className="text-brand-600 font-medium">{c.doctor_name} ({c.specialization})</span>
                      </div>
                      <div>
                        <strong className="text-slate-700">Diagnosis:</strong>
                        <p className="text-slate-900 font-medium mt-0.5">{c.diagnosis}</p>
                      </div>
                      <div>
                        <strong className="text-slate-700">Treatment:</strong>
                        <p className="text-slate-600 mt-0.5">{c.treatment}</p>
                      </div>
                      {c.notes && (
                        <div>
                          <strong className="text-slate-700">Clinical Notes:</strong>
                          <p className="text-slate-500 mt-0.5">{c.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Prescriptions */}
            {activeProfileTab === 'prescriptions' && (
              <div className="space-y-4">
                {selectedPatient.prescriptions?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center">No prescriptions recorded.</p>
                ) : (
                  selectedPatient.prescriptions.map((rx) => (
                    <div key={rx.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-bold text-slate-800">Date: {rx.prescription_date?.slice(0, 10)}</span>
                        <span className="text-brand-600">Prescribed by: {rx.doctor_name}</span>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {rx.items?.map((item) => (
                          <div key={item.id} className="flex justify-between p-2 rounded bg-white border border-slate-200">
                            <div>
                              <span className="font-semibold text-slate-900">{item.medicine_name}</span>
                              <span className="text-slate-500 ml-2">({item.dosage})</span>
                              <p className="text-[11px] text-slate-400 mt-0.5">{item.instructions}</p>
                            </div>
                            <div className="text-right text-slate-600">
                              <div>{item.frequency}</div>
                              <div className="text-[11px] text-slate-400">{item.duration}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Lab Results */}
            {activeProfileTab === 'lab' && (
              <div className="space-y-3">
                {selectedPatient.laboratory_tests?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center">No laboratory diagnostics on file.</p>
                ) : (
                  selectedPatient.laboratory_tests.map((lab) => (
                    <div key={lab.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{lab.test_name}</span>
                        <span className={`badge-${lab.status}`}>{lab.status}</span>
                      </div>
                      <p className="text-slate-500">{lab.description}</p>
                      {lab.result && (
                        <div className="p-3 bg-white border border-slate-200 rounded-lg">
                          <strong className="text-slate-700 block mb-1">Laboratory Findings:</strong>
                          <p className="text-slate-800 font-mono text-[11px]">{lab.result}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Appointments */}
            {activeProfileTab === 'appointments' && (
              <div className="space-y-2">
                {selectedPatient.appointments?.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{appt.appointment_date} at {appt.appointment_time?.slice(0, 5)}</span>
                      <p className="text-slate-500">{appt.reason}</p>
                    </div>
                    <div className="text-right">
                      <span className={`badge-${appt.status}`}>{appt.status}</span>
                      <p className="text-[11px] text-slate-400 mt-1">{appt.doctor_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Billing */}
            {activeProfileTab === 'billing' && (
              <div className="space-y-3">
                {selectedPatient.bills?.map((bill) => (
                  <div key={bill.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span>Invoice #{bill.invoice_number}</span>
                      <span className={`badge-${bill.payment_status}`}>{bill.payment_status}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Total: ${parseFloat(bill.total_amount).toFixed(2)}</span>
                      <span>Paid: ${parseFloat(bill.paid_amount).toFixed(2)}</span>
                      <span className="font-semibold text-rose-600">Balance: ${parseFloat(bill.remaining_balance).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Close Record
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Patient: ${editFormData.first_name} ${editFormData.last_name}`}
        subtitle="Update contact and demographic details"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={editFormData.first_name || ''}
              onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={editFormData.last_name || ''}
              onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              value={editFormData.phone || ''}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              required
            />
            <Input
              label="Email"
              value={editFormData.email || ''}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            />
          </div>

          <Input
            label="Address"
            value={editFormData.address || ''}
            onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Emergency Contact Name"
              value={editFormData.emergency_contact_name || ''}
              onChange={(e) => setEditFormData({ ...editFormData, emergency_contact_name: e.target.value })}
            />
            <Input
              label="Emergency Contact Phone"
              value={editFormData.emergency_contact_phone || ''}
              onChange={(e) => setEditFormData({ ...editFormData, emergency_contact_phone: e.target.value })}
            />
          </div>

          <Input
            label="Allergies"
            value={editFormData.allergies || ''}
            onChange={(e) => setEditFormData({ ...editFormData, allergies: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={editSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Patients;
