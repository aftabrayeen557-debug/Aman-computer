import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { JourneyItem } from '../types';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Search,
  AlertCircle,
  Layers,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const JourneyManagementView: React.FC = () => {
  const {
    journey,
    addJourneyItem,
    updateJourneyItem,
    deleteJourneyItem,
    toggleJourneyPublished,
    showToast,
  } = useAdmin();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    year: string;
    month: string;
    date: string;
    title: string;
    subtitle: string;
    description: string;
    bullets: string[];
    published: boolean;
  }>({
    year: '2024',
    month: 'January',
    date: 'Jan 2024',
    title: '',
    subtitle: '',
    description: '',
    bullets: [''],
    published: true,
  });

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

  const YEARS = ['2024', '2025', '2026'];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      year: '2024',
      month: 'January',
      date: 'Jan 2024',
      title: '',
      subtitle: '',
      description: '',
      bullets: [''],
      published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: JourneyItem) => {
    setEditingId(item.id);
    setFormData({
      year: item.year || '2025',
      month: item.month || 'January',
      date: item.date || `${item.month?.slice(0, 3)} ${item.year}`,
      title: item.title,
      subtitle: item.subtitle || '',
      description: item.description || '',
      bullets: item.bullets && item.bullets.length > 0 ? [...item.bullets] : [''],
      published: item.published,
    });
    setIsModalOpen(true);
  };

  const handleMonthOrYearChange = (newMonth: string, newYear: string) => {
    const shortMonth = newMonth.slice(0, 3);
    const autoDate = `${shortMonth} ${newYear}`;
    setFormData((prev) => ({
      ...prev,
      month: newMonth,
      year: newYear,
      date: autoDate,
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
    const updated = formData.bullets.filter((_, i) => i !== index);
    setFormData({ ...formData, bullets: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = formData.title.trim();
    if (!cleanTitle) {
      showToast('Validation Error', 'Milestone title is required', 'error');
      return;
    }

    const cleanBullets = formData.bullets
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const payload = {
      year: formData.year.trim() || '2025',
      month: formData.month.trim() || 'January',
      date: formData.date.trim() || `${formData.month.slice(0, 3)} ${formData.year}`,
      title: cleanTitle,
      subtitle: formData.subtitle.trim() || undefined,
      description: formData.description.trim() || undefined,
      bullets: cleanBullets.length > 0 ? cleanBullets : undefined,
      published: formData.published,
    };

    if (editingId) {
      updateJourneyItem(editingId, payload);
    } else {
      addJourneyItem(payload);
    }

    setIsModalOpen(false);
  };

  // Filtered and Sorted list (newest first or chronological)
  const filteredList = journey.filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.year.includes(searchQuery) ||
      item.date.toLowerCase().includes(searchQuery.toLowerCase());

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              Our Journey Timeline
            </span>
            <span className="text-xs text-[#857878] dark:text-[#B5A8A8]">• 2024–2026 Evolution</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0]">
            The Journey of Aman Computer
          </h1>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8]">
            Manage owner-created milestones and achievements. 0 entries shows &ldquo;No Journey Information Available&rdquo;.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1818] hover:bg-[#302A2A] dark:bg-[#E8E4E0] dark:hover:bg-white text-[#E8E4E0] dark:text-[#1A1818] font-semibold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Journey Milestone</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)]">
          <div className="text-[11px] font-mono text-[#857878] dark:text-[#B5A8A8] uppercase">Total Entries</div>
          <div className="text-2xl font-bold text-[#1A1818] dark:text-[#E8E4E0] mt-1 tabular-nums">
            {journey.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)]">
          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase">Live on Site</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {publishedCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)]">
          <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 uppercase">Draft (Hidden)</div>
          <div className="text-2xl font-bold text-neutral-600 dark:text-neutral-300 mt-1 tabular-nums">
            {draftCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)]">
          <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 uppercase">Timeline Range</div>
          <div className="text-xs font-bold text-[#1A1818] dark:text-[#E8E4E0] mt-2 font-mono">
            Jan 2024 — Dec 2026
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search milestones by title, date, or description..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Live Only</option>
            <option value="draft">Draft Only</option>
          </select>
        </div>
      </div>

      {/* Milestones List */}
      {journey.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-dashed border-[rgba(196,176,176,0.5)] dark:border-[rgba(196,176,176,0.2)]">
          <Calendar className="w-10 h-10 mx-auto text-neutral-400 mb-3" />
          <h3 className="text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0] mb-1">
            No Journey Information Available
          </h3>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8] max-w-sm mx-auto mb-4">
            Zero demo or preloaded records exist. Click below to add Aman Computer&apos;s first genuine milestone.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A1818] dark:bg-[#E8E4E0] text-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Milestone</span>
          </button>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <p className="text-xs text-neutral-500">No milestones match your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item, idx) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all ${
                item.published
                  ? 'bg-[rgba(242,238,235,0.8)] dark:bg-[rgba(196,176,176,0.06)] border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.15)] shadow-xs'
                  : 'bg-neutral-100/50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]">
                    {item.year}
                  </span>
                  <span className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400">
                    {item.date}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleJourneyPublished(item.id)}
                    title={item.published ? 'Hide from public timeline' : 'Publish to timeline'}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      item.published
                        ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                        : 'border-neutral-300 dark:border-neutral-700 text-neutral-500 bg-neutral-200/50 dark:bg-neutral-800'
                    }`}
                  >
                    {item.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Milestone"
                    className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete milestone "${item.title}"?`)) {
                        deleteJourneyItem(item.id);
                      }
                    }}
                    title="Delete Milestone"
                    className="p-1.5 rounded-lg border border-red-300/40 hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-[#1A1818] dark:text-[#E8E4E0] mb-1">
                {item.title}
              </h3>

              {item.subtitle && (
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                  {item.subtitle}
                </p>
              )}

              {item.description && (
                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                  {item.description}
                </p>
              )}

              {item.bullets && item.bullets.length > 0 && (
                <ul className="space-y-1.5 pt-2 border-t border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)]">
                  {item.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-neutral-200 shrink-0 mt-1" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] dark:bg-[#1E1B1B] w-full max-w-xl rounded-3xl border border-neutral-300 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {editingId ? 'Edit Journey Milestone' : 'Add New Journey Milestone'}
                </h3>
                <p className="text-xs text-neutral-500">
                  Specify date, title, optional subtitle, description, and bullet points.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Year and Month */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Year *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => handleMonthOrYearChange(formData.month, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Month *
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => handleMonthOrYearChange(e.target.value, formData.year)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Date Label *
                  </label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g. Jan 2025"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Center Establishment & High-Speed Cyber Terminal"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Subtitle / Organization / Hub (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Main Market Cyber Cafe & CSC Center"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief narrative of the milestone, expansion, or new capability introduced..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              {/* Bullet Points */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Milestone Highlights / Bullet Points (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    + Add Bullet
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
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(bIdx)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Published Toggle */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Publish to Public Timeline
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Unpublished entries stay saved in admin as drafts.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded text-neutral-950 focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1A1818] dark:bg-[#E8E4E0] text-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {editingId ? 'Save Milestone' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
