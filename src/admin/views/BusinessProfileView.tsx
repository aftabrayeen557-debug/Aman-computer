import React, { useEffect, useState } from 'react';
import {
  Building2,
  Clock,
  MapPin,
  Phone,
  QrCode,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { CmsPageHeader, CmsSurfaceCard } from '../components/CmsPrimitives';

export const BusinessProfileView: React.FC = () => {
  const { businessProfile, updateBusinessProfile } = useAdmin();
  const [form, setForm] = useState(businessProfile);

  useEffect(() => {
    setForm(businessProfile);
  }, [businessProfile]);

  const handleChange = (field: keyof typeof businessProfile, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile(form);
  };

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Business & Center Profile"
        title="Business Profile & Timings"
        description="Manage your registered shop identity, Varanasi counter address, operating hours, WhatsApp hotline, and counter UPI details."
        actions={
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity & Registration */}
        <CmsSurfaceCard
          title="Identity & Registration"
          headerRight={
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Center</span>
            </span>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                Business Commercial Name
              </label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                Proprietor / Owner Name
              </label>
              <input
                type="text"
                value={form.proprietorName}
                onChange={(e) => handleChange('proprietorName', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                Trade / UDYAM Registration No.
              </label>
              <input
                type="text"
                value={form.tradeLicenseNo}
                onChange={(e) => handleChange('tradeLicenseNo', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] font-mono text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                Tagline &amp; Brand Positioning
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              />
            </div>
          </div>
        </CmsSurfaceCard>

        {/* Physical Address & Maps */}
        <CmsSurfaceCard
          title="Store Location & Directions"
          headerRight={<MapPin className="w-4 h-4 text-[#C9A96E]" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                Address Line (Shop &amp; Street)
              </label>
              <input
                type="text"
                value={form.addressLine}
                onChange={(e) => handleChange('addressLine', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                State
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                PIN Code
              </label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] font-mono text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                Google Maps Direct Link
              </label>
              <input
                type="text"
                value={form.googleMapsDirectLink}
                onChange={(e) => handleChange('googleMapsDirectLink', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] font-mono text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              />
            </div>
          </div>
        </CmsSurfaceCard>

        {/* Contact & Timings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CmsSurfaceCard
            title="Contact & Support Channels"
            headerRight={<Phone className="w-4 h-4 text-emerald-400" />}
          >
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                  Primary Mobile / Counter Phone
                </label>
                <input
                  type="text"
                  value={form.primaryPhone}
                  onChange={(e) => handleChange('primaryPhone', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] font-mono text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                  Official WhatsApp Number
                </label>
                <input
                  type="text"
                  value={form.whatsappNumber}
                  onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] font-mono text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] font-mono text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                  Telegram Alerts Channel (Optional)
                </label>
                <input
                  type="text"
                  value={form.telegramChannel || ''}
                  onChange={(e) => handleChange('telegramChannel', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] font-mono text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>
            </div>
          </CmsSurfaceCard>

          <CmsSurfaceCard
            title="Center Timings & UPI Settlement"
            headerRight={<Clock className="w-4 h-4 text-[#C9A96E]" />}
          >
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={form.openingHours}
                  onChange={(e) => handleChange('openingHours', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                  Working Days &amp; Sunday Schedule
                </label>
                <input
                  type="text"
                  value={form.workingDays}
                  onChange={(e) => handleChange('workingDays', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#85838A] mb-1.5">
                  Counter UPI ID
                </label>
                <input
                  type="text"
                  value={form.upiId}
                  onChange={(e) => handleChange('upiId', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] font-mono text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#101014] border border-white/[0.06] flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#C9A96E]" />
                  <span className="text-[#85838A]">Active Counter UPI</span>
                </div>
                <span className="font-mono font-semibold text-emerald-400">
                  {form.upiId || 'Not configured'}
                </span>
              </div>
            </div>
          </CmsSurfaceCard>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Save Business Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
