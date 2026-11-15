import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Landmark,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { GovernmentSchemeItem, UpdateStatus } from '../types';
import {
  CmsMediaField,
  CmsModal,
  CmsPageHeader,
  CmsSurfaceCard,
  CmsToggle,
} from '../components/CmsPrimitives';
import { deleteStorageFileByUrl } from '../services/storageService';

const SCHEME_CATEGORIES = [
  'Central Welfare',
  'State Welfare',
  'Student Scholarship',
  'Farmer & Kisan',
  'Employment & Skill',
  'Women & Child',
  'Healthcare & Insurance',
  'Housing & Pension',
];

const APPLICATION_MODES = [
  'Online via CSC Counter',
  'State e-District Portal',
  'Central DBT Portal',
  'Offline + Online Verification',
];

const SCHEME_STATUSES: UpdateStatus[] = ['New', 'Active', 'Closing Soon', 'Closed'];

const createEmptyScheme = (nextOrder: number): Omit<GovernmentSchemeItem, 'id'> => ({
  title: '',
  category: SCHEME_CATEGORIES[0],
  department: '',
  shortDescription: '',
  eligibility: '',
  benefits: '',
  requiredDocuments: [],
  applicationMode: APPLICATION_MODES[0],
  lastDate: '',
  officialLink: '',
  posterImage: '',
  status: 'Active',
  featured: false,
  published: true,
  displayOrder: nextOrder,
});

