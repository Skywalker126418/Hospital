import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  CalendarPlus,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { patientService } from '../../services/patientService';
import { reportService } from '../../services/reportService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/Loading';

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);

      const [summaryRes, apptsRes, patientsRes] = await Promise.all([
        reportService.getDashboardSummary(),
        appointmentService.getAppointments({ date: today, limit: 10 }),
        patientService.getPatients({ limit: 5 }),
      ]);

      if (summaryRes.success) setStats(summaryRes.data.stats);
      if (apptsRes.success) setTodayAppointments(apptsRes.data);
      if (patientsRes.success) setRecentPatients(patientsRes.data);
    } catch (err) {
      error(err.message || 'Failed to load reception dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async (appointmentId) => {
    try {
      await appointmentService.updateStatus(appointmentId, 'confirmed', 'Patient checked in at reception');
      success('Patient checked in and confirmed!');
      loadData();
    } catch (err) {
      error(err.message || 'Check-in failed.');
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading reception workstation..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reception Desk Workstation"
        subtitle="Manage patient registration, arrivals, triage check-ins, and appointments."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/receptionist/patients/register">
              <Button variant="primary" icon={UserPlus}>
                Register Patient
              </Button>
            </Link>
            <Link to="/receptionist/appointments/book">
              <Button variant="outline" icon={CalendarPlus}>
                Book Appointment
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Appointments</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.todayAppointments ?? 0}</h3>
            <p className="text-xs text-brand-600 mt-1 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Scheduled for today
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Registered Patients</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalPatients ?? 0}</h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Active medical profiles
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Doctors on Duty</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalDoctors ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-1">Available for consultation</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Visits</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.completedConsultations ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-1">Consultations finalized</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Arrivals & Quick Registration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Appointments Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Appointment Schedule</h2>
              <p className="text-xs text-slate-500">Check in arriving patients to alert attending physicians.</p>
            </div>
            <Link
              to="/receptionist/appointments"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Doctor</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-xs">
                      No appointments scheduled for today yet.
                    </td>
                  </tr>
                ) : (
                  todayAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {appt.appointment_time?.slice(0, 5)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800">{appt.patient_name}</div>
                        <div className="text-xs text-slate-400">{appt.patient_code}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800">{appt.doctor_name}</div>
                        <div className="text-xs text-slate-400">{appt.doctor_specialization}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`badge-${appt.status}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {appt.status === 'scheduled' ? (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleCheckIn(appt.id)}
                          >
                            Check In
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400">
                            {appt.status === 'confirmed' ? 'Checked In' : 'Completed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Recent Patients Directory */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Patients</h3>
                <p className="text-xs text-slate-500">Quick access to patient files</p>
              </div>
              <Link to="/receptionist/patients" className="text-xs font-semibold text-brand-600 hover:underline">
                All
              </Link>
            </div>

            <div className="space-y-3">
              {recentPatients.map((pat) => (
                <div
                  key={pat.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-brand-50/30 hover:border-brand-200 transition flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{pat.full_name}</p>
                    <p className="text-xs text-slate-500">
                      {pat.patient_code} • {pat.gender}, {pat.age} yrs
                    </p>
                  </div>
                  <Link to={`/receptionist/patients?code=${pat.patient_code}`}>
                    <Button size="sm" variant="ghost" className="text-brand-600">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-100">
            <Link to="/receptionist/patients/register" className="block">
              <Button variant="outline" className="w-full" icon={UserPlus}>
                Register New Patient Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
