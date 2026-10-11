import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Layout,
  UserPlus,
  CalendarPlus,
  Stethoscope,
  Receipt,
  CheckCircle2,
  Eye,
  Info,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';

const LowFidelityPrototype = () => {
  const [activeScreen, setActiveScreen] = useState('login');
  const navigate = useNavigate();

  // Wireframe state simulations
  const [mockEmail, setMockEmail] = useState('staff@hospital.com');
  const [mockSelectedDoc, setMockSelectedDoc] = useState('Dr. Smith - Cardio');
  const [mockSelectedSlot, setMockSelectedSlot] = useState('10:00');
  const [mockSearchQuery, setMockSearchQuery] = useState('');
  const [mockBillPaid, setMockBillPaid] = useState(false);
  const [mockPatientAdded, setMockPatientAdded] = useState(false);
  const [mockActiveTab, setMockActiveTab] = useState('consultations');

  const prototypeScreens = [
    { id: 'login', name: '1. Login & Auth', icon: Layout, liveRoute: '/login' },
    { id: 'registration', name: '2. Patient Registration', icon: UserPlus, liveRoute: '/receptionist/patients/register' },
    { id: 'booking', name: '3. Appointment Booking', icon: CalendarPlus, liveRoute: '/receptionist/appointments/book' },
    { id: 'doctor', name: '4. Doctor Dashboard', icon: Stethoscope, liveRoute: '/doctor/dashboard' },
    { id: 'records', name: '5. Patient Records', icon: Eye, liveRoute: '/doctor/patients' },
    { id: 'billing', name: '6. Billing & Invoicing', icon: Receipt, liveRoute: '/admin/billing' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="HCI Academic Artifact: Low-Fidelity Interactive Prototype"
        subtitle="Architectural wireframes, cognitive affordances, information architecture, and heuristic user flows."
        actions={
          <Button
            variant="outline"
            icon={ExternalLink}
            onClick={() => {
              const current = prototypeScreens.find((s) => s.id === activeScreen);
              if (current) navigate(current.liveRoute);
            }}
          >
            Launch Live Workstation Page
          </Button>
        }
      />

      {/* Screen Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        {prototypeScreens.map((screen) => {
          const Icon = screen.icon;
          const isActive = activeScreen === screen.id;
          return (
            <button
              key={screen.id}
              onClick={() => setActiveScreen(screen.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0a192f] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{screen.name}</span>
            </button>
          );
        })}
      </div>

      {/* Wireframe Mock Canvas & HCI Design Rationale */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Wireframe Diagram Canvas */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-dashed border-slate-300 p-6 sm:p-8 space-y-4 font-mono text-xs text-slate-600 shadow-sm">
          <div className="flex justify-between items-center pb-3 border-b-2 border-slate-200">
            <span className="font-extrabold text-[#0a192f] uppercase tracking-widest text-[11px]">
              [WIREFRAME-CANVAS] — {activeScreen.toUpperCase()}
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] font-bold">
              Interactive Wireframe Simulation
            </span>
          </div>

          {activeScreen === 'login' && (
            <div className="p-5 border-2 border-slate-300 rounded-2xl space-y-3 bg-slate-50/60">
              <div className="h-6 w-36 bg-[#0a192f] rounded flex items-center px-2 text-white font-bold text-[10px]">
                METROPOLITAN
              </div>
              <p className="text-slate-500 text-[11px]">Workstation Sign In Interface</p>
              <div className="space-y-2.5 pt-2">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Staff Email:</span>
                  <input
                    type="email"
                    value={mockEmail}
                    onChange={(e) => setMockEmail(e.target.value)}
                    className="w-full h-9 border-2 border-slate-300 rounded-lg bg-white px-3 text-slate-800 text-xs focus:border-[#064e3b]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Password:</span>
                  <input
                    type="password"
                    defaultValue="••••••••••••"
                    className="w-full h-9 border-2 border-slate-300 rounded-lg bg-white px-3 text-slate-800 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full h-10 bg-[#064e3b] hover:bg-[#047857] text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer transition-transform hover:scale-[1.01]"
                >
                  [BUTTON: Sign In to Workstation →]
                </button>
              </div>
            </div>
          )}

          {activeScreen === 'registration' && (
            <div className="p-5 border-2 border-slate-300 rounded-2xl space-y-3 bg-slate-50/60">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#0a192f] text-sm">New Patient Intake Form</span>
                {mockPatientAdded && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                    ✓ Simulated Record Saved
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input placeholder="First Name: John" className="h-8 border border-slate-300 bg-white rounded-lg px-2" />
                <input placeholder="Last Name: Doe" className="h-8 border border-slate-300 bg-white rounded-lg px-2" />
                <input placeholder="DOB: 1985-04-12" className="h-8 border border-slate-300 bg-white rounded-lg px-2" />
                <select className="h-8 border border-slate-300 bg-white rounded-lg px-2 text-slate-700">
                  <option>Male</option>
                  <option>Female</option>
                </select>
                <input placeholder="Phone: +1 555-0199" className="h-8 border border-slate-300 bg-white rounded-lg px-2" />
                <select className="h-8 border border-slate-300 bg-white rounded-lg px-2 text-slate-700">
                  <option>O+ (Positive)</option>
                  <option>A+ (Positive)</option>
                </select>
                <input placeholder="Residential Address" className="col-span-2 h-8 border border-slate-300 bg-white rounded-lg px-2" />
                <input placeholder="Known Allergies (Penicillin, etc.)" className="col-span-2 h-8 border border-rose-300 bg-rose-50/50 rounded-lg px-2 text-rose-900" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setMockPatientAdded(!mockPatientAdded)}
                  className="h-9 px-4 bg-[#064e3b] text-white rounded-xl flex items-center font-bold cursor-pointer hover:bg-[#047857]"
                >
                  {mockPatientAdded ? 'Reset Wireframe' : '[BUTTON: Save & Assign ID]'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/receptionist/patients/register')}
                  className="text-xs text-[#064e3b] font-bold hover:underline"
                >
                  Open Live Intake Form →
                </button>
              </div>
            </div>
          )}

          {activeScreen === 'booking' && (
            <div className="p-5 border-2 border-slate-300 rounded-2xl space-y-3 bg-slate-50/60">
              <span className="font-bold text-[#0a192f] text-sm block">Appointment Slot Allocation</span>
              <input
                type="text"
                value={mockSearchQuery}
                onChange={(e) => setMockSearchQuery(e.target.value)}
                placeholder="[Search Patient: Type Name or ID...]"
                className="w-full h-8 border border-slate-300 bg-white rounded-lg px-2"
              />
              <div className="grid grid-cols-3 gap-2">
                {[
                  'Dr. Claude - Gen Med',
                  'Dr. Smith - Cardio',
                  'Dr. Patel - Ped',
                ].map((doc) => (
                  <button
                    key={doc}
                    type="button"
                    onClick={() => setMockSelectedDoc(doc)}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition ${
                      mockSelectedDoc === doc
                        ? 'border-[#064e3b] bg-emerald-50 text-[#064e3b] font-bold ring-1 ring-[#064e3b]'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {doc}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-2">
                {['09:00', '10:00', '11:00', '14:00'].map((slot) => {
                  const isBooked = slot === '11:00';
                  const isSelected = mockSelectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setMockSelectedSlot(slot)}
                      className={`p-2 rounded-lg text-center cursor-pointer transition ${
                        isBooked
                          ? 'bg-slate-200 text-slate-400 line-through cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#064e3b] text-white font-bold'
                          : 'bg-white border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {slot} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-slate-500 font-sans">
                  Selected: <strong>{mockSelectedDoc}</strong> at <strong>{mockSelectedSlot}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/receptionist/appointments/book')}
                  className="h-8 px-3 bg-[#0a192f] text-white rounded-lg font-bold hover:bg-[#1b3353] cursor-pointer"
                >
                  Book on Live Calendar →
                </button>
              </div>
            </div>
          )}

          {activeScreen === 'doctor' && (
            <div className="p-5 border-2 border-slate-300 rounded-2xl space-y-3 bg-slate-50/60">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#0a192f] text-sm">Physician Active Queue</span>
                <span className="text-[10px] bg-[#ecfdf5] text-[#064e3b] px-2 py-0.5 rounded-full font-bold">
                  Live Queue Connected
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 border border-slate-300 rounded-lg bg-white text-center">
                  <span className="block text-slate-400 text-[10px]">Today</span>
                  <span className="font-bold text-slate-800">6 Visits</span>
                </div>
                <div className="p-2 border border-emerald-300 rounded-lg bg-emerald-50 text-center">
                  <span className="block text-emerald-700 text-[10px]">Waiting</span>
                  <span className="font-bold text-emerald-900">2 In Lobby</span>
                </div>
                <div className="p-2 border border-amber-300 rounded-lg bg-amber-50 text-center">
                  <span className="block text-amber-700 text-[10px]">Labs</span>
                  <span className="font-bold text-amber-900">1 Pending</span>
                </div>
              </div>
              <div className="border border-slate-300 rounded-xl bg-white p-2 divide-y divide-slate-100">
                <div className="py-2 flex justify-between items-center">
                  <span>09:00 - John Doe (Dry nocturnal cough)</span>
                  <button
                    onClick={() => navigate('/doctor/consultation')}
                    className="px-2.5 py-1 bg-[#064e3b] text-white rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Start Consult
                  </button>
                </div>
                <div className="py-2 flex justify-between items-center">
                  <span>10:30 - Maria Santos (Routine BP check)</span>
                  <button
                    onClick={() => navigate('/doctor/consultation')}
                    className="px-2.5 py-1 bg-[#064e3b] text-white rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Start Consult
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeScreen === 'records' && (
            <div className="p-5 border-2 border-slate-300 rounded-2xl space-y-3 bg-slate-50/60">
              <div className="p-3 border border-slate-300 bg-white rounded-xl space-y-1">
                <div className="font-bold text-[#0a192f] text-sm">Patient: John Doe | ID: PAT-2026-001 | Blood: O+</div>
                <div className="text-rose-600 font-semibold">[Allergies: Penicillin, Shellfish]</div>
              </div>
              <div className="flex gap-2 border-b border-slate-300 pb-1">
                {['consultations', 'prescriptions', 'laboratory'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMockActiveTab(tab)}
                    className={`px-2 py-1 rounded text-[11px] cursor-pointer font-bold uppercase ${
                      mockActiveTab === tab
                        ? 'bg-[#0a192f] text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Tab: {tab}
                  </button>
                ))}
              </div>
              <div className="p-3 border border-slate-300 bg-white rounded-xl text-slate-600 text-xs leading-relaxed">
                {mockActiveTab === 'consultations' && 'Clinical Notes: Acute Upper Respiratory Infection. Monitored SpO2 at 98%. Follow up in 7 days.'}
                {mockActiveTab === 'prescriptions' && 'Rx: Amoxicillin 500mg (1 capsule 3x daily), Dextromethorphan syrup 10ml.'}
                {mockActiveTab === 'laboratory' && 'Diagnostic: Complete Blood Count (CBC) — WBC: 7.2, Hemoglobin: 14.2 g/dL (Normal).'}
              </div>
            </div>
          )}

          {activeScreen === 'billing' && (
            <div className="p-5 border-2 border-slate-300 rounded-2xl space-y-3 bg-slate-50/60">
              <div className="border border-slate-300 bg-white rounded-xl p-3 space-y-2">
                <div className="flex justify-between font-bold text-sm">
                  <span>INVOICE #INV-2026-0001</span>
                  <span className={mockBillPaid ? 'text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded' : 'text-amber-700 bg-amber-100 px-2 py-0.5 rounded'}>
                    STATUS: {mockBillPaid ? 'PAID' : 'PENDING'}
                  </span>
                </div>
                <div className="text-slate-500">1. General Physician Consultation — $50.00</div>
                <div className="text-slate-500">2. Complete Blood Count (CBC) — $45.00</div>
                <div className="text-slate-500">3. Outpatient Pharmacy Dispensing — $30.00</div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-bold">
                  <span>Total Amount: $125.00</span>
                  <button
                    type="button"
                    onClick={() => setMockBillPaid(!mockBillPaid)}
                    className="px-3 py-1.5 bg-[#064e3b] text-white rounded-lg text-xs cursor-pointer hover:bg-[#047857]"
                  >
                    {mockBillPaid ? 'Reset Payment' : 'Record Payment ($125.00)'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* HCI Rationale & Principles Audit */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Info className="w-5 h-5 text-[#064e3b]" />
            <h3 className="text-base font-bold text-[#0a192f]">HCI Principles Implemented</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-[#0a192f] mb-1">1. Visibility of System Status (Nielsen #1)</h4>
              <p className="text-slate-600 leading-relaxed">
                Real-time appointment slot states (Available, Selected, Booked line-through), instant toast confirmations,
                and badge statuses for lab diagnostics ensure users always know system state without ambiguity.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-[#0a192f] mb-1">2. Error Prevention (Nielsen #5)</h4>
              <p className="text-slate-600 leading-relaxed">
                Double-booking prevention is enforced at both UI slot level and in backend MySQL transactions.
                Clinical allergy alerts are visually prominent in high-contrast red before medications can be prescribed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-[#0a192f] mb-1">3. Minimal User Effort & Affordance</h4>
              <p className="text-slate-600 leading-relaxed">
                Search inputs include debounced autocomplete, time slots are one-click selectable cards, and consultation
                records automatically transition appointment statuses to 'completed'.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-[#0a192f] mb-1">4. Consistency & Accessibility</h4>
              <p className="text-slate-600 leading-relaxed">
                Standardized typography, color semantics (emerald=success, rose=critical/danger, deep navy=interactive),
                and clear focus states satisfy WCAG contrast compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowFidelityPrototype;
