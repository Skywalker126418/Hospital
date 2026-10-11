import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  ClipboardList,
  Sparkles,
  Award,
  Layers,
  FileCheck,
  Users
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';

const UsabilityEvaluation = () => {
  const [filterRole, setFilterRole] = useState('all');

  const evaluationCases = [
    {
      id: 1,
      user: 'Receptionist (Front Desk Staff)',
      role: 'receptionist',
      task: 'Rapid Patient Registration During High-Arrival Queues',
      problem: 'In early prototypes, the form lacked inline error cues beside individual fields, forcing the receptionist to scroll to the top of a long form to find which field triggered a validation rejection.',
      principle: 'Visibility of System Status & Error Prevention (Nielsen #1, #5)',
      improvement: 'Implemented immediate inline red validation warnings with icon indicators right under the offending input, paired with instant auto-focus on the first invalid field.',
      status: 'Resolved in Final Architecture',
    },
    {
      id: 2,
      user: 'Receptionist (Front Desk Staff)',
      role: 'receptionist',
      task: 'Booking Appointment Without Overlapping Doctor Schedules',
      problem: 'Users previously had to manually verify a paper calendar or cross-reference multiple screens to determine if a doctor was already occupied at a selected hour, leading to accidental double bookings.',
      principle: 'Minimal User Effort & Error Prevention (Nielsen #5, #6)',
      improvement: 'Integrated real-time database slot availability calculation with color-coded interactive grid (Available=White, Selected=Green, Unavailable=Strikethrough Gray), combined with MySQL transactional locking that prevents concurrent slot assignment.',
      status: 'Resolved in Final Architecture',
    },
    {
      id: 3,
      user: 'Doctor / Physician (Clinical Workstation)',
      role: 'doctor',
      task: 'Prescribing Multi-Drug Regimens for Complex Chronic Conditions',
      problem: 'Older clinical interfaces required doctors to navigate back and forth between separate screens to prescribe multiple medications, causing cognitive overload and time waste.',
      principle: 'Simplicity & Efficiency of Use (Nielsen #7)',
      improvement: 'Architected reusable multi-row MedicineRow component allowing dynamic addition, removal, and inline datalist autocomplete of dosages and frequencies within a single contiguous workflow.',
      status: 'Resolved in Final Architecture',
    },
    {
      id: 4,
      user: 'Doctor / Physician (Clinical Workstation)',
      role: 'doctor',
      task: 'Reviewing Patient Allergy Alerts Prior to Prescribing',
      problem: 'Critical drug allergies were buried inside general medical history paragraphs, posing a safety risk if a physician hurried through an examination.',
      principle: 'Recognition Rather Than Recall & Clear Feedback (Nielsen #6)',
      improvement: 'Promoted documented allergies and contraindications into high-contrast red warning banners positioned at the very top of both the patient electronic medical record and the consultation room.',
      status: 'Resolved in Final Architecture',
    },
    {
      id: 5,
      user: 'Administrator (Executive Staff)',
      role: 'admin',
      task: 'Centralized Staff Provisioning & Portal Security',
      problem: 'Allowing unauthenticated users to create accounts without oversight compromised hospital clinical data integrity.',
      principle: 'Error Prevention & Administrative Oversight (Nielsen #5)',
      improvement: 'Enforced Admin-only clearance gate protected by dual authentication (Security PIN 12345678 or Master Password admin12). Administrator directly creates staff accounts and distributes passwords.',
      status: 'Resolved in Final Architecture',
    },
    {
      id: 6,
      user: 'Cross-Role HCI Inspection',
      role: 'all',
      task: 'Spatial Department Navigation and 3D Anatomical Reference',
      problem: 'Static 2D anatomical drawings lacked depth perception and interactivity, while conventional 3D WebGL implementations crashed completely on low-end hospital terminals lacking GPU drivers.',
      principle: 'Flexibility, Efficiency & Graceful Degradation',
      improvement: 'Created Model3DErrorBoundary and ModelLoader fallback systems in Three.js/React Three Fiber. If WebGL shaders or external 3D models fail, a clean fallback inspection card renders without ever crashing the parent host application.',
      status: 'Resolved in Final Architecture',
    },
  ];

  const filtered = filterRole === 'all'
    ? evaluationCases
    : evaluationCases.filter((c) => c.role === filterRole || c.role === 'all');

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="HCI Academic Artifact: Usability Evaluation Audit"
        subtitle="Formal usability inspection across Receptionist, Doctor, and Administrator workflows adhering to Jakob Nielsen's Heuristics."
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Evaluated Personas</p>
            <h3 className="text-xl font-bold text-[#0a192f] mt-1">3 Primary Roles</h3>
            <p className="text-xs text-[#064e3b] font-semibold mt-0.5">Receptionist • Doctor • Admin</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#ecfdf5] text-[#064e3b] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Documented Issues</p>
            <h3 className="text-xl font-bold text-[#0a192f] mt-1">6 Audited Flaws</h3>
            <p className="text-xs text-emerald-600 mt-0.5 font-bold">100% Resolved & Engineered</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Heuristic Standards</p>
            <h3 className="text-xl font-bold text-[#0a192f] mt-1">Nielsen 10 Rules</h3>
            <p className="text-xs text-[#0a192f] mt-0.5 font-semibold">HCI & Cognitive Ergonomics</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0a192f] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Role Filter Buttons */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs w-fit">
        <button
          onClick={() => setFilterRole('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterRole === 'all'
              ? 'bg-[#0a192f] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Personas
        </button>
        <button
          onClick={() => setFilterRole('receptionist')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filterRole === 'receptionist'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Receptionist
        </button>
        <button
          onClick={() => setFilterRole('doctor')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filterRole === 'doctor'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" /> Doctor
        </button>
        <button
          onClick={() => setFilterRole('admin')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filterRole === 'admin'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Administrator
        </button>
      </div>

      {/* Usability Issues Cards */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#0a192f] text-white text-xs font-bold flex items-center justify-center">
                  #{item.id}
                </span>
                <span className="font-bold text-[#0a192f] text-sm">{item.task}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                  User: {item.user}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">
                  {item.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Problem Observed */}
              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-1">
                <span className="font-bold uppercase tracking-wider text-rose-800 text-[10px] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Usability Problem Observed
                </span>
                <p className="text-rose-950 font-medium leading-relaxed">{item.problem}</p>
              </div>

              {/* Principle Violated */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                <span className="font-bold uppercase tracking-wider text-amber-800 text-[10px] flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-amber-600" /> HCI Principle Violated
                </span>
                <p className="text-amber-950 font-medium leading-relaxed">{item.principle}</p>
              </div>

              {/* Architectural Improvement */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-1">
                <span className="font-bold uppercase tracking-wider text-emerald-800 text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Suggested & Implemented Fix
                </span>
                <p className="text-emerald-950 font-medium leading-relaxed">{item.improvement}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsabilityEvaluation;