export const GovernmentSchemesView: React.FC = () => {
  const {
    governmentSchemes,
    addGovernmentScheme,
    updateGovernmentScheme,
    deleteGovernmentScheme,
    toggleGovernmentSchemePublished,
    showToast,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<GovernmentSchemeItem, 'id'>>(
    createEmptyScheme(1)
  );
  const [docInput, setDocInput] = useState('');

  const filteredSchemes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...governmentSchemes]
      .filter((item) => {
        if (categoryFilter !== 'All' && item.category !== categoryFilter) {
          return false;
        }
        if (statusFilter !== 'All' && item.status !== statusFilter) {
          return false;
        }
        if (!q) return true;
        return (
          item.title.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q) ||
          item.shortDescription.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [governmentSchemes, searchQuery, categoryFilter, statusFilter]);

  const publishedCount = governmentSchemes.filter((s) => s.published).length;
  const featuredCount = governmentSchemes.filter((s) => s.featured).length;

  const openCreateModal = () => {
    const nextOrder =
      governmentSchemes.reduce((max, s) => Math.max(max, s.displayOrder), 0) + 1;
    setEditingId(null);
    setDraft(createEmptyScheme(nextOrder));
    setDocInput('');
    setModalOpen(true);
  };

  const openEditModal = (scheme: GovernmentSchemeItem) => {
    setEditingId(scheme.id);
    setDraft({
      title: scheme.title,
      category: scheme.category,
      department: scheme.department,
      shortDescription: scheme.shortDescription,
      eligibility: scheme.eligibility,
      benefits: scheme.benefits,
      requiredDocuments: [...(scheme.requiredDocuments || [])],
      applicationMode: scheme.applicationMode,
      lastDate: scheme.lastDate,
      officialLink: scheme.officialLink,
      posterImage: scheme.posterImage,
      status: scheme.status,
      featured: scheme.featured,
      published: scheme.published,
      displayOrder: scheme.displayOrder,
    });
    setDocInput('');
    setModalOpen(true);
  };

  const handleAddDocTag = () => {
    const clean = docInput.trim();
    if (!clean) return;
    if (draft.requiredDocuments.includes(clean)) {
      setDocInput('');
      return;
    }
    setDraft((prev) => ({
      ...prev,
      requiredDocuments: [...prev.requiredDocuments, clean],
    }));
    setDocInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) {
      showToast('Missing Title', 'Please provide the official scheme name.', 'warning');
      return;
    }
    if (draft.officialLink.trim() && !/^https?:\/\//i.test(draft.officialLink.trim())) {
      showToast(
        'Invalid Official URL',
        'Please enter a verified http:// or https:// portal link.',
        'warning'
      );
      return;
    }

    const payload: Omit<GovernmentSchemeItem, 'id'> = {
      ...draft,
      title: draft.title.trim(),
      department: draft.department.trim(),
      shortDescription: draft.shortDescription.trim(),
      eligibility: draft.eligibility.trim(),
      benefits: draft.benefits.trim(),
      lastDate: draft.lastDate.trim(),
      officialLink: draft.officialLink.trim(),
      posterImage: draft.posterImage.trim(),
    };

    if (editingId) {
      updateGovernmentScheme(editingId, payload);
    } else {
      addGovernmentScheme(payload);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Content Management · Public Welfare"
        title="Government Schemes"
        description="Create, verify, and publish citizen welfare schemes with exact eligibility, required documents, and official government links."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Government Scheme</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#141419] border border-white/[0.07] p-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#85838A]">
            Total Schemes
          </div>
          <div className="font-editorial text-3xl text-[#E8E5DF] mt-1">
            {governmentSchemes.length}
          </div>
        </div>
        <div className="rounded-2xl bg-[#141419] border border-white/[0.07] p-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#85838A]">
            Published Live
          </div>
          <div className="font-editorial text-3xl text-[#C9A96E] mt-1">
            {publishedCount}
          </div>
        </div>
        <div className="rounded-2xl bg-[#141419] border border-white/[0.07] p-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#85838A]">
            Featured Highlights
          </div>
          <div className="font-editorial text-3xl text-[#E8E5DF] mt-1">
            {featuredCount}
          </div>
        </div>
      </div>

      <CmsSurfaceCard
        title="Published & Draft Schemes"
        subtitle="Only published schemes appear on the public Aman Computer website."
        headerRight={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#85838A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schemes..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] focus:border-[#C9A96E]/60 outline-none"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
            >
              <option value="All">All Categories</option>
              {SCHEME_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
            >
              <option value="All">All Statuses</option>
              {SCHEME_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {filteredSchemes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.1] bg-[#0A0A0E] py-14 px-6 text-center space-y-3">
            <div className="w-11 h-11 mx-auto rounded-xl bg-[#211B16] border border-[#C9A96E]/35 flex items-center justify-center text-[#C9A96E]">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="font-editorial text-xl text-[#E8E5DF]">
              {governmentSchemes.length === 0
                ? 'No Government Schemes Added Yet'
                : 'No Matching Schemes Found'}
            </div>
            <p className="text-xs text-[#85838A] max-w-md mx-auto leading-relaxed">
              {governmentSchemes.length === 0
                ? 'Add verified central or state citizen welfare schemes only when you want them published on the public portal.'
                : 'Try adjusting your search keywords or category filter.'}
            </p>
            {governmentSchemes.length === 0 && (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Scheme</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="rounded-xl bg-[#101014] border border-white/[0.07] p-4 flex flex-col justify-between gap-4 hover:border-[#C9A96E]/30 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  {scheme.posterImage ? (
                    <img
                      src={scheme.posterImage}
                      alt={scheme.title}
                      className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#211B16] border border-[#C9A96E]/30 flex items-center justify-center text-[#C9A96E] shrink-0">
                      <Landmark className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#16161B] border border-white/[0.08] text-[10px] font-mono text-[#C9A96E]">
                        {scheme.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                          scheme.status === 'Closing Soon'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : scheme.status === 'Closed'
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {scheme.status}
                      </span>
                      {scheme.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#211B16] text-[#DFC492] border border-[#C9A96E]/30 text-[10px] font-mono">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="font-editorial text-lg text-[#E8E5DF] leading-snug">
                      {scheme.title}
                    </h3>
                    {scheme.department && (
                      <div className="text-[11px] text-[#85838A]">
                        {scheme.department} · {scheme.applicationMode}
                      </div>
                    )}
                    {scheme.shortDescription && (
                      <p className="text-xs text-[#E8E5DF]/80 line-clamp-2 leading-relaxed pt-1">
                        {scheme.shortDescription}
                      </p>
                    )}
                  </div>
                </div>

                {scheme.requiredDocuments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {scheme.requiredDocuments.slice(0, 4).map((doc) => (
                      <span
                        key={doc}
                        className="px-2 py-0.5 rounded-md bg-[#0A0A0E] border border-white/[0.06] text-[10px] text-[#85838A]"
                      >
                        {doc}
                      </span>
                    ))}
                    {scheme.requiredDocuments.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md bg-[#0A0A0E] text-[10px] text-[#C9A96E]">
                        +{scheme.requiredDocuments.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-[#85838A]">
                    <span>{scheme.lastDate ? `Deadline: ${scheme.lastDate}` : 'Ongoing'}</span>
                    {scheme.officialLink && (
                      <a
                        href={scheme.officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#C9A96E] hover:text-[#DFC492]"
                      >
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleGovernmentSchemePublished(scheme.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        scheme.published
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-[#16161B] text-[#85838A] border border-white/[0.08]'
                      }`}
                    >
                      {scheme.published ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(scheme)}
                      className="p-1.5 rounded-lg text-[#E8E5DF] hover:bg-white/[0.06] transition-colors cursor-pointer"
                      title="Edit scheme"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (scheme.posterImage) {
                          void deleteStorageFileByUrl(scheme.posterImage);
                        }
                        deleteGovernmentScheme(scheme.id);
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete scheme"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CmsSurfaceCard>

      <CmsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Government Scheme' : 'Add Government Scheme'}
        subtitle="Provide verified scheme details, citizen eligibility, and official portal links."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Scheme Title *
              </label>
              <input
                type="text"
                required
                value={draft.title}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., PM Surya Ghar Muft Bijli Yojana"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Category
              </label>
              <select
                value={draft.category}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
              >
                {SCHEME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Issuing Department / Ministry
              </label>
              <input
                type="text"
                value={draft.department}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, department: e.target.value }))
                }
                placeholder="e.g., Ministry of Agriculture / State Social Welfare"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Application Mode
              </label>
              <select
                value={draft.applicationMode}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    applicationMode: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
              >
                {APPLICATION_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Status
              </label>
              <select
                value={draft.status}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    status: e.target.value as UpdateStatus,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
              >
                {SCHEME_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Last Date / Cycle
              </label>
              <input
                type="text"
                value={draft.lastDate}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, lastDate: e.target.value }))
                }
                placeholder="e.g., 31 Dec 2026 or Ongoing"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Official Portal Link
              </label>
              <input
                type="url"
                value={draft.officialLink}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, officialLink: e.target.value }))
                }
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs font-mono text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
              Short Description
            </label>
            <textarea
              rows={2}
              value={draft.shortDescription}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  shortDescription: e.target.value,
                }))
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Citizen Eligibility
              </label>
              <textarea
                rows={2}
                value={draft.eligibility}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, eligibility: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Key Benefits
              </label>
              <textarea
                rows={2}
                value={draft.benefits}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, benefits: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#E8E5DF]">
              Required Documents Checklist
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={docInput}
                onChange={(e) => setDocInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDocTag();
                  }
                }}
                placeholder="Type document name & press Add (e.g., Aadhaar Card)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
              />
              <button
                type="button"
                onClick={handleAddDocTag}
                className="px-3.5 py-2 rounded-xl bg-[#211B16] border border-[#C9A96E]/35 text-xs font-medium text-[#DFC492] cursor-pointer"
              >
                Add
              </button>
            </div>
            {draft.requiredDocuments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {draft.requiredDocuments.map((doc) => (
                  <span
                    key={doc}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101014] border border-white/[0.08] text-[11px] text-[#E8E5DF]"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#C9A96E]" />
                    <span>{doc}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          requiredDocuments: prev.requiredDocuments.filter(
                            (item) => item !== doc
                          ),
                        }))
                      }
                      className="text-[#85838A] hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <CmsMediaField
            label="Scheme Poster Image (Optional)"
            value={draft.posterImage}
            onChange={(url) => setDraft((prev) => ({ ...prev, posterImage: url }))}
            onRemove={(prevUrl) => {
              void deleteStorageFileByUrl(prevUrl);
            }}
            bucket="update-posters"
            folder="schemes"
            aspectClass="aspect-video max-w-sm"
            emptyLabel="No poster uploaded"
            onError={(msg) => showToast('Poster Upload Error', msg, 'error')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <CmsToggle
              checked={draft.published}
              onChange={(next) =>
                setDraft((prev) => ({ ...prev, published: next }))
              }
              label="Publish on Website"
              description="Make this scheme visible to public visitors."
            />
            <CmsToggle
              checked={draft.featured}
              onChange={(next) =>
                setDraft((prev) => ({ ...prev, featured: next }))
              }
              label="Mark as Featured"
              description="Highlight this scheme at the top of lists."
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.07]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#101014] border border-white/[0.08] text-xs font-medium text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold cursor-pointer"
            >
              {editingId ? 'Save Changes' : 'Create Scheme'}
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
};
