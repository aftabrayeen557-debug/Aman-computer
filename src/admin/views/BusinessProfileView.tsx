import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  Building2,
  Save,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  QrCode,
  ShieldCheck,
  ExternalLink,
  Mail,
  Send,
} from 'lucide-react';

export const BusinessProfileView: React.FC = () => {
  const { businessProfile, updateBusinessProfile, showToast } = useAdmin();

  const [form, setForm] = useState(businessProfile);

  const handleChange = (field: keyof typeof businessProfile, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile(form);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Business Profile & Center KYC</span>
          </h1>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8] mt-0.5">
            Manage legal store entity, Varanasi physical address, operational timings, contact hotline, and UPI billing IDs.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Business Identity & Registration */}
        <div className="p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Identity & Statutory Registration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                Business Commercial Name
              </label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                Proprietor / Owner Name
              </label>
              <input
                type="text"
                value={form.proprietorName}
                onChange={(e) => handleChange('proprietorName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                Trade / MSME UDYAM Reg No.
              </label>
              <input
                type="text"
                value={form.tradeLicenseNo}
                onChange={(e) => handleChange('tradeLicenseNo', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                Tagline & Brand Positioning
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Physical Address & Maps */}
        <div className="p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Store Location & Google Maps</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                Address Line (Shop & Street)
              </label>
              <input
                type="text"
                value={form.addressLine}
                onChange={(e) => handleChange('addressLine', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                State
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                PIN Code
              </label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                Google Maps Direct Link
              </label>
              <input
                type="text"
                value={form.googleMapsDirectLink}
                onChange={(e) => handleChange('googleMapsDirectLink', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Contact Channels & Operating Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Contact Hotlines */}
          <div className="p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Contact & Support Channels</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Primary Mobile / Counter Phone
                </label>
                <input
                  type="text"
                  value={form.primaryPhone}
                  onChange={(e) => handleChange('primaryPhone', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Official WhatsApp Number (Hotline)
                </label>
                <input
                  type="text"
                  value={form.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Telegram Job Alerts Channel
                </label>
                <input
                  type="text"
                  value={form.telegramChannel || ''}
                  onChange={(e) => handleChange('telegramChannel', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours & UPI Counter */}
          <div className="p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Center Timings & UPI Settlement</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={form.openingHours}
                  onChange={(e) => handleChange('openingHours', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Working Days & Sunday Schedule
                </label>
                <input
                  type="text"
                  value={form.workingDays}
                  onChange={(e) => handleChange('workingDays', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Counter UPI ID (Printed on Slips)
                </label>
                <input
                  type="text"
                  value={form.upiId}
                  onChange={(e) => handleChange('upiId', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-gray-500" />
                  <span className="text-[#857878] dark:text-[#B5A8A8]">
                    UPI QR printed automatically on all client slips
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {form.upiId}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Sync Live</span>
          </button>
        </div>
      </form>
    </div>
  );
};
