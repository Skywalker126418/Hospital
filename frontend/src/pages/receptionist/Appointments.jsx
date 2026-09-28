import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  CalendarPlus,
  RefreshCw,
  AlertCircle,
  Eye,
  UserCheck
} from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { TableSkeleton } from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });

  // Reschedule State
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [targetAppointment, setTargetAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Status Change State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { success, error } = useToast();

  const fetchAppointments = async (page = 1) => {
    try {
      setLoading(true);
      const res = await appointmentService.getAppointments({
        page,
        limit: pagination.limit,
        search,
        status: statusFilter,
        date: dateFilter,
      });
      if (res.success) {
        setAppointments(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      error(err.message || 'Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(1);
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments(1);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      success(`Appointment marked as ${newStatus}.`);
      fetchAppointments(pagination.page);
    } catch (err) {
      error(err.message || 'Failed to update status.');
    }
  };

  const handleOpenReschedule = (appt) => {
    setTargetAppointment(appt);
    setNewDate(appt.appointment_date);
    setNewTime(appt.appointment_time?.slice(0, 5) || '09:00');
    setIsRescheduleOpen(true);
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    setIsRescheduling(true);
    try {
      await appointmentService.reschedule(targetAppointment.id, newDate, newTime);
      success('Appointment successfully rescheduled.');
      setIsRescheduleOpen(false);
      fetchAppointments(pagination.page);
    } catch (err) {
      error(err.message || 'Slot conflict or rescheduling error.');
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      await appointmentService.updateStatus(targetAppointment.id, 'cancelled', 'Cancelled by patient or reception');
      success('Appointment has been cancelled.');
      setIsCancelModalOpen(false);
      fetchAppointments(pagination.page);
    } catch (err) {
      error(err.message || 'Failed to cancel appointment.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointment Master Schedule"
        subtitle="Manage upcoming clinical visits, update patient check-in statuses, or reschedule times."
        actions={
          <Link to="/receptionist/appointments/book">
            <Button variant="primary" icon={CalendarPlus}>
              Book New Appointment
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient, physician, or symptoms..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed / Checked-in</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>

          {(search || statusFilter || dateFilter) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setDateFilter('');
                fetchAppointments(1);
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Appointment Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : appointments.length === 0 ? (
          <EmptyState
            title="No appointments match your filters"
            description="Clear the filters or book a new appointment."
            actionLabel="Book Appointment"
            onAction={() => (window.location.href = '/receptionist/appointments/book')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Schedule Date & Time</th>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Attending Doctor</th>
                  <th className="px-5 py-3.5">Reason for Visit</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{appt.appointment_date}</div>
                      <div className="text-xs text-brand-600 font-mono font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {appt.appointment_time?.slice(0, 5)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{appt.patient_name}</div>
                      <div className="text-xs text-slate-400">{appt.patient_code} • {appt.patient_phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">{appt.doctor_name}</div>
                      <div className="text-xs text-slate-400">{appt.doctor_specialization}</div>
                    </td>
                    <td className="px-5 py-4 text-xs max-w-xs truncate text-slate-600">
                      {appt.reason}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge-${appt.status}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {appt.status === 'scheduled' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                          >
                            Check-In
                          </Button>
                        )}
                        {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenReschedule(appt)}
                            >
                              Reschedule
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setTargetAppointment(appt);
                                setIsCancelModalOpen(true);
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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
                onClick={() => fetchAppointments(pagination.page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchAppointments(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Reschedule Appointment"
        subtitle={targetAppointment ? `Moving appointment for ${targetAppointment.patient_name}` : ''}
      >
        <form onSubmit={handleConfirmReschedule} className="space-y-4 text-sm">
          <Input
            label="New Appointment Date"
            type="date"
            value={newDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setNewDate(e.target.value)}
            required
          />

          <Input
            label="New Time Slot"
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsRescheduleOpen(false)}>
              Back
            </Button>
            <Button variant="primary" type="submit" isLoading={isRescheduling}>
              Save Rescheduled Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Confirm Appointment Cancellation"
        subtitle="This action will release the reserved time slot for other patients."
      >
        <div className="space-y-4 text-sm">
          <p className="text-slate-600">
            Are you sure you want to cancel the appointment for{' '}
            <strong>{targetAppointment?.patient_name}</strong> on{' '}
            <strong>{targetAppointment?.appointment_date}</strong>?
          </p>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Keep Appointment
            </Button>
            <Button variant="danger" onClick={handleCancelBooking}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;
