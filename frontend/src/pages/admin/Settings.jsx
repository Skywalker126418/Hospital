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
  Globe,
  Upload,
  Image as ImageIcon,
  Loader2
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = React.useRef(null);

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

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastError('Please select a valid image file (PNG, JPG, SVG, WEBP).');
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await settingsService.uploadLogo(formData);
      if (res.success && res.data) {
        setSettings((prev) => ({ ...prev, logo_url: res.data.logo_url }));
        success('✓ Hospital logo updated successfully. Old logo removed from storage.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || err.message || 'Failed to upload hospital logo.');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
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

  const logoDisplayUrl = settings.logo_url
    ? settings.logo_url.startsWith('http')
      ? settings.logo_url
      : `http://localhost:5000${settings.logo_url.startsWith('/') ? '' : '/'}${settings.logo_url}`
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Hospital System Configuration"
        subtitle="Global clinical institution metadata, hospital branding logo, currency, and operational preferences."
      />

      {/* Hospital Logo & Brand Section */}
      <div className="bg-[#0a192f] text-white rounded-3xl border border-slate-700/60 p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-emerald-500/40 p-2 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
            {logoDisplayUrl ? (
              <img
                src={logoDisplayUrl}
                alt="Hospital Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.svg';
                }}
              />
            ) : (
              <Building className="w-10 h-10 text-emerald-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Official Institution Logo</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Upload the hospital's official emblem. When replaced, previous logo files are permanently deleted from local disk storage.
            </p>
          </div>
        </div>

        <div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="success"
            icon={uploadingLogo ? Loader2 : Upload}
            isLoading={uploadingLogo}
            onClick={() => logoInputRef.current?.click()}
            className="font-bold whitespace-nowrap"
          >
            {uploadingLogo ? 'Updating Logo...' : 'Upload New Logo'}
          </Button>
        </div>
      </div>

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
