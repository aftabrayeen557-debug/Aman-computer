import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { DoorsConfig, ServiceCategory } from '../types';
import {
  Plus,
  Search,
  Sparkles,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Clock,
  Layers,
  MessageSquare,
  FileCheck,
  CreditCard,
  ShieldCheck,
  UserCheck,
  Car,
  Globe,
  Award,
  Printer,
  Copy,
  ScanLine,
  Camera,
  Banknote,
  Zap,
  HeartHandshake,
  Train,
  FileText,
  Save,
  DoorOpen,
} from 'lucide-react';
import { CmsPageHeader, CmsSurfaceCard } from '../components/CmsPrimitives';
import { ServiceModal } from '../components/ServiceModal';
import { INITIAL_WEBSITE_CONTENT } from '../data/initialData';

const CATEGORIES: Array<'all' | ServiceCategory> = [
  'all',
  'Government Forms',
  'Identity & Cards',
  'Printing & Documents',
  'Financial & Banking',
  'Travel & Ticketing',
  'Computer & Design',
];

const ICON_MAP: Record<string, React.ElementType> = {
  FileCheck,
  CreditCard,
  ShieldCheck,
  UserCheck,
  Car,
  Globe,
  Award,
  Printer,
  Copy,
  ScanLine,
  Camera,
  Banknote,
  Zap,
  HeartHandshake,
  Train,
  FileText,
  Layers,
};

