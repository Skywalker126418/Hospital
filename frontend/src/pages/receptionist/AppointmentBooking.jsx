import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/Loading';

const AppointmentBooking = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');

  // Selected state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Loading states
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedResult, setBookedResult] = useState(null);

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  // Load initial doctors & patient search suggestions
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await doctorService.getDoctors();
        if (res.success) {
          setDoctors(res.data);
          const firstAvailable = res.data.find((d) => d.duty_status === 'available');
          if (firstAvailable) setSelectedDoctor(firstAvailable);
        }
      } catch (err) {
        toastError('Failed to load available physicians.');
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, []);

  // Fetch slots whenever selected doctor or date changes
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;

    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        setSelectedSlot('');
        const res = await doctorService.getDoctorSlots(selectedDoctor.id, selectedDate);
        if (res.success) {
          setAvailableSlots(res.slots);
        }
      } catch (err) {
        toastError('Failed to compute time slots.');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  // Patient search query debounce
  useEffect(() => {
    if (!patientSearch.trim()) {
      setPatients([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await patientService.getPatients({ search: patientSearch, limit: 6 });
        if (res.success) setPatients(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  const handleOpenReview = (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      toastError('Please select a registered patient.');
      return;
    }
    if (!selectedDoctor) {
      toastError('Please select an attending doctor.');
      return;
    }
    if (selectedDoctor.duty_status !== 'available') {
      toastError(
        `Doctor ${selectedDoctor.name} is currently ${
          selectedDoctor.duty_status === 'attending' ? 'attending another patient' : 'off duty today'
        }. Receptionists can only assign available doctors.`
      );
      return;
    }
    if (!selectedDate) {
      toastError('Please select an appointment date.');
      return;
    }
    if (!selectedSlot) {
      toastError('Please choose an available time slot.');
      return;
    }
    if (!reason.trim()) {
      toastError('Please enter the clinical reason or symptoms for the appointment.');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleFinalConfirmBooking = async () => {
    setIsBooking(true);
    try {
      const payload = {
        patient_id: selectedPatient.id,
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        appointment_time: selectedSlot,
        reason: reason.trim(),
        notes: notes.trim(),
      };

      const res = await appointmentService.createAppointment(payload);
      success('✓ Appointment Booked Successfully');
      setIsConfirmModalOpen(false);
      setBookedResult(res.data);
    } catch (err) {
      toastError(err.message || 'Double-booking prevention: Slot unavailable.');
    } finally {
      setIsBooking(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.department?.toLowerCase().includes(doctorSearch.toLowerCase());
    const matchesSpecialty = selectedSpecialty
      ? doc.specialization.toLowerCase().includes(selectedSpecialty.toLowerCase())
      : true;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Schedule Patient Appointment"
        subtitle="Book physician consultations, verify real-time slot availability, and eliminate double-booking."
      />

      {bookedResult ? (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 sm:p-10 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">✓ Appointment Booked Successfully</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            The consultation has been scheduled and committed persistently to MySQL database.
          </p>

          <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-2.5 mb-8 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-800">{bookedResult.patient_name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Attending Physician:</span>
              <span className="font-semibold text-brand-600">{bookedResult.doctor_name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Date:</span>
              <span className="font-medium text-slate-800">{bookedResult.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Time:</span>
              <span className="font-bold text-slate-900">{bookedResult.time}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/receptionist/appointments')}
            >
              View Appointment Schedule
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setBookedResult(null);
                setSelectedSlot('');
                setReason('');
                setNotes('');
              }}
            >
              Book Another Appointment
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleOpenReview} className="space-y-6">
          {/* Step 1: Select Patient */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="text-base font-bold text-slate-900">Select Patient</h3>
              </div>
              {selectedPatient && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected: {selectedPatient.full_name}
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Type patient name, ID (e.g. PAT-2026-001) or phone number to search..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-brand-500"
              />
            </div>

            {/* Suggestions dropdown */}
            {patients.length > 0 && !selectedPatient && (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white shadow-md max-h-48 overflow-y-auto">
                {patients.map((pat) => (
                  <div
                    key={pat.id}
                    onClick={() => {
                      setSelectedPatient(pat);
                      setPatientSearch(`${pat.full_name} (${pat.patient_code})`);
                      setPatients([]);
                    }}
                    className="p-3 hover:bg-brand-50 cursor-pointer flex items-center justify-between transition text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{pat.full_name}</span>
                      <span className="ml-2 font-mono text-brand-600">{pat.patient_code}</span>
                      <p className="text-slate-500">{pat.phone} • Age: {pat.age} yrs • Blood: {pat.blood_group || 'N/A'}</p>
                    </div>
                    <Button size="sm" variant="outline">Select</Button>
                  </div>
                ))}
              </div>
            )}

            {selectedPatient && (
              <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{selectedPatient.full_name}</span>
                  <span className="ml-2 font-mono text-brand-700 font-semibold">{selectedPatient.patient_code}</span>
                  <p className="text-slate-600 mt-1">Phone: {selectedPatient.phone} • Blood: {selectedPatient.blood_group || 'N/A'} • Allergies: {selectedPatient.allergies || 'None'}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientSearch('');
                  }}
                >
                  Change Patient
                </Button>
              </div>
            )}
          </div>

          {/* Step 2: Sickness Triage & Choose Attending Physician */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">2</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sickness Triage & Doctor Assignment</h3>
                  <p className="text-xs text-slate-500">Understand the patient's condition and assign an available matching specialist.</p>
                </div>
              </div>
              <input
                type="text"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder="Search physician..."
                className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg w-full sm:w-48"
              />
            </div>

            {/* Sickness / Specialty Triage Filter */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Patient Sickness Category / Specialist Required:
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => {
                  setSelectedSpecialty(e.target.value);
                  setSelectedDoctor(null);
                }}
                className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500 font-medium text-slate-800"
              >
                <option value="">All Specialties / General Roster</option>
                <option value="General">General Medicine / Internal (Fever, Flu, Infections)</option>
                <option value="Cardiology">Cardiology (Heart, Chest Pain, Blood Pressure)</option>
                <option value="Pediatrics">Pediatrics (Child & Infant Health)</option>
                <option value="Orthopedics">Orthopedics (Bones, Joints, Fractures & Spine)</option>
                <option value="Dermatology">Dermatology (Skin Rash, Allergies, Eczema)</option>
                <option value="Neurology">Neurology (Headaches, Nerves, Brain)</option>
                <option value="ENT">ENT (Ear, Nose & Throat Infections)</option>
                <option value="Gynecology">Gynecology & Obstetrics (Women's Health)</option>
                <option value="Surgery">General Surgery (Surgical Evaluation)</option>
              </select>
            </div>

            {loadingDoctors ? (
              <LoadingSpinner size="sm" text="Loading physicians..." />
            ) : filteredDoctors.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                No doctors found matching the selected sickness specialization or search query.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredDoctors.map((doc) => {
                  const isAvailable = doc.duty_status === 'available';
                  const isAttending = doc.duty_status === 'attending';
                  const isOffDuty = doc.duty_status === 'off_duty';
                  const isSelected = selectedDoctor?.id === doc.id;

                  const handleSelectDoctor = () => {
                    if (!isAvailable) {
                      toastError(
                        isAttending
                          ? `Dr. ${doc.name} is currently attending another patient and cannot take new assignments.`
                          : `Dr. ${doc.name} does not attend today and is unavailable.`
                      );
                      return;
                    }
                    setSelectedDoctor(doc);
                  };

                  return (
                    <div
                      key={doc.id}
                      onClick={handleSelectDoctor}
                      className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                        !isAvailable
                          ? 'opacity-60 bg-slate-100/80 border-slate-200 cursor-not-allowed'
                          : isSelected
                          ? 'border-brand-600 bg-brand-50/70 shadow-xs ring-2 ring-brand-500 cursor-pointer'
                          : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            isSelected
                              ? 'bg-brand-600 text-white'
                              : isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {doc.name.replace('Dr. ', '').charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-slate-900 text-xs truncate">{doc.name}</h4>
                          <p className="text-[11px] text-brand-600 font-medium truncate">{doc.specialization}</p>
                          <p className="text-[10px] text-slate-500 truncate">{doc.department}</p>
                        </div>
                      </div>

                      {/* Duty Status Badge */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-medium">Duty Status:</span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isAvailable
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              : isAttending
                              ? 'bg-amber-100 text-amber-700 border border-amber-300'
                              : 'bg-rose-100 text-rose-700 border border-rose-300'
                          }`}
                        >
                          {isAvailable
                            ? '✓ Available'
                            : isAttending
                            ? '⏳ Attending'
                            : '✕ Off Duty'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Date & Available Time Slot */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="text-base font-bold text-slate-900">Select Date & Time Slot</h3>
              </div>
            </div>

            <div className="max-w-xs">
              <Input
                label="Appointment Date"
                type="date"
                value={selectedDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Available Slots for {selectedDoctor?.name || 'Selected Doctor'}
                </label>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded bg-white border border-slate-300"></span> Available
                  </span>
                  <span className="flex items-center gap-1 text-brand-700 font-medium">
                    <span className="w-2.5 h-2.5 rounded bg-brand-600"></span> Selected
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded bg-slate-200"></span> Unavailable
                  </span>
                </div>
              </div>

              {loadingSlots ? (
                <LoadingSpinner size="sm" text="Checking real-time doctor schedule..." />
              ) : availableSlots.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Please select an attending doctor to see available times.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.rawTime;
                    const isAvailable = slot.isAvailable;

                    return (
                      <button
                        key={slot.rawTime}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(slot.rawTime)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition border text-center ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                            : isAvailable
                            ? 'bg-white hover:bg-brand-50 border-slate-300 text-slate-700'
                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Reason for Visit */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">4</span>
              <h3 className="text-base font-bold text-slate-900">Clinical Reason & Notes</h3>
            </div>

            <Input
              label="Chief Complaint / Reason for Appointment"
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Persistent cough and mild fever for 3 days, routine checkup, hypertension followup"
              required
            />

            <Input
              label="Administrative Notes (Optional)"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Patient arriving in wheelchair, requested morning slot"
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={CalendarIcon}
              >
                Review & Confirm Booking
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Confirmation Modal (Rule 23) */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Appointment"
        subtitle="Please review the appointment details before reserving the slot in MySQL."
      >
        <div className="space-y-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-900">{selectedPatient?.full_name} ({selectedPatient?.patient_code})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Doctor:</span>
              <span className="font-semibold text-brand-600">{selectedDoctor?.name} ({selectedDoctor?.specialization})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="font-medium text-slate-800">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time:</span>
              <span className="font-bold text-slate-900">{selectedSlot?.slice(0, 5)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-500 block text-xs">Reason:</span>
              <p className="text-slate-800 text-xs italic">{reason}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              isLoading={isBooking}
              icon={CheckCircle2}
              onClick={handleFinalConfirmBooking}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppointmentBooking;
