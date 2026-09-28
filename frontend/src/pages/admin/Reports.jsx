import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Printer,
  DollarSign,
  Download,
  Users,
  FlaskConical,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const Reports = () => {
  const [reportType, setReportType] = useState('revenue');
  const [period, setPeriod] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { error: toastError } = useToast();

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await reportService.getReports({
        type: reportType,
        period,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      toastError('Failed to generate report audit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [reportType, period]);

  const handleApplyCustomDate = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      loadReports();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Reports & Analytical Auditing"
        subtitle="Compile financial revenue statements, clinical consultations, patient registration growth, and diagnostic volumes."
        actions={
          <Button variant="outline" icon={Printer} onClick={() => window.print()} className="no-print">
            Print Official Report
          </Button>
        }
      />

      {/* Report Category Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4 no-print">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {[
            { id: 'revenue', label: 'Financial Revenue & Invoices', icon: DollarSign },
            { id: 'appointments', label: 'Appointments & Consultations', icon: Calendar },
            { id: 'laboratory', label: 'Laboratory Diagnostics', icon: FlaskConical },
            { id: 'patients', label: 'Patient Registration Growth', icon: Users },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setReportType(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                reportType === cat.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Date Period Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {['today', 'this_week', 'this_month'].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p);
                  setStartDate('');
                  setEndDate('');
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  period === p
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p === 'today' ? 'Today' : p === 'this_week' ? 'Past 7 Days' : 'This Month'}
              </button>
            ))}
          </div>

          <form onSubmit={handleApplyCustomDate} className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-500 font-medium">Custom Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-300 text-xs bg-slate-50"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-300 text-xs bg-slate-50"
            />
            <Button size="sm" type="submit" variant="secondary">
              Apply
            </Button>
          </form>
        </div>
      </div>

      {/* Printable Report Data Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 print-area">
        <div className="pb-4 mb-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
              {reportType === 'revenue' && 'Revenue & Accounts Receivable Statement'}
              {reportType === 'appointments' && 'Clinical Appointment Utilization Report'}
              {reportType === 'laboratory' && 'Laboratory Diagnostics Assay Volume Audit'}
              {reportType === 'patients' && 'Patient Registration Demographics Report'}
            </h2>
            <p className="text-xs text-slate-500">
              Generated: {new Date().toLocaleString()} • Filter Period: {period.replace('_', ' ').toUpperCase()}
            </p>
          </div>
          <span className="text-xs font-bold font-mono px-2 py-1 bg-slate-100 rounded text-slate-700">
            {reportData.length} records analyzed
          </span>
        </div>

        {loading ? (
          <LoadingSpinner size="md" text="Calculating analytical dataset..." />
        ) : reportData.length === 0 ? (
          <EmptyState
            title="No records matching filter parameters"
            description="Adjust the date criteria to generate report data."
          />
        ) : (
          <div className="overflow-x-auto text-xs">
            {reportType === 'revenue' && (
              <table className="w-full text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Paid Amount</th>
                    <th className="p-3">Payment Method</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{r.invoice_number}</td>
                      <td className="p-3">{r.invoice_date?.slice(0, 10)}</td>
                      <td className="p-3 font-medium text-slate-800">{r.patient_name}</td>
                      <td className="p-3 font-bold text-slate-900">${parseFloat(r.total_amount).toFixed(2)}</td>
                      <td className="p-3 text-emerald-600 font-semibold">${parseFloat(r.paid_amount).toFixed(2)}</td>
                      <td className="p-3 uppercase font-medium">{r.payment_method || 'Unpaid'}</td>
                      <td className="p-3">
                        <span className={`badge-${r.payment_status}`}>{r.payment_status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'appointments' && (
              <table className="w-full text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Appointment Date</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Attending Physician</th>
                    <th className="p-3">Chief Complaint</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-900">{r.appointment_date}</td>
                      <td className="p-3 font-mono">{r.appointment_time?.slice(0, 5)}</td>
                      <td className="p-3 font-semibold text-slate-800">{r.patient_name}</td>
                      <td className="p-3">{r.doctor_name} ({r.specialization})</td>
                      <td className="p-3 max-w-xs truncate">{r.reason}</td>
                      <td className="p-3">
                        <span className={`badge-${r.status}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'laboratory' && (
              <table className="w-full text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Request Date</th>
                    <th className="p-3">Assay Test Name</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Ordering Doctor</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3">{r.request_date?.slice(0, 10)}</td>
                      <td className="p-3 font-bold text-slate-900">{r.test_name}</td>
                      <td className="p-3">{r.patient_name}</td>
                      <td className="p-3">{r.doctor_name}</td>
                      <td className="p-3">
                        <span className={`badge-${r.status}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'patients' && (
              <table className="w-full text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Registration Date</th>
                    <th className="p-3">Patient Code</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Blood Group</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3">{r.created_at?.slice(0, 10)}</td>
                      <td className="p-3 font-mono font-bold text-brand-600">{r.patient_code}</td>
                      <td className="p-3 font-semibold text-slate-900">{r.patient_name}</td>
                      <td className="p-3">{r.gender}</td>
                      <td className="p-3">{r.phone}</td>
                      <td className="p-3 font-bold text-rose-700">{r.blood_group || 'N/A'}</td>
                      <td className="p-3">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
