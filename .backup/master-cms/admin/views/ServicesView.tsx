import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ServiceCategory, ServiceItem } from '../types';
import {
  Plus,
  Search,
  Filter,
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
} from 'lucide-react';

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
  } = useAdmin();

  const [selectedCategory, setSelectedCategory] = useState<'all' | ServiceCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (selectedCategory !== 'all' && s.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesCategory = s.category.toLowerCase().includes(q);
        const matchesDesc = s.shortDescription.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory && !matchesDesc) return false;
      }
      return true;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0]">
              All Aman Computer Services
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[rgba(107,92,92,0.15)] dark:bg-[rgba(196,176,176,0.15)] text-[#6B5C5C] dark:text-[#C4B0B0]">
              {services.length} Total
            </span>
          </div>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8]">
            Manage cyber cafe service catalog, pricing, customer requirements & WhatsApp templates
          </p>
        </div>

        <button
          onClick={() => {
            setEditingService(null);
            setServiceModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1818] hover:bg-[#302A2A] dark:bg-[#E8E4E0] dark:hover:bg-white text-[#E8E4E0] dark:text-[#1A1818] font-semibold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const count = cat === 'all' ? services.length : services.filter((s) => s.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] shadow-xs'
                  : 'text-[#6B5C5C] dark:text-[#B5A8A8] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]'
              }`}
            >
              <span>{cat === 'all' ? 'All Services' : cat}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black font-bold'
                    : 'bg-[rgba(196,176,176,0.2)] text-[#6B5C5C] dark:text-[#B5A8A8]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#857878] dark:text-[#B5A8A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search services by title, category, or description keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] text-xs text-[#1A1818] dark:text-[#E8E4E0] placeholder-[#857878] dark:placeholder-[#B5A8A8] outline-hidden"
        />
      </div>

      {/* Services Grid (All 16 Services) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredServices.map((service) => {
          const Icon = ICON_MAP[service.iconName] || Layers;
          const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(
            service.whatsappMessageTemplate || `Namaste Aman Computer, I need info about ${service.title}`
          )}`;

          return (
            <div
              key={service.id}
              className={`rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] backdrop-blur-md shadow-xs overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
                !service.visible ? 'opacity-60' : ''
              }`}
            >
              {/* Card Header & Media Preview */}
              <div>
                <div className="relative h-36 w-full overflow-hidden bg-black/5 dark:bg-white/5">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                      {service.category}
                    </span>
                    {service.featured && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/80 text-white backdrop-blur-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Starting Price Badge */}
                  <div className="absolute bottom-3 right-3 text-right">
                    <div className="text-[9px] font-mono text-white/70 uppercase">Starts at</div>
                    <div className="text-sm font-bold font-mono text-emerald-300 drop-shadow-sm">
                      {service.priceStartingAt}
                    </div>
                  </div>

                  {/* Icon Badge */}
                  <div className="absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-white/90 dark:bg-[#1A1818]/90 text-[#1A1818] dark:text-[#E8E4E0] flex items-center justify-center shadow-md">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-2.5">
                  <div>
                    <h3 className="text-base font-bold text-[#1A1818] dark:text-[#E8E4E0] tracking-tight">
                      {service.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#857878] dark:text-[#B5A8A8] font-mono">
                      <Clock className="w-3 h-3" />
                      <span>TAT: {service.tat}</span>
                      <span>•</span>
                      <span>Order #{service.displayOrder}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#857878] dark:text-[#B5A8A8] leading-relaxed line-clamp-2">
                    {service.shortDescription}
                  </p>

                  {/* Document Requirements Tags */}
                  {service.requirements && service.requirements.length > 0 && (
                    <div className="pt-2 border-t border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)]">
                      <div className="text-[9px] font-mono uppercase tracking-wider text-[#857878] dark:text-[#B5A8A8] mb-1">
                        Required Documents
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {service.requirements.slice(0, 3).map((req, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(196,176,176,0.15)] dark:bg-[rgba(196,176,176,0.08)] text-[#6B5C5C] dark:text-[#C4B0B0]"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 border-t border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)] bg-[rgba(196,176,176,0.05)] flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {/* Visibility Toggle */}
                  <button
                    onClick={() => toggleServiceVisibility(service.id)}
                    className={`p-2 rounded-xl transition-colors ${
                      service.visible
                        ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                        : 'text-[#857878] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    title={service.visible ? 'Hide from public catalog' : 'Show in public catalog'}
                  >
                    {service.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Featured Spotlight Toggle */}
                  <button
                    onClick={() => toggleServiceFeatured(service.id)}
                    className={`p-2 rounded-xl transition-colors ${
                      service.featured
                        ? 'text-amber-500 hover:bg-amber-500/10'
                        : 'text-[#857878] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    title={service.featured ? 'Remove from homepage spotlight' : 'Pin to homepage spotlight'}
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  {/* Test WhatsApp Action Link */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                    title="Test WhatsApp Customer Lead Link"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingService(service);
                      setServiceModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[rgba(196,176,176,0.35)] text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${service.title}" from catalog?`)) {
                        deleteService(service.id);
                      }
                    }}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
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
    </div>
  );
};
