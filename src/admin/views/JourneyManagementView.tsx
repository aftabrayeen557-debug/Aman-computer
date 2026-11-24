import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { JourneyItem } from '../types';
import {
  CmsMediaField,
  CmsModal,
  CmsPageHeader,
  CmsSurfaceCard,
  CmsToggle,
} from '../components/CmsPrimitives';
import { deleteStorageFileByUrl } from '../services/storageService';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const YEARS = ['2024', '2025', '2026', '2027'];

export const JourneyManagementView: React.FC = () => {
  const {
    journey,
    addJourneyItem,
    updateJourneyItem,
    deleteJourneyItem,
    toggleJourneyPublished,
    showToast,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState('');

  const [formData, setFormData] = useState<{
    year: string;
    month: string;
    date: string;
    title: string;
    subtitle: string;
    description: string;
    bullets: string[];
    imageUrl: string;
    published: boolean;
  }>({
    year: '2024',
    month: 'January',
    date: 'Jan 2024',
    title: '',
    subtitle: '',
    description: '',
    bullets: [''],
    imageUrl: '',
    published: true,
  });

  const orderedJourney = useMemo(
    () =>
      [...journey].sort((a, b) => {
        const orderDiff = (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999);
        if (orderDiff !== 0) return orderDiff;
        return (a.year || '').localeCompare(b.year || '');
      }),
    [journey]
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setOriginalImageUrl('');
    setFormData({
      year: '2025',
      month: 'January',
      date: 'Jan 2025',
      title: '',
      subtitle: '',
      description: '',
      bullets: [''],
      imageUrl: '',
      published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: JourneyItem) => {
    setEditingId(item.id);
    setOriginalImageUrl(item.imageUrl || '');
    setFormData({
      year: item.year || '2025',
      month: item.month || 'January',
      date: item.date || `${item.month?.slice(0, 3)} ${item.year}`,
      title: item.title,
      subtitle: item.subtitle || '',
      description: item.description || '',
      bullets: item.bullets && item.bullets.length > 0 ? [...item.bullets] : [''],
      imageUrl: item.imageUrl || '',
      published: item.published,
    });
    setIsModalOpen(true);
  };

  const handleMonthOrYearChange = (newMonth: string, newYear: string) => {
    const shortMonth = newMonth.slice(0, 3);
    setFormData((prev) => ({
      ...prev,
      month: newMonth,
      year: newYear,
      date: `${shortMonth} ${newYear}`,
    }));
  };

  const handleBulletChange = (index: number, value: string) => {
    const updated = [...formData.bullets];
    updated[index] = value;
    setFormData({ ...formData, bullets: updated });
  };

  const handleAddBullet = () => {
    setFormData({
      ...formData,
      bullets: [...formData.bullets, ''],
    });
  };

  const handleRemoveBullet = (index: number) => {
    if (formData.bullets.length <= 1) {
      setFormData({ ...formData, bullets: [''] });
      return;
    }
    setFormData({
      ...formData,
      bullets: formData.bullets.filter((_, i) => i !== index),
    });
  };

  const moveMilestone = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= orderedJourney.length) return;
    const current = orderedJourney[index];
    const swapWith = orderedJourney[target];
    updateJourneyItem(current.id, { displayOrder: target + 1 });
    updateJourneyItem(swapWith.id, { displayOrder: index + 1 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = formData.title.trim();
    if (!cleanTitle) {
      showToast('Validation Error', 'Milestone title is required', 'error');
      return;
    }

    const cleanBullets = formData.bullets.map((b) => b.trim()).filter((b) => b.length > 0);
    const cleanImageUrl = formData.imageUrl.trim() || undefined;

    if (editingId && originalImageUrl && originalImageUrl !== cleanImageUrl) {
      void deleteStorageFileByUrl(originalImageUrl);
    }

    const payload = {
      year: formData.year.trim() || '2025',
      month: formData.month.trim() || 'January',
      date: formData.date.trim() || `${formData.month.slice(0, 3)} ${formData.year}`,
      title: cleanTitle,
      subtitle: formData.subtitle.trim() || undefined,
      description: formData.description.trim() || undefined,
      bullets: cleanBullets.length > 0 ? cleanBullets : undefined,
      imageUrl: cleanImageUrl,
      published: formData.published,
    };

    if (editingId) {
      updateJourneyItem(editingId, payload);
    } else {
      addJourneyItem({
        ...payload,
        displayOrder: orderedJourney.length + 1,
      });
    }

    setIsModalOpen(false);
  };

  const filteredList = orderedJourney.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      item.year.includes(searchQuery) ||
      item.date.toLowerCase().includes(q);

    const matchesYear = filterYear === 'all' || item.year === filterYear;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && item.published) ||
      (filterStatus === 'draft' && !item.published);

    return matchesQuery && matchesYear && matchesStatus;
  });

  const publishedCount = journey.filter((j) => j.published).length;
  const draftCount = journey.filter((j) => !j.published).length;

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Our Journey Timeline · 2024–2027"
        title="The Journey of Aman Computer"
        description="Curate real milestones, center expansions, and optional milestone photographs synced directly to the public timeline."
        actions={
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] font-semibold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Journey Milestone</span>
          </button>
        }
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#141419] border border-white/[0.07]">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#85838A]">
            Total Entries
          </div>
          <div className="font-editorial text-3xl text-[#E8E5DF] mt-1 tabular-nums">
            {journey.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141419] border border-white/[0.07]">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-400">
            Live on Site
          </div>
          <div className="font-editorial text-3xl text-emerald-400 mt-1 tabular-nums">
            {publishedCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141419] border border-white/[0.07]">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#85838A]">
            Drafts (Hidden)
          </div>
          <div className="font-editorial text-3xl text-[#85838A] mt-1 tabular-nums">
            {draftCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141419] border border-white/[0.07]">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
            Active Span
          </div>
          <div className="text-xs font-mono text-[#E8E5DF] mt-3">
            {orderedJourney.length > 0
              ? `${orderedJourney[0].date} — ${orderedJourney[orderedJourney.length - 1].date}`
              : 'No milestones yet'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <CmsSurfaceCard className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#85838A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search milestones by title, date, or narrative..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none cursor-pointer focus:border-[#C9A96E]/60"
            >
              <option value="all">All Years</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none cursor-pointer focus:border-[#C9A96E]/60"
            >
              <option value="all">All Status</option>
              <option value="published">Live Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>
        </div>
      </CmsSurfaceCard>

      {/* Milestones List */}
      {journey.length === 0 ? (
        <CmsSurfaceCard className="text-center py-12 border-dashed border-white/[0.12]">
          <Calendar className="w-10 h-10 mx-auto text-[#C9A96E]/70 mb-3" />
          <h3 className="font-editorial text-xl text-[#E8E5DF] mb-1">
            No Journey Information Available
          </h3>
          <p className="text-xs text-[#85838A] max-w-sm mx-auto mb-5 leading-relaxed">
            Zero demo or preloaded records exist. Add Aman Computer&apos;s first authentic milestone to populate the public timeline.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Milestone</span>
          </button>
        </CmsSurfaceCard>
      ) : filteredList.length === 0 ? (
        <CmsSurfaceCard className="text-center py-10">
          <p className="text-xs text-[#85838A]">No milestones match your active filters.</p>
        </CmsSurfaceCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const globalIndex = orderedJourney.findIndex((x) => x.id === item.id);
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  item.published
                    ? 'bg-[#141419] border-white/[0.08]'
                    : 'bg-[#101014] border-dashed border-white/[0.06] opacity-65'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold tabular-nums bg-[#211B16] border border-[#C9A96E]/35 text-[#C9A96E]">
                        {item.year}
                      </span>
                      <span className="text-xs font-mono text-[#85838A]">{item.date}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={globalIndex <= 0}
                        onClick={() => moveMilestone(globalIndex, -1)}
                        title="Move Earlier"
                        className="p-1.5 rounded-lg border border-white/[0.08] text-[#85838A] hover:text-[#E8E5DF] hover:bg-white/[0.05] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={globalIndex >= orderedJourney.length - 1}
                        onClick={() => moveMilestone(globalIndex, 1)}
                        title="Move Later"
                        className="p-1.5 rounded-lg border border-white/[0.08] text-[#85838A] hover:text-[#E8E5DF] hover:bg-white/[0.05] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleJourneyPublished(item.id)}
                        title={item.published ? 'Hide from public timeline' : 'Publish to timeline'}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          item.published
                            ? 'border-emerald-500/35 text-emerald-400 bg-emerald-500/10'
                            : 'border-white/[0.08] text-[#85838A] bg-[#0A0A0E]'
                        }`}
                      >
                        {item.published ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Milestone"
                        className="p-1.5 rounded-lg border border-white/[0.08] text-[#85838A] hover:text-[#E8E5DF] hover:bg-white/[0.05] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete milestone "${item.title}"?`)) {
                            if (item.imageUrl) void deleteStorageFileByUrl(item.imageUrl);
                            deleteJourneyItem(item.id);
                          }
                        }}
                        title="Delete Milestone"
                        className="p-1.5 rounded-lg border border-rose-500/25 hover:bg-rose-500/10 text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.imageUrl && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-white/[0.08] bg-[#0A0A0E] aspect-[16/7]">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <h3 className="font-editorial text-xl text-[#E8E5DF] mb-1">
                    {item.title}
                  </h3>

                  {item.subtitle && (
                    <p className="text-xs font-medium text-[#DFC492] mb-2">{item.subtitle}</p>
                  )}

                  {item.description && (
                    <p className="text-xs text-[#85838A] leading-relaxed mb-3">
                      {item.description}
                    </p>
                  )}

                  {item.bullets && item.bullets.length > 0 && (
                    <ul className="space-y-1.5 pt-2.5 border-t border-white/[0.06]">
                      {item.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#E8E5DF]/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] shrink-0 mt-1.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <CmsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Journey Milestone' : 'Add Journey Milestone'}
        subtitle="Configure timeline date, narrative, highlights, and optional milestone image"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">Year *</label>
              <select
                value={formData.year}
                onChange={(e) => handleMonthOrYearChange(formData.month, e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">Month *</label>
              <select
                value={formData.month}
                onChange={(e) => handleMonthOrYearChange(e.target.value, formData.year)}
                className="w-full px-3 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Date Label *
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="e.g. Jan 2025"
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
              Milestone Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Center Establishment & High-Speed Cyber Terminal"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
              Subtitle / Hub (Optional)
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Main Market Cyber Cafe & Digital Center"
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
              Narrative Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief narrative of the milestone, expansion, or service capability..."
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <CmsMediaField
            label="Milestone Photo (Optional)"
            value={formData.imageUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
            onRemove={(prevUrl) => {
              if (prevUrl && prevUrl !== originalImageUrl) {
                void deleteStorageFileByUrl(prevUrl);
              }
            }}
            bucket="gallery-images"
            folder="journey"
            aspectClass="aspect-[16/7]"
            emptyLabel="Optional milestone photograph"
            helperText="Displayed cleanly beside this milestone on your public journey timeline."
            onError={(msg) => showToast('Image Upload Failed', msg, 'error')}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#E8E5DF]">
                Milestone Highlights (Optional)
              </label>
              <button
                type="button"
                onClick={handleAddBullet}
                className="text-[11px] font-medium text-[#C9A96E] hover:text-[#DFC492] cursor-pointer"
              >
                + Add Highlight
              </button>
            </div>

            <div className="space-y-2">
              {formData.bullets.map((bullet, bIdx) => (
                <div key={bIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => handleBulletChange(bIdx, e.target.value)}
                    placeholder={`Highlight #${bIdx + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveBullet(bIdx)}
                    className="p-1.5 text-[#85838A] hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <CmsToggle
            checked={formData.published}
            onChange={(next) => setFormData({ ...formData, published: next })}
            label="Publish to Public Timeline"
            description="Disable to keep this milestone saved privately as a draft."
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.07]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-white/[0.1] text-xs font-medium text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold cursor-pointer"
            >
              {editingId ? 'Save Milestone' : 'Add Milestone'}
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
};
