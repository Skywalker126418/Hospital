import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  UserCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  FlaskConical,
  Building,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/Loading';
import MedicalObjectViewer from '../../components/3d/MedicalObjectViewer';
import HospitalModel from '../../components/3d/HospitalModel';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('Central Hospital Inpatient Tower');
  const { error } = useToast();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await reportService.getDashboardSummary();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        error(err.message || 'Failed to load executive dashboard summary.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) return <LoadingSpinner size="lg" text="Loading hospital executive metrics..." />;

  const { stats, recentAppointments, recentActivities, monthlyAppointments } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Hospital Overview"
        subtitle="Operational metrics, patient flow analytics, financial revenue, and clinical resource allocation."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/reports">
              <Button variant="outline">
                Financial Reports
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="primary" icon={ShieldCheck}>
                Manage Staff
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Collected Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">${stats.totalRevenue?.toLocaleString()}</h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Pending: ${stats.pendingRevenue?.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Patients Active */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Patients</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalPatients}</h3>
            <p className="text-xs text-brand-600 mt-1 font-medium">Across all departments</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Clinical Staff */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Physicians</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalDoctors}</h3>
            <p className="text-xs text-purple-600 mt-1 font-medium">{stats.totalReceptionists} Receptionists</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
        </div>

        {/* Diagnostics & Consultations */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Visits</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.completedConsultations}</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">{stats.pendingLabTests} Pending lab tests</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: 3D Hospital Facility Model & Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Medical Facility Pavilion */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hospital Facility Campus Pavilion</h3>
                <p className="text-xs text-slate-500">Interactive architectural campus department locator</p>
              </div>
              <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                Live Spatial Mesh
              </span>
            </div>

            <div className="w-full h-80 rounded-xl overflow-hidden mb-3">
              <MedicalObjectViewer
                title="Metropolitan Health Campus Facility"
                badge="Campus Architecture"
                height="h-full"
              >
                <HospitalModel
                  selectedDepartment={selectedDept}
                  onSelectDepartment={(dept) => setSelectedDept(dept)}
                />
              </MedicalObjectViewer>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
              <span className="text-slate-500">Active Department Hotspot:</span>
              <span className="font-bold text-brand-700">{selectedDept}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Click emergency wing or pavilions to inspect departmental loads</span>
            <Link to="/admin/settings" className="text-brand-600 font-semibold hover:underline">
              Facility Preferences →
            </Link>
          </div>
        </div>

        {/* Right Column: Monthly Appointment Trends Chart & System Logs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Monthly Appointment Trend */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h3 className="text-base font-bold text-slate-900 mb-1">Appointment Inflow Trend</h3>
            <p className="text-xs text-slate-500 mb-4">Recorded clinical consultations over recent months</p>

            <div className="space-y-3">
              {monthlyAppointments.map((m, i) => {
                const max = Math.max(...monthlyAppointments.map((x) => x.count), 5);
                const percent = Math.min(100, Math.round((m.count / max) * 100));
                return (
                  <div key={i} className="text-xs space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-700">{m.month}</span>
                      <span className="text-brand-600 font-bold">{m.count} visits</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time System Activity Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h3 className="text-base font-bold text-slate-900 mb-3">Live Hospital Activity Audit</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto text-xs">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-2.5 pb-2 border-b border-slate-100 last:border-none">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{act.title}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