export const ServicesView: React.FC = () => {
  const {
    services,
    setServiceModalOpen,
    setEditingService,
    deleteService,
    toggleServiceVisibility,
    toggleServiceFeatured,
    websiteContent,
    updateWebsiteContent,
    businessProfile,
  } = useAdmin();

  const [selectedCategory, setSelectedCategory] =
    useState<'all' | ServiceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDoorsMeta, setShowDoorsMeta] = useState(false);

  const defaultDoors = INITIAL_WEBSITE_CONTENT.doorsConfig!;
  const [doorsDraft, setDoorsDraft] = useState<DoorsConfig>(
    websiteContent.doorsConfig || defaultDoors
  );

  useEffect(() => {
    if (websiteContent.doorsConfig) {
      setDoorsDraft(websiteContent.doorsConfig);
    }
  }, [websiteContent.doorsConfig]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (selectedCategory !== 'all' && s.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [services, selectedCategory, searchQuery]);

  const cleanWaPhone = (
    businessProfile.whatsappNumber ||
    businessProfile.primaryPhone ||
    '918595515718'
  ).replace(/[^0-9]/g, '');

  const handleSaveDoorsMeta = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteContent('doorsConfig', doorsDraft);
  };

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Doors Management · Door 3 Service Catalog"
        title="Our Services & Four Doors Labels"
        description="Manage counter services, pricing tiers, document prerequisites, and interactive homepage door headings."
        actions={
          <>
            <button
              type="button"
              onClick={() => setShowDoorsMeta((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#101014] border border-white/[0.08] text-xs font-medium text-[#E8E5DF] hover:border-[#C9A96E]/45 transition-colors cursor-pointer"
            >
              <DoorOpen className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>{showDoorsMeta ? 'Hide Door Titles' : 'Edit Door Titles'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingService(null);
                setServiceModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </>
        }
      />

      {showDoorsMeta && (
        <CmsSurfaceCard
          title="Four Interactive Doors Headings"
          subtitle="Update section titles and subtitles shown around the four homepage portal doors."
        >
          <form onSubmit={handleSaveDoorsMeta} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-[#E8E5DF] mb-1.5">
                Main Doors Section Heading
              </label>
              <input
                type="text"
                value={doorsDraft.sectionHeading}
                onChange={(e) =>
                  setDoorsDraft((prev) => ({
                    ...prev,
                    sectionHeading: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['door0', 'door1', 'door2', 'door3'] as const).map((key, idx) => {
                const door = doorsDraft[key];
                return (
                  <div
                    key={key}
                    className="p-4 rounded-xl bg-[#101014] border border-white/[0.07] space-y-2.5"
                  >
                    <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#C9A96E]">
                      Door {idx + 1}
                    </div>
                    <input
                      type="text"
                      value={door.title}
                      onChange={(e) =>
                        setDoorsDraft((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], title: e.target.value },
                        }))
                      }
                      placeholder="Door title"
                      className="w-full px-3 py-2 rounded-lg bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
                    />
                    <input
                      type="text"
                      value={door.subtitle}
                      onChange={(e) =>
                        setDoorsDraft((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], subtitle: e.target.value },
                        }))
                      }
                      placeholder="Door subtitle"
                      className="w-full px-3 py-2 rounded-lg bg-[#0A0A0E] border border-white/[0.08] text-[#85838A] outline-none"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] font-semibold cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Door Headings</span>
              </button>
            </div>
          </form>
        </CmsSurfaceCard>
      )}

      <CmsSurfaceCard>
        <div className="flex items-center gap-1.5 pb-4 mb-4 border-b border-white/[0.06] overflow-x-auto">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            const count =
              cat === 'all'
                ? services.length
                : services.filter((s) => s.category === cat).length;

            return (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#211B16] text-[#DFC492] border border-[#C9A96E]/35'
                    : 'bg-[#101014] text-[#85838A] border border-white/[0.06] hover:text-[#E8E5DF]'
                }`}
              >
                <span>{cat === 'all' ? 'All Services' : cat}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative mb-5">
          <Search className="w-4 h-4 text-[#85838A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services by title, category, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const Icon = ICON_MAP[service.iconName] || Layers;
            const whatsappUrl = `https://wa.me/${cleanWaPhone}?text=${encodeURIComponent(
              service.whatsappMessageTemplate ||
                `Namaste Aman Computer, I need info about ${service.title}`
            )}`;

            return (
              <div
                key={service.id}
                className={`rounded-2xl bg-[#101014] border border-white/[0.08] overflow-hidden flex flex-col justify-between transition-all hover:border-[#C9A96E]/35 ${
                  !service.visible ? 'opacity-60' : ''
                }`}
              >
                <div>
                  <div className="relative h-36 w-full overflow-hidden bg-[#0A0A0E]">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#85838A]">
                        <Icon className="w-8 h-8 text-[#C9A96E]/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/70 text-[#E8E5DF] border border-white/15">
                        {service.category}
                      </span>
                      {service.featured && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#C9A96E] text-[#0A0A0E] font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 text-right">
                      <div className="text-[9px] font-mono text-[#85838A] uppercase">
                        Starts at
                      </div>
                      <div className="text-sm font-bold font-mono text-[#DFC492]">
                        {service.priceStartingAt}
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-[#141419]/90 border border-[#C9A96E]/35 text-[#C9A96E] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div>
                      <h3 className="font-editorial text-lg text-[#E8E5DF] leading-snug">
                        {service.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#85838A] font-mono">
                        <Clock className="w-3 h-3 text-[#C9A96E]" />
                        <span>TAT: {service.tat}</span>
                        <span>·</span>
                        <span>Order #{service.displayOrder}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#85838A] leading-relaxed line-clamp-2">
                      {service.shortDescription}
                    </p>

                    {service.requirements && service.requirements.length > 0 && (
                      <div className="pt-2 border-t border-white/[0.06]">
                        <div className="text-[9px] font-mono uppercase tracking-wider text-[#85838A] mb-1">
                          Required Documents
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {service.requirements.slice(0, 3).map((req, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#16161B] border border-white/[0.06] text-[#E8E5DF]/80"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3.5 border-t border-white/[0.06] bg-[#141419]/60 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleServiceVisibility(service.id)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        service.visible
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-[#85838A] hover:bg-white/[0.05]'
                      }`}
                      title={service.visible ? 'Visible' : 'Hidden'}
                    >
                      {service.visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleServiceFeatured(service.id)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        service.featured
                          ? 'text-[#C9A96E] hover:bg-[#C9A96E]/10'
                          : 'text-[#85838A] hover:bg-white/[0.05]'
                      }`}
                      title="Toggle Featured"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      title="Test WhatsApp Link"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService(service);
                        setServiceModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#211B16] border border-[#C9A96E]/35 text-xs font-medium text-[#DFC492] hover:border-[#C9A96E]/65 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete "${service.title}" from catalog?`
                          )
                        ) {
                          deleteService(service.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CmsSurfaceCard>

      <ServiceModal />
    </div>
  );
};
