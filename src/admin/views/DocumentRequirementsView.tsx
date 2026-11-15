import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { DocumentRequirementItem } from '../types';
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Search,
  AlertCircle,
  ListOrdered,
  Layers,
  ExternalLink,
} from 'lucide-react';
import {
  CmsModal,
  CmsPageHeader,
  CmsSurfaceCard,
  CmsToggle,
} from '../components/CmsPrimitives';

const CATEGORIES = [
  'Identity & Cards',
  'Government Forms',
  'Travel & Ticketing',
  'Financial & Banking',
  'Certificates & Legal',
  'Other Services',
];

export const DocumentRequirementsView: React.FC = () => {
  const {
    docRequirements,
    addDocRequirement,
    updateDocRequirement,
    deleteDocRequirement,
    toggleDocRequirementPublished,
    showToast,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    serviceTitle: string;
    requiredDocuments: string[];
    importantNote: string;
    category: string;
    published: boolean;
  }>({
    serviceTitle: '',
    requiredDocuments: [''],
    importantNote: '',
    category: 'Identity & Cards',
    published: true,
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      serviceTitle: '',
      requiredDocuments: [''],
      importantNote: '',
      category: 'Identity & Cards',
      published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: DocumentRequirementItem) => {
    setEditingId(item.id);
    setFormData({
      serviceTitle: item.serviceTitle,
      requiredDocuments:
        item.requiredDocuments.length > 0 ? [...item.requiredDocuments] : [''],
      importantNote: item.importantNote || '',
      category: item.category || 'Identity & Cards',
      published: item.published,
    });
    setIsModalOpen(true);
  };

  const handleDocItemChange = (index: number, value: string) => {
    const updated = [...formData.requiredDocuments];
    updated[index] = value;
    setFormData({ ...formData, requiredDocuments: updated });
  };

  const handleAddDocItem = () => {
    setFormData({
      ...formData,
      requiredDocuments: [...formData.requiredDocuments, ''],
    });
  };

  const handleRemoveDocItem = (index: number) => {
    if (formData.requiredDocuments.length <= 1) {
      setFormData({ ...formData, requiredDocuments: [''] });
      return;
    }
    const updated = formData.requiredDocuments.filter((_, i) => i !== index);
    setFormData({ ...formData, requiredDocuments: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = formData.serviceTitle.trim();
    if (!cleanTitle) {
      showToast('Validation Error', 'Service Title is required', 'error');
      return;
    }

    const cleanDocs = formData.requiredDocuments
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    if (cleanDocs.length === 0) {
      showToast(
        'Validation Error',
        'At least one required document item is required',
        'error'
      );
      return;
    }

    const payload = {
      serviceTitle: cleanTitle,
      requiredDocuments: cleanDocs,
      importantNote: formData.importantNote.trim() || undefined,
      category: formData.category,
      published: formData.published,
    };

    if (editingId) {
      updateDocRequirement(editingId, payload);
    } else {
      addDocRequirement(payload);
    }

    setIsModalOpen(false);
  };

  const filteredItems = docRequirements.filter((item) => {
    const matchSearch =
      item.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requiredDocuments.some((d) =>
        d.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (item.importantNote &&
        item.importantNote.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory =
      filterCategory === 'all' || item.category === filterCategory;
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && item.published) ||
      (filterStatus === 'draft' && !item.published);

    return matchSearch && matchCategory && matchStatus;
  });

  const publishedCount = docRequirements.filter((d) => d.published).length;

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Doors Management · Door 2 Checklist"
        title="Documents Needed Checklists"
        description="Define clear numbered document requirements for every citizen service so customers arrive fully prepared."
        actions={
          <>
            <a
              href="/app-developer/"
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
              <span>Add Checklist Card</span>
            </button>
          </>
        }
      />

      <CmsSurfaceCard
        title="Document Checklists"
        subtitle={`${publishedCount} live cards published on the Documents Needed door.`}
        headerRight={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#85838A]" />
              <input
                type="text"
                placeholder="Search service or docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>
        }
      >
        {filteredItems.length === 0 ? (
          <div className="p-10 text-center rounded-xl border border-dashed border-white/[0.1] bg-[#0A0A0E]">
            <Layers className="w-8 h-8 mx-auto text-[#C9A96E]/60 mb-2" />
            <p className="font-editorial text-lg text-[#E8E5DF]">
              No Document Checklists Found
            </p>
            <p className="text-xs text-[#85838A] mt-1">
              Add a checklist card to display required documents cleanly for customers.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`p-5 rounded-xl border transition-all flex flex-col md:flex-row items-start justify-between gap-4 ${
                  item.published
                    ? 'bg-[#101014] border-white/[0.08]'
                    : 'bg-[#0A0A0E] border-dashed border-white/[0.1] opacity-65'
                }`}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#16161B] border border-white/[0.07] text-[#C9A96E]">
                      Card #{index + 1}
                    </span>
                    {item.category && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#16161B] text-[#85838A]">
                        {item.category}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                        item.published
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                          : 'bg-white/[0.05] text-[#85838A]'
                      }`}
                    >
                      {item.published ? 'LIVE' : 'DRAFT'}
                    </span>
                  </div>

                  <h3 className="font-editorial text-lg text-[#E8E5DF]">
                    {item.serviceTitle}
                  </h3>

                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[#C9A96E] mb-1.5 flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5" />
                      Required Documents ({item.requiredDocuments.length})
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-[#E8E5DF]/85 pl-1">
                      {item.requiredDocuments.map((doc, docIdx) => (
                        <li key={docIdx}>{doc}</li>
                      ))}
                    </ol>
                  </div>

                  {item.importantNote && (
                    <div className="mt-2 p-2.5 rounded-lg bg-[#211B16] border border-[#C9A96E]/25 text-xs text-[#DFC492] flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-[#C9A96E] shrink-0 mt-0.5" />
                      <span>
                        <strong>Note:</strong> {item.importantNote}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => toggleDocRequirementPublished(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                      item.published
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                        : 'bg-[#16161B] text-[#85838A] border border-white/[0.08]'
                    }`}
                  >
                    {item.published ? (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Live
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Draft
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-[#E8E5DF] hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete requirement card for "${item.serviceTitle}"?`
                        )
                      ) {
                        deleteDocRequirement(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CmsSurfaceCard>

      <CmsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingId
            ? 'Edit Document Requirement Card'
            : 'Add Document Requirement Card'
        }
        subtitle="Specify the service title and numbered documents customers must bring."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[#E8E5DF] mb-1.5">
              Service Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., PAN Card Correction or New Application"
              value={formData.serviceTitle}
              onChange={(e) =>
                setFormData({ ...formData, serviceTitle: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div>
            <label className="block font-medium text-[#E8E5DF] mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5 p-3.5 rounded-xl bg-[#101014] border border-white/[0.07]">
            <div className="flex items-center justify-between">
              <label className="font-medium text-[#E8E5DF] flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-[#C9A96E]" />
                Required Documents List *
              </label>
              <button
                type="button"
                onClick={handleAddDocItem}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#DFC492] hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {formData.requiredDocuments.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-center font-mono text-xs text-[#C9A96E]">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    required={idx === 0}
                    placeholder={`Document #${idx + 1}`}
                    value={doc}
                    onChange={(e) => handleDocItemChange(idx, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveDocItem(idx)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#E8E5DF] mb-1.5">
              Important Note (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.importantNote}
              onChange={(e) =>
                setFormData({ ...formData, importantNote: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
            />
          </div>

          <CmsToggle
            checked={formData.published}
            onChange={(next) => setFormData({ ...formData, published: next })}
            label="Publish Immediately"
            description="Visible to visitors browsing the Documents Needed door."
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.07]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#101014] border border-white/[0.08] text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] font-semibold cursor-pointer"
            >
              {editingId ? 'Save Changes' : 'Publish Card'}
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
};
