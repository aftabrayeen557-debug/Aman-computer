import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { LatestUpdateItem, UpdateCategory, UpdateStatus } from '../types';
import {
  Sparkles,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  CmsMediaField,
  CmsModal,
  CmsPageHeader,
  CmsSurfaceCard,
  CmsToggle,
} from '../components/CmsPrimitives';
import { deleteStorageFileByUrl } from '../services/storageService';

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
    const matchesCategory =
      selectedCategory === 'all' || u.category === selectedCategory;
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
    setQualification('');
    setAgeLimit('');
    setApplicationFee('');
    setOfficialLink('');
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
      officialLink: officialLink.trim() || undefined,
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
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Doors Management · Door 1 Public Portal"
        title="Latest Updates & Exam Alerts"
        description="Publish verified recruitment notices, admit card releases, results, and scholarships synced directly to the Latest Updates door."
        actions={
          <>
            <a
              href="/web-developer/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#101014] border border-white/[0.08] text-xs font-medium text-[#E8E5DF] hover:border-[#C9A96E]/45 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>Preview Door</span>
            </a>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Update</span>
            </button>
          </>
        }
      />

      <CmsSurfaceCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85838A]" />
            <input
              type="text"
              placeholder="Search updates by title or summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#211B16] text-[#DFC492] border border-[#C9A96E]/35'
                  : 'bg-[#101014] text-[#85838A] border border-white/[0.06] hover:text-[#E8E5DF]'
              }`}
            >
              All ({latestUpdates.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#211B16] text-[#DFC492] border border-[#C9A96E]/35'
                    : 'bg-[#101014] text-[#85838A] border border-white/[0.06] hover:text-[#E8E5DF]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredUpdates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.1] bg-[#0A0A0E] p-12 text-center space-y-2.5">
            <Sparkles className="w-8 h-8 text-[#C9A96E]/60 mx-auto" />
            <div className="font-editorial text-xl text-[#E8E5DF]">
              No Updates Available
            </div>
            <p className="text-xs text-[#85838A] max-w-sm mx-auto">
              Publish an exam form notice, admit card alert, or recruitment schedule to feature it on the Latest Updates door.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUpdates.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                  item.published
                    ? 'bg-[#101014] border-white/[0.08] hover:border-[#C9A96E]/30'
                    : 'bg-[#0A0A0E] border-dashed border-white/[0.1] opacity-65'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#16161B] border border-white/[0.07] text-[#C9A96E]">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        item.status === 'New'
                          ? 'bg-sky-500/15 text-sky-300 border border-sky-500/25'
                          : item.status === 'Closing Soon'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                          : item.status === 'Active'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                          : 'bg-white/[0.06] text-[#85838A]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-editorial text-lg text-[#E8E5DF] line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#85838A] line-clamp-3 mt-1.5 leading-relaxed">
                      {item.shortDescription}
                    </p>
                  </div>

                  {(item.importantDates?.lastDate ||
                    item.eligibility?.qualification ||
                    item.applicationFee) && (
                    <div className="p-2.5 rounded-lg bg-[#0A0A0E] border border-white/[0.06] text-[11px] font-mono space-y-1 text-[#85838A]">
                      {item.importantDates?.lastDate && (
                        <div className="flex justify-between">
                          <span>Last Date:</span>
                          <span className="text-rose-400">
                            {item.importantDates.lastDate}
                          </span>
                        </div>
                      )}
                      {item.eligibility?.qualification && (
                        <div className="flex justify-between gap-2">
                          <span>Eligibility:</span>
                          <span className="truncate text-[#E8E5DF]">
                            {item.eligibility.qualification}
                          </span>
                        </div>
                      )}
                      {item.applicationFee && (
                        <div className="flex justify-between gap-2">
                          <span>Fee:</span>
                          <span className="truncate text-[#E8E5DF]">
                            {item.applicationFee}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-4 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => toggleLatestUpdatePublished(item.id)}
                    className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
                      item.published ? 'text-emerald-400' : 'text-[#85838A]'
                    }`}
                  >
                    {item.published ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                    <span>{item.published ? 'Live' : 'Draft'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-[#E8E5DF] hover:bg-white/[0.06] transition-colors cursor-pointer"
                      title="Edit Update"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete "${item.title}"?`)) {
                          if (item.posterImage) {
                            void deleteStorageFileByUrl(item.posterImage);
                          }
                          deleteLatestUpdate(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
      </CmsSurfaceCard>

      <CmsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Latest Update' : 'Publish Latest Update'}
        subtitle="Published entries update the public Latest Updates door immediately."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[#E8E5DF] mb-1.5">
              Announcement / Exam Title *
            </label>
            <input
              required
              type="text"
              placeholder="e.g., SSC CGL 2026 Online Application"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#E8E5DF] mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as UpdateCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#E8E5DF] mb-1.5">
                Status Badge
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UpdateStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
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
            <label className="block font-medium text-[#E8E5DF] mb-1.5">
              Short Summary *
            </label>
            <textarea
              required
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#101014] border border-white/[0.07]">
            <div>
              <label className="block text-[10px] font-mono text-[#85838A] mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#85838A] mb-1">
                Last Date
              </label>
              <input
                type="date"
                value={lastDate}
                onChange={(e) => setLastDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-[#85838A] mb-1">
                Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#E8E5DF] mb-1.5">
                Qualification Eligibility
              </label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#E8E5DF] mb-1.5">
                Application Fee Note
              </label>
              <input
                type="text"
                value={applicationFee}
                onChange={(e) => setApplicationFee(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#E8E5DF] mb-1.5">
              Official Notification URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={officialLink}
              onChange={(e) => setOfficialLink(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] font-mono text-[#E8E5DF] outline-none"
            />
          </div>

          <CmsMediaField
            label="Notification Poster (Optional)"
            value={posterImage}
            onChange={(url) => setPosterImage(url)}
            onRemove={(prev) => {
              void deleteStorageFileByUrl(prev);
            }}
            bucket="update-posters"
            folder="updates"
            aspectClass="aspect-video max-w-sm"
            onError={(msg) => showToast('Poster Upload Failed', msg, 'error')}
          />

          <CmsToggle
            checked={published}
            onChange={setPublished}
            label="Publish Immediately"
            description="Visible on the public Latest Updates door."
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.07]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#101014] border border-white/[0.08] text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] font-semibold cursor-pointer"
            >
              {editingItem ? 'Save Changes' : 'Publish Update'}
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
};
