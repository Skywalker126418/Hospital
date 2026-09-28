import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  Mail,
  Phone,
  DollarSign,
  Clock,
  Save,
  CheckCircle2,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/Loading';

const Settings = () => {
  const [settings, setSettings] = useState({
    hospital_name: '',
    address: '',
    phone: '',
    email: '',
    currency: 'USD',
    appointment_duration: 30,
    logo_url: '/logo.svg',
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await settingsService.getSettings();
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        toastError('Failed to load system settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsService.updateSettings(settings);
      success('✓ Hospital settings and system preferences saved successfully.');
    } catch (err) {
      toastError(err.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading hospital configuration..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Hospital System Configuration"
        subtitle="Global clinical institution metadata, default currency, appointment durations, and security preferences."
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10 space-y-8">
        {/* Institutional Identification */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-100">
            <Building className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Institution Identity & Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Input
                label="Official Hospital Legal Name"
                name="hospital_name"
                value={settings.hospital_name}
                onChange={handleChange}
                placeholder="e.g. Metropolitan Central Hospital"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Facility Physical Address"
                name="address"
                value={settings.address}
                onChange={handleChange}
                placeholder="e.g. 452 Healthcare Boulevard, Medical District, NY 10001"
                required
              />
            </div>

            <Input
              label="Primary Contact Phone"
              name="phone"
              value={settings.phone}
              onChange={handleChange}
              placeholder="e.g. +1 (800) 555-0199"
              icon={Phone}
              required
            />

            <Input
              label="Official Contact Email"
              name="email"
              type="email"
              value={settings.email}
              onChange={handleChange}
              placeholder="e.g. contact@metropolitan-hospital.org"
              icon={Mail}
              required
            />
          </div>
        </div>

        {/* Clinical Operations Preferences */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-100">
            <Clock className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900">Clinical Scheduling & Financial Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Standard Appointment Duration (Minutes)
              </label>
              <select
                name="appointment_duration"
                value={settings.appointment_duration}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 bg-white text-sm focus:border-brand-500"
              >
                <option value="15">15 Minutes (Express triage / vitals)</option>
                <option value="20">20 Minutes (Brief follow-up)</option>
                <option value="30">30 Minutes (Standard clinical visit)</option>
                <option value="45">45 Minutes (Extended specialist exam)</option>
                <option value="60">60 Minutes (Comprehensive consultation)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Primary Billing Currency
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 bg-white text-sm focus:border-brand-500"
              >
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="RWF">RWF (FRw) — Rwandan Franc</option>
                <option value="CAD">CAD ($) — Canadian Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Access Policy Notice */}
        <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200 text-xs text-brand-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Administrative Access Control Policy</h4>
            <p className="mt-0.5 opacity-90">
              Only authenticated System Administrators with verified JWT credentials can alter hospital institutional settings.
              Modifications are immediately propagated across invoices and booking slot generators.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            icon={Save}
          >
            Save Hospital Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
