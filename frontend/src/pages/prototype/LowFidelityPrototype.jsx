import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';

const LowFidelityPrototype = () => {
  const [activeScreen, setActiveScreen] = useState('login');

  const prototypeScreens = [
    { id: 'login', name: '1. Login & Auth', icon: Layout },
    { id: 'registration', name: '2. Patient Registration', icon: UserPlus },
    { id: 'booking', name: '3. Appointment Booking', icon: CalendarPlus },
    { id: 'doctor', name: '4. Doctor Dashboard', icon: Stethoscope },
    { id: 'records', name: '5. Patient Records', icon: Eye },
    { id: 'billing', name: '6. Billing & Invoicing', icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="HCI Academic Artifact: Low-Fidelity Prototype"
        subtitle="Architectural wireframes, cognitive affordances, information architecture, and heuristic user flows."
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
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
        {/* Wireframe Diagram Canvas */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-dashed border-slate-300 p-6 sm:p-8 space-y-4 font-mono text-xs text-slate-600">
          <div className="flex justify-between items-center pb-3 border-b-2 border-slate-200">
            <span className="font-bold text-slate-800 uppercase tracking-widest text-[11px]">
              [WIREFRAME-CANVAS] — SCREEN: {activeScreen.toUpperCase()}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-300">
              Low-Fi Wireframe
            </span>
          </div>

          {activeScreen === 'login' && (
            <div className="p-4 border-2 border-slate-300 rounded-xl space-y-3 bg-slate-50/50">
              <div className="h-6 w-32 bg-slate-200 rounded"></div>
              <div className="h-4 w-48 bg-slate-100 rounded"></div>
              <div className="space-y-2 pt-2">
                <div className="h-8 border-2 border-slate-300 rounded bg-white flex items-center px-3 text-slate-400">
                  [Input: Email Address]
                </div>
                <div className="h-8 border-2 border-slate-300 rounded bg-white flex items-center px-3 text-slate-400">
                  [Input: Password *******]
                </div>
                <div className="h-9 bg-slate-800 text-white rounded flex items-center justify-center font-bold">
                  [BUTTON: Sign In to Workstation]
                </div>
                <div className="h-8 border border-slate-300 rounded bg-white flex items-center justify-center text-slate-500">
                  [BUTTON: Continue with Google SSO]
                </div>
              </div>
            </div>
          )}

          {activeScreen === 'registration' && (
            <div className="p-4 border-2 border-slate-300 rounded-xl space-y-3 bg-slate-50/50">
              <div className="h-6 w-44 bg-slate-200 rounded"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-7 border border-slate-300 bg-white rounded px-2 flex items-center">[First Name]</div>
                <div className="h-7 border border-slate-300 bg-white rounded px-2 flex items-center">[Last Name]</div>
                <div className="h-7 border border-slate-300 bg-white rounded px-2 flex items-center">[DOB: YYYY-MM-DD]</div>
                <div className="h-7 border border-slate-300 bg-white rounded px-2 flex items-center">[Select: Gender]</div>
                <div className="h-7 border border-slate-300 bg-white rounded px-2 flex items-center">[Phone Number]</div>
                <div className="h-7 border border-slate-300 bg-white rounded px-2 flex items-center">[Select: Blood Group]</div>
                <div className="col-span-2 h-7 border border-slate-300 bg-white rounded px-2 flex items-center">[Address Field]</div>
                <div className="col-span-2 h-7 border border-slate-300 bg-rose-50/50 border-rose-300 rounded px-2 flex items-center text-rose-700">[Known Allergies]</div>
              </div>
              <div className="flex justify-end pt-2">
                <div className="h-8 px-4 bg-slate-800 text-white rounded flex items-center font-bold">
                  [BUTTON: Save Patient & Generate ID]
                </div>
              </div>
            </div>
          )}

          {activeScreen === 'booking' && (
            <div className="p-4 border-2 border-slate-300 rounded-xl space-y-3 bg-slate-50/50">
              <div className="h-6 w-48 bg-slate-200 rounded"></div>
              <div className="h-7 border border-slate-300 bg-white rounded px-2 flex items-center">[Search Patient: Type Name or ID]</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 border border-slate-300 bg-white rounded">[Dr. Claude - Gen Med]</div>
                <div className="p-2 border-2 border-slate-800 bg-slate-100 rounded font-bold">[Dr. Smith - Cardio ✓]</div>
                <div className="p-2 border border-slate-300 bg-white rounded">[Dr. Patel - Ped]</div>
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-2">
                <div className="p-1.5 border border-slate-300 text-center rounded">[09:00]</div>
                <div className="p-1.5 bg-slate-800 text-white text-center rounded font-bold">[10:00 Selected]</div>
                <div className="p-1.5 bg-slate-200 text-slate-400 line-through text-center rounded">[11:00 Booked]</div>
                <div className="p-1.5 border border-slate-300 text-center rounded">[14:00]</div>
              </div>
              <div className="h-14 border border-slate-300 bg-white rounded p-2 text-slate-400">[Reason for Visit]</div>
              <div className="flex justify-end pt-2">
                <div className="h-8 px-4 bg-slate-800 text-white rounded flex items-center font-bold">
                  [BUTTON: Review & Confirm Booking Modal]
                </div>
              </div>
            </div>
          )}

          {activeScreen === 'doctor' && (
            <div className="p-4 border-2 border-slate-300 rounded-xl space-y-3 bg-slate-50/50">
              <div className="flex justify-between items-center">
                <div className="h-6 w-40 bg-slate-200 rounded"></div>
                <div className="text-[10px] bg-slate-200 px-2 py-0.5 rounded">4 In Queue</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 border border-slate-300 rounded bg-white">[Today: 6 Appts]</div>
                <div className="p-2 border border-slate-300 rounded bg-white">[Waiting: 2]</div>
                <div className="p-2 border border-slate-300 rounded bg-white">[Labs Pending: 1]</div>
              </div>
              <div className="border border-slate-300 rounded bg-white p-2 divide-y divide-slate-100">
                <div className="py-1.5 flex justify-between">
                  <span>09:00 - John Doe (Dry cough)</span>
                  <span className="font-bold">[Button: Start Consult]</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span>10:30 - Maria Santos (Hypertension)</span>
                  <span className="font-bold">[Button: Start Consult]</span>
                </div>
              </div>
              <div className="h-28 border-2 border-slate-300 rounded bg-slate-900 text-slate-300 p-3 flex items-center justify-center">
                [3D WebGL Anatomical Model Reference Viewer]
              </div>
            </div>
          )}

          {activeScreen === 'records' && (
            <div className="p-4 border-2 border-slate-300 rounded-xl space-y-3 bg-slate-50/50">
              <div className="h-6 w-44 bg-slate-200 rounded"></div>
              <div className="p-3 border border-slate-300 bg-white rounded space-y-1">
                <div className="font-bold">[Patient: John Doe | ID: PAT-2026-001 | Age: 41 | Blood: O+]</div>
                <div className="text-rose-600">[Allergies: Penicillin, Shellfish]</div>
              </div>
              <div className="flex gap-2 border-b border-slate-300 pb-1">
                <span className="font-bold">[Tab: Consultations]</span>
                <span>[Tab: Prescriptions]</span>
                <span>[Tab: Lab Results]</span>
              </div>
              <div className="p-3 border border-slate-300 bg-white rounded text-slate-500">
                [Clinical Timeline: Diagnosis, Treatment, Physician Notes, Prescribed Meds]
              </div>
            </div>
          )}

          {activeScreen === 'billing' && (
            <div className="p-4 border-2 border-slate-300 rounded-xl space-y-3 bg-slate-50/50">
              <div className="h-6 w-40 bg-slate-200 rounded"></div>
              <div className="border border-slate-300 bg-white rounded p-3 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>[INVOICE #INV-2026-0001]</span>
                  <span>[STATUS: PAID / PENDING]</span>
                </div>
                <div className="text-slate-500">Item 1: General Physician Consult — $50.00</div>
                <div className="text-slate-500">Item 2: Complete Blood Count — $45.00</div>
                <div className="text-slate-500">Item 3: Pharmacy Dispensing — $30.00</div>
                <div className="border-t border-slate-200 pt-1 flex justify-between font-bold">
                  <span>Total: $125.00</span>
                  <span>[BUTTON: Record Payment]</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* HCI Rationale & Principles Audit */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Info className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">HCI Principles Implemented</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">1. Visibility of System Status (Nielsen #1)</h4>
              <p className="text-slate-600">
                Real-time appointment slot states (Available, Selected, Booked line-through), instant toast confirmations,
                and badge statuses for lab diagnostics ensure users always know system state without ambiguity.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">2. Error Prevention (Nielsen #5)</h4>
              <p className="text-slate-600">
                Double-booking prevention is enforced at both the UI slot level and in backend MySQL transactions.
                Clinical allergy alerts are visually prominent in high-contrast red before medications can be prescribed.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">3. Minimal User Effort & Affordance</h4>
              <p className="text-slate-600">
                Search inputs include debounced autocomplete, time slots are one-click selectable cards, and consultation
                records automatically transition appointment statuses to 'completed'.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">4. Consistency & Accessibility</h4>
              <p className="text-slate-600">
                Standardized typography, color semantics (emerald=success, rose=critical/danger, brand blue=interactive),
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
