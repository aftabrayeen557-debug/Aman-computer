import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { LatestUpdateItem, UpdateCategory, UpdateStatus } from '../types';
import {
  Sparkles,
  Plus,
  Search,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  X,
  Eye,
  EyeOff,
  Upload,
  Loader2,
} from 'lucide-react';
import { uploadFileToStorage } from '../services/storageService';

const CATEGORIES: UpdateCategory[] = [
  'Jobs',
  'Admit Card',
  'Results',
  'Government Schemes',
  'Scholarships',
  'Certificates',
  'Other Announcements',
];

const STATUSES: UpdateStatus[] = ['New', 'Active', 'Closing Soon', 'Closed'];

export const LatestUpdatesView: React.FC = () => {
  const {
    latestUpdates,
    addLatestUpdate,
    updateLatestUpdate,
    deleteLatestUpdate,
    toggleLatestUpdatePublished,
    showToast,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LatestUpdateItem | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<UpdateCategory>('Jobs');
  const [shortDescription, setShortDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [lastDate, setLastDate] = useState('');
  const [examDate, setExamDate] = useState('');
  const [qualification, setQualification] = useState('');
  const [ageLimit, setAgeLimit] = useState('');
  const [applicationFee, setApplicationFee] = useState('');
  const [officialLink, setOfficialLink] = useState('');
  const [posterImage, setPosterImage] = useState('');
  const [status, setStatus] = useState<UpdateStatus>('New');
  const [published, setPublished] = useState(true);

  const filteredUpdates = latestUpdates.filter((u) => {
    const matchesSearch =
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || u.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('Jobs');
    setShortDescription('');
    setStartDate(new Date().toISOString().slice(0, 10));
    setLastDate('');
    setExamDate('');
    setQualification('10th / 12th / Graduate');
    setAgeLimit('18 - 27 Years');
    setApplicationFee('Gen/OBC: ₹100, SC/ST: ₹0');
    setOfficialLink('https://ssc.gov.in');
    setPosterImage('');
    setStatus('New');
    setPublished(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: LatestUpdateItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory((item.category as UpdateCategory) || 'Jobs');
    setShortDescription(item.shortDescription);
    setStartDate(item.importantDates?.startDate || '');
    setLastDate(item.importantDates?.lastDate || '');
    setExamDate(item.importantDates?.examDate || '');
    setQualification(item.eligibility?.qualification || '');
    setAgeLimit(item.eligibility?.ageLimit || '');
    setApplicationFee(item.applicationFee || '');
    setOfficialLink(item.officialLink || '');
    setPosterImage(item.posterImage || '');
    setStatus(item.status);
    setPublished(item.published);
    setModalOpen(true);
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPoster(true);
    try {
      const res = await uploadFileToStorage('update-posters', file, 'updates', 'image');
      if (!res.success || !res.url) {
        showToast('Poster Upload Failed', res.error || 'Could not upload poster image.', 'error');
        return;
      }
      setPosterImage(res.url);
      showToast('Poster Uploaded', 'Update poster uploaded to Supabase Storage.');
    } finally {
      setUploadingPoster(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDescription.trim()) return;

    const payload = {
      title: title.trim(),
      category,
      shortDescription: shortDescription.trim(),
      importantDates: {
        startDate: startDate || undefined,
        lastDate: lastDate || undefined,
        examDate: examDate || undefined,
      },
      eligibility: {
        qualification: qualification || undefined,
        ageLimit: ageLimit || undefined,
      },
      applicationFee: applicationFee || undefined,
      officialLink: officialLink || undefined,
      posterImage: posterImage.trim() || undefined,
      status,
      published,
    };

    if (editingItem) {
      updateLatestUpdate(editingItem.id, payload);
    } else {
      addLatestUpdate(payload);
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              Door 0 Public Sync
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] flex items-center gap-2 mt-1">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span>Latest Updates & Sarkari Alerts Manager</span>
          </h1>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8] mt-0.5">
            Post recruitments, admit cards, results, and welfare schemes. Synced live to the public Door 0 page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/web-developer/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] bg-white/50 dark:bg-black/20 text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Door 0</span>
          </a>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Update</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#857878] dark:text-[#B5A8A8]" />
          <input
            type="text"
            placeholder="Search updates by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] text-xs text-[#1A1818] dark:text-[#E8E4E0] placeholder-[#857878] dark:placeholder-[#B5A8A8] outline-hidden focus:border-[#1A1818] dark:focus:border-[#E8E4E0]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
                : 'bg-black/5 dark:bg-white/5 text-[#857878] dark:text-[#B5A8A8] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]'
            }`}
          >
            All Categories ({latestUpdates.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
                  : 'bg-black/5 dark:bg-white/5 text-[#857878] dark:text-[#B5A8A8] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Updates Cards Grid */}
      {filteredUpdates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[rgba(242,238,235,0.5)] dark:bg-[rgba(196,176,176,0.03)] border border-[rgba(196,176,176,0.2)]">
          <Sparkles className="w-8 h-8 text-[#857878] mx-auto mb-2 opacity-50" />
          <div className="text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
            No Updates in Catalog
          </div>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8] mt-1 max-w-sm mx-auto">
            Click 'Create Update' to publish Sarkari recruitment notifications, admit card links, or scholarship dates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUpdates.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                item.published
                  ? 'bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)]'
                  : 'bg-black/5 dark:bg-white/5 border-dashed border-gray-400 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#1A1818] dark:text-[#E8E4E0]">
                    {item.category}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'New'
                        ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                        : item.status === 'Closing Soon'
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                        : item.status === 'Active'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : 'bg-gray-500/15 text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#1A1818] dark:text-[#E8E4E0] line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#857878] dark:text-[#B5A8A8] line-clamp-3 mt-1 leading-relaxed">
                    {item.shortDescription}
                  </p>
                </div>

                {/* Dates & Eligibility Highlights */}
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] font-mono space-y-1 text-[#857878] dark:text-[#B5A8A8]">
                  {item.importantDates?.lastDate && (
                    <div className="flex justify-between">
                      <span>Last Date:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{item.importantDates.lastDate}</span>
                    </div>
                  )}
                  {item.eligibility?.qualification && (
                    <div className="flex justify-between">
                      <span>Eligibility:</span>
                      <span className="truncate max-w-[130px]">{item.eligibility.qualification}</span>
                    </div>
                  )}
                  {item.applicationFee && (
                    <div className="flex justify-between">
                      <span>Fee:</span>
                      <span>{item.applicationFee}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 mt-4 border-t border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)]">
                <button
                  onClick={() => toggleLatestUpdatePublished(item.id)}
                  className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                    item.published
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-500'
                  }`}
                  title="Toggle Public Visibility"
                >
                  {item.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{item.published ? 'Live on Door 0' : 'Draft (Hidden)'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    title="Edit Update"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${item.title}"?`)) {
                        deleteLatestUpdate(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete Update"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#F0ECE9] dark:bg-[#1A1818] border border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.2)] rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
              <h3 className="text-base font-bold text-[#1A1818] dark:text-[#E8E4E0]">
                {editingItem ? 'Edit Sarkari Update' : 'Publish New Sarkari Update'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-[#857878] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Announcement / Job Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. SSC CGL 2026 Recruitment Online Form"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as UpdateCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                    Status Badge
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as UpdateStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Short Summary / Post Details *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Key vacancies, departments, or exam dates..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[rgba(196,176,176,0.2)]">
                <div>
                  <label className="block text-[10px] font-semibold text-[#857878] mb-0.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[11px] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#857878] mb-0.5">
                    Last Date
                  </label>
                  <input
                    type="date"
                    value={lastDate}
                    onChange={(e) => setLastDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[11px] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#857878] mb-0.5">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[11px] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                    Qualification Eligibility
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10th / 12th / Bachelor Degree"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                    Application Fee Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹100 for Gen/OBC, ₹0 for SC/ST"
                    value={applicationFee}
                    onChange={(e) => setApplicationFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Official Portal / Notification URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={officialLink}
                  onChange={(e) => setOfficialLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#857878] dark:text-[#B5A8A8] mb-1">
                  Notification Poster / Graphic (Optional)
                </label>
                <div className="flex gap-2">
                  <label className="px-3 py-2 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] font-medium flex items-center gap-1.5 cursor-pointer shrink-0">
                    {uploadingPoster ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{uploadingPoster ? 'Uploading...' : 'Upload Poster'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePosterUpload}
                      disabled={uploadingPoster}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="Or paste poster URL (https://...)"
                    value={posterImage}
                    onChange={(e) => setPosterImage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] font-mono text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="publishedCheck"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="publishedCheck" className="text-xs text-[#1A1818] dark:text-[#E8E4E0]">
                  Publish immediately to public website (Door 0)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-[rgba(196,176,176,0.3)] text-[#857878] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] font-semibold hover:opacity-90"
                >
                  {editingItem ? 'Save Changes' : 'Publish Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
