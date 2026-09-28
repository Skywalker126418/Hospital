import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UserPlus, ArrowLeft, RotateCcw, Eye, ShieldCheck, HeartPulse } from 'lucide-react';
import { patientService } from '../../services/patientService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const PatientRegistration = () => {
  const initialForm = {
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'Male',
    national_id: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_group: 'O+',
    allergies: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState(null);

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required.';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required.';

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required.';
    } else {
      const dob = new Date(formData.date_of_birth);
      const now = new Date();
      if (dob > now) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future.';
      }
    }

    if (!formData.gender) newErrors.gender = 'Please select a gender.';

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required for patient contact.';
    } else if (!/^[\d\s+\-().]{7,25}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (e.g. +1 555-0199).';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email format or leave blank.';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Residential address is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toastError('Please review and correct the highlighted fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await patientService.createPatient(formData);
      success('✓ Patient Registered Successfully');
      setRegisteredPatient(res.data);
    } catch (err) {
      toastError(err.message || 'Unable to save patient. Please try again.');
      if (err.errors) {
        const backendErrors = {};
        err.errors.forEach((e) => {
          backendErrors[e.field] = e.message;
        });
        setErrors(backendErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterAnother = () => {
    setFormData(initialForm);
    setRegisteredPatient(null);
    setErrors({});
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Patient Registration"
        subtitle="Register new hospital patient, assign biometric patient identifier, and establish clinical record."
        actions={
          <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/receptionist/patients')}>
            Back to Directory
          </Button>
        }
      />

      {/* Success Confirmation Card (Rule 19) */}
      {registeredPatient ? (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 sm:p-10 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">✓ Patient Registered Successfully</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Permanent clinical records have been established and saved securely to MySQL database.
          </p>

          <div className="max-w-md mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left space-y-3 mb-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Assigned Patient ID:</span>
              <span className="text-sm font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                {registeredPatient.patient_code}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Patient Full Name:</span>
              <span className="text-sm font-semibold text-slate-800">{registeredPatient.full_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Registration Date:</span>
              <span className="text-sm text-slate-700">{registeredPatient.registration_date}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              icon={Eye}
              onClick={() => navigate(`/receptionist/patients?code=${registeredPatient.patient_code}`)}
            >
              View Patient Profile
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={RotateCcw}
              onClick={handleRegisterAnother}
            >
              Register Another Patient
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10 space-y-8">
          {/* Section 1: Personal Demographics */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold text-slate-900">Demographic Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Input
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="e.g. John"
                error={errors.first_name}
                required
              />

              <Input
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="e.g. Doe"
                error={errors.last_name}
                required
              />

              <Input
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                error={errors.date_of_birth}
                required
              />

              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
                error={errors.gender}
                required
              />

              <Input
                label="National ID / SSN (Optional)"
                name="national_id"
                value={formData.national_id}
                onChange={handleChange}
                placeholder="e.g. NID-884123"
                error={errors.national_id}
              />

              <Select
                label="Blood Group"
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                options={[
                  { value: 'A+', label: 'A+ (Positive)' },
                  { value: 'A-', label: 'A- (Negative)' },
                  { value: 'B+', label: 'B+ (Positive)' },
                  { value: 'B-', label: 'B- (Negative)' },
                  { value: 'AB+', label: 'AB+ (Positive)' },
                  { value: 'AB-', label: 'AB- (Negative)' },
                  { value: 'O+', label: 'O+ (Positive)' },
                  { value: 'O-', label: 'O- (Negative)' },
                ]}
              />
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-100">
              <UserPlus className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold text-slate-900">Contact & Residence</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Primary Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +1 (555) 712-4011"
                error={errors.phone}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. patient@example.com"
                error={errors.email}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Residential Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address, Apartment/Suite, City, State"
                  error={errors.address}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact & Medical Alerts */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-100">
              <HeartPulse className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-slate-900">Emergency & Clinical Safety Flags</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Emergency Contact Name & Relation"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                placeholder="e.g. Jane Doe (Spouse)"
              />

              <Input
                label="Emergency Contact Phone"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                placeholder="e.g. +1 (555) 712-4012"
              />

              <div className="sm:col-span-2">
                <Input
                  label="Known Drug or Food Allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="e.g. Penicillin, Sulfa drugs, Peanuts (or 'None known')"
                  helperText="Crucial for clinical error prevention before medications are prescribed."
                />
              </div>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/receptionist/patients')}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={isLoading}
              icon={UserPlus}
            >
              Complete Patient Registration
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PatientRegistration;
