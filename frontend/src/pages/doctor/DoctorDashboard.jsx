import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Calendar,
  Clock,
  Users,
  FlaskConical,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { laboratoryService } from '../../services/laboratoryService';
import { doctorService } from '../../services/doctorService';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/Loading';
import MedicalObjectViewer from '../../components/3d/MedicalObjectViewer';
import HumanBodyModel from '../../components/3d/HumanBodyModel';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingLabTests, setPendingLabTests] = useState([]);
  const [stats, setStats] = useState({
    todayCount: 0,
    waitingPatients: 0,
    completedToday: 0,
    pendingLabs: 0,
  });
  const [loading, setLoading] = useState(true);

  // 3D Anatomy State
  const [anatomyLayer, setAnatomyLayer] = useState('all');
  const [selectedOrganInfo, setSelectedOrganInfo] = useState('Select any anatomical system or organ above to inspect clinical notes');

  const { error, success } = useToast();
  const [dutyStatus, setDutyStatus] = useState(user?.doctor?.duty_status || 'available');
  const [updatingDuty, setUpdatingDuty] = useState(false);

  const handleDutyStatusChange = async (newStatus) => {
    try {
      setUpdatingDuty(true);
      const doctorId = user?.doctor?.doctor_id || user?.id;
      const res = await doctorService.updateDutyStatus(doctorId, newStatus);
      if (res.success) {
        setDutyStatus(newStatus);
        success(`Duty status updated to: ${newStatus.replace('_', ' ').toUpperCase()}`);
      }
    } catch (err) {
      error(err.message || 'Failed to update duty status');
    } finally {
      setUpdatingDuty(false);
    }
  };

  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().slice(0, 10);

        const [apptsRes, labsRes] = await Promise.all([
          appointmentService.getAppointments({ date: today, limit: 10 }),
          laboratoryService.getTests({ status: 'pending', limit: 5 }),
        ]);

        if (apptsRes.success) {
          const list = apptsRes.data;
          setTodayAppointments(list);
          const waiting = list.filter((a) => a.status === 'confirmed').length;
          const completed = list.filter((a) => a.status === 'completed').length;
          setStats((prev) => ({
            ...prev,
            todayCount: list.length,
            waitingPatients: waiting,
            completedToday: completed,
          }));
        }

        if (labsRes.success) {
          setPendingLabTests(labsRes.data);
          setStats((prev) => ({ ...prev, pendingLabs: labsRes.pagination?.totalRecords || labsRes.data.length }));
        }
      } catch (err) {
        error(err.message || 'Failed to load physician workstation.');
      } finally {
        setLoading(false);
      }
    };

    loadDoctorData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading physician workstation..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Doctor Clinical Station — ${user?.name || 'Physician'}`}
        subtitle={`Specialization: ${user?.doctor?.specialization || 'General Internal Medicine'} • ${user?.doctor?.department || 'Clinical Outpatient'}`}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/doctor/consultation">
              <Button variant="primary" icon={Stethoscope}>
                New Consultation
              </Button>
            </Link>
            <Link to="/doctor/prescriptions">
              <Button variant="outline" icon={FileText}>
                Prescriptions
              </Button>
            </Link>
          </div>
        }
      />

      {/* Doctor Duty Status Bar (Affects Receptionist Triage Assignment) */}
      <div className="bg-[#0a192f] border border-slate-700/70 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Clinical Duty Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              dutyStatus === 'available'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                : dutyStatus === 'attending'
                ? 'bg-amber-950 text-amber-400 border border-amber-500/50'
                : 'bg-rose-950 text-rose-400 border border-rose-500/50'
            }`}>
              {dutyStatus === 'available' ? 'Available for Assignment' : dutyStatus === 'attending' ? 'Attending a Patient (Unavailable)' : 'Off Duty / Absent (Unavailable)'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Receptionists can only assign new patient consultations when your status is marked <strong className="text-emerald-300">Available</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={updatingDuty || dutyStatus === 'available'}
            onClick={() => handleDutyStatusChange('available')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              dutyStatus === 'available'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-500 hover:text-white'
            }`}
          >
            ✓ Available
          </button>
          <button
            type="button"
            disabled={updatingDuty || dutyStatus === 'attending'}
            onClick={() => handleDutyStatusChange('attending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              dutyStatus === 'attending'
                ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500 hover:text-white'
            }`}
          >
            ⏳ Attending Patient
          </button>
          <button
            type="button"
            disabled={updatingDuty || dutyStatus === 'off_duty'}
            onClick={() => handleDutyStatusChange('off_duty')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              dutyStatus === 'off_duty'
                ? 'bg-rose-700 text-white border-rose-600 shadow-md'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-rose-500 hover:text-white'
            }`}
          >
            ✕ Off Duty Today
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Schedule</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.todayCount}</h3>
            <p className="text-xs text-brand-600 mt-1 font-medium">Assigned appointments</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Waiting Area</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.waitingPatients}</h3>
            <p className="text-xs text-emerald-700 mt-1 font-medium">Checked-in at reception</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Visits</p>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">{stats.completedToday}</h3>
            <p className="text-xs text-slate-500 mt-1">Consultations saved</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Lab Tests</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingLabs}</h3>
            <p className="text-xs text-amber-700 mt-1 font-medium">Awaiting lab technician</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FlaskConical className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Waiting Room & 3D Interactive Anatomy Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Appointments Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Clinical Roster</h3>
                <p className="text-xs text-slate-500">Review patient complaints and initiate consultation.</p>
              </div>
              <Link to="/doctor/patients" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
                All Records <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Chief Complaint</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-xs">
                        No appointments currently scheduled for today.
                      </td>
                    </tr>
                  ) : (
                    todayAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3.5 font-medium text-slate-900">
                          {appt.appointment_time?.slice(0, 5)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-800 text-xs">{appt.patient_name}</div>
                          <div className="text-[11px] text-slate-400">{appt.patient_code}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs max-w-xs truncate text-slate-600">
                          {appt.reason}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`badge-${appt.status}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            to={`/doctor/consultation?appointmentId=${appt.id}&patientId=${appt.patient_id}`}
                          >
                            <Button size="sm" variant={appt.status === 'confirmed' ? 'primary' : 'outline'}>
                              {appt.status === 'completed' ? 'View Record' : 'Consult'}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Anatomical System & Organ Inspector */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Anatomical System Inspector</h3>
                <p className="text-xs text-slate-500">Interactive patient physiological reference</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setAnatomyLayer('all')}
                  className={`px-2 py-0.5 rounded ${anatomyLayer === 'all' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setAnatomyLayer('organs')}
                  className={`px-2 py-0.5 rounded ${anatomyLayer === 'organs' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                >
                  Organs
                </button>
                <button
                  type="button"
                  onClick={() => setAnatomyLayer('skeleton')}
                  className={`px-2 py-0.5 rounded ${anatomyLayer === 'skeleton' ? 'bg-white font-bold text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                >
                  Skeletal
                </button>
              </div>
            </div>

            {/* Interactive Anatomical Viewer */}
            <div className="w-full h-72 rounded-xl overflow-hidden mb-3">
              <MedicalObjectViewer
                title="Human Biological Architecture"
                badge="Interactive Mesh"
                height="h-full"
              >
                <HumanBodyModel
                  activeLayer={anatomyLayer}
                  selectedOrgan={selectedOrganInfo}
                  onSelectOrgan={(organ) => setSelectedOrganInfo(`Inspecting: ${organ}`)}
                />
              </MedicalObjectViewer>
            </div>

            {/* Organ Info Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span className="font-medium truncate">{selectedOrganInfo}</span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Click anatomical nodes to focus</span>
            <Link to="/doctor/lab-results" className="text-brand-600 font-semibold hover:underline">
              Inspect Diagnostics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
