import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  FileText,
  Stethoscope,
  FlaskConical,
  HeartPulse,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { patientService } from '../../services/patientService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const PatientRecords = () => {
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(searchParams.get('id') || null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const { error } = useToast();

  // Load patients list for directory sidebar
  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoadingList(true);
        const res = await patientService.getPatients({ limit: 20 });
        if (res.success) {
          setPatients(res.data);
          if (!selectedPatientId && res.data.length > 0) {
            setSelectedPatientId(res.data[0].id);
          }
        }
      } catch (err) {
        error('Failed to load patient records.');
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, []);

  // Load full profile whenever selected patient changes
  useEffect(() => {
    if (!selectedPatientId) return;

    const fetchFullProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await patientService.getPatientById(selectedPatientId);
        if (res.success) {
          setPatientProfile(res.data);
        }
      } catch (err) {
        error('Failed to load patient clinical file.');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchFullProfile();
  }, [selectedPatientId]);

  const filteredPatients = patients.filter((p) =>
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Electronic Medical Records (EMR)"
        subtitle="Clinical diagnostic charts, patient historical findings, active prescriptions, and lab tests."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Patient Selector List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search EMR files..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500"
            />
          </div>

          <div className="max-h-[640px] overflow-y-auto space-y-1.5 divide-y divide-slate-100">
            {loadingList ? (
              <LoadingSpinner size="sm" text="Loading records..." />
            ) : filteredPatients.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No matching patients.</p>
            ) : (
              filteredPatients.map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => setSelectedPatientId(pat.id)}
                  className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between text-xs ${
                    selectedPatientId === pat.id
                      ? 'bg-brand-50/80 border border-brand-300 text-brand-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-slate-900 font-bold">{pat.full_name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{pat.patient_code}</p>
                  </div>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {pat.gender} • {pat.age}y
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Detailed Clinical Record (Rule 27) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          {loadingProfile || !patientProfile ? (
            <LoadingSpinner size="md" text="Loading clinical history..." />
          ) : (
            <>
              {/* Header Profile Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                    {patientProfile.first_name.charAt(0)}{patientProfile.last_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{patientProfile.full_name}</h2>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                        {patientProfile.patient_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {patientProfile.gender} • {patientProfile.age} Years Old (DOB: {patientProfile.date_of_birth?.slice(0, 10)})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/doctor/consultation?patientId=${patientProfile.id}`}>
                    <Button variant="primary" size="sm" icon={Stethoscope}>
                      Start New Consultation
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Critical Allergies & Blood Group Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-900 uppercase tracking-wide text-[10px]">
                      Known Allergies & Contraindications:
                    </span>
                    <p className="text-rose-800 font-medium mt-0.5">
                      {patientProfile.allergies || 'None documented on chart'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <HeartPulse className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">
                      Blood Chemistry Type:
                    </span>
                    <p className="text-slate-900 font-semibold mt-0.5">
                      {patientProfile.blood_group || 'Unspecified'} • Contact: {patientProfile.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Clinical Section 1: Previous Consultations & Medical History */}
              <div>
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                  <Stethoscope className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Diagnostic & Consultation History
                  </h3>
                </div>

                {patientProfile.consultations?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                    No prior consultations recorded for this patient file.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {patientProfile.consultations.map((c) => (
                      <div key={c.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                          <span className="font-bold text-slate-800">{c.consultation_date?.slice(0, 10)}</span>
                          <span className="text-brand-600 font-medium">Attending: {c.doctor_name}</span>
                        </div>
                        <div>
                          <strong className="text-slate-700">Diagnosis:</strong>
                          <p className="text-slate-900 font-semibold mt-0.5">{c.diagnosis}</p>
                        </div>
                        <div>
                          <strong className="text-slate-700">Symptoms Presented:</strong>
                          <p className="text-slate-600 mt-0.5">{c.symptoms}</p>
                        </div>
                        <div>
                          <strong className="text-slate-700">Treatment Plan:</strong>
                          <p className="text-slate-600 mt-0.5">{c.treatment}</p>
                        </div>
                        {c.notes && (
                          <div>
                            <strong className="text-slate-700">Physician Notes:</strong>
                            <p className="text-slate-500 mt-0.5">{c.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clinical Section 2: Active & Previous Prescriptions */}
              <div>
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Prescriptions & Pharmacotherapy
                  </h3>
                </div>

                {patientProfile.prescriptions?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                    No pharmacological prescriptions on record.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {patientProfile.prescriptions.map((rx) => (
                      <div key={rx.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                        <div className="flex justify-between pb-1.5 border-b border-slate-200 text-slate-600">
                          <span>Prescription Date: {rx.prescription_date?.slice(0, 10)}</span>
                          <span>Doctor: {rx.doctor_name}</span>
                        </div>
                        <div className="space-y-1">
                          {rx.items?.map((item) => (
                            <div key={item.id} className="p-2 rounded bg-white border border-slate-200 flex justify-between">
                              <div>
                                <span className="font-bold text-slate-800">{item.medicine_name}</span>
                                <span className="text-slate-500 ml-2">({item.dosage})</span>
                                <p className="text-[11px] text-slate-500">{item.instructions}</p>
                              </div>
                              <div className="text-right text-slate-700">
                                <div>{item.frequency}</div>
                                <div className="text-slate-400 text-[10px]">{item.duration}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clinical Section 3: Diagnostic Laboratory Reports */}
              <div>
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100">
                  <FlaskConical className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Laboratory Diagnostics
                  </h3>
                </div>

                {patientProfile.laboratory_tests?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                    No laboratory assays ordered.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {patientProfile.laboratory_tests.map((lab) => (
                      <div key={lab.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800 text-sm">{lab.test_name}</span>
                          <span className={`badge-${lab.status}`}>{lab.status}</span>
                        </div>
                        <p className="text-slate-500">{lab.description}</p>
                        {lab.result ? (
                          <div className="p-3 bg-white border border-slate-200 rounded-lg">
                            <span className="font-bold text-slate-700 block mb-1">Result Summary:</span>
                            <p className="font-mono text-slate-800 text-[11px]">{lab.result}</p>
                          </div>
                        ) : (
                          <p className="text-amber-700 italic">Results pending laboratory processing.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;
