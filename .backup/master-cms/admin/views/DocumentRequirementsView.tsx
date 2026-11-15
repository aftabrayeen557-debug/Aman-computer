import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { DocumentRequirementItem } from '../types';
import {
  Plus,
  Trash2,
  Edit2,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Search,
  AlertCircle,
  ListOrdered,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const DocumentRequirementsView: React.FC = () => {
  const {
    docRequirements,
    addDocRequirement,
    updateDocRequirement,
    deleteDocRequirement,
    toggleDocRequirementPublished,
    showToast,
  } = useAdmin();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
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

  const categories = ['Identity & Cards', 'Government Forms', 'Travel & Ticketing', 'Financial & Banking', 'Certificates & Legal', 'Other Services'];

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
      requiredDocuments: item.requiredDocuments.length > 0 ? [...item.requiredDocuments] : [''],
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
      showToast('Validation Error', 'At least one required document item is mandatory', 'error');
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
      item.requiredDocuments.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.importantNote && item.importantNote.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && item.published) ||
      (filterStatus === 'draft' && !item.published);

    return matchSearch && matchCategory && matchStatus;
  });

  const publishedCount = docRequirements.filter((d) => d.published).length;
  const draftCount = docRequirements.filter((d) => !d.published).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-xl border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 bg-[#E4DFDA] dark:bg-[#201D1D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[#6B5C5C] dark:text-[#A89898]">
            <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Door 1 — Documents Need Checklist
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2E2828] dark:text-[#E8E4E0] mt-1">
            Document Requirements Cards
          </h2>
          <p className="text-xs text-[#6B5C5C] dark:text-[#A89898] mt-0.5">
            Every entry here dynamically creates <strong className="text-[#2E2828] dark:text-[#E8E4E0]">exactly ONE card</strong> on the public <strong className="text-[#2E2828] dark:text-[#E8E4E0]">Documents Need</strong> door with a numbered list of mandatory documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/app-developer/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-xs font-medium text-[#2E2828] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <span>Preview Door 1</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold tracking-wide hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Requirement Card
          </button>
        </div>
      </div>

      {/* Controls Bar: Stats, Search & Filters */}
      <div className="p-4 rounded-xl border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 bg-[#E4DFDA] dark:bg-[#201D1D] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#DFDAD5] dark:bg-[#1A1818] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="font-bold text-[#2E2828] dark:text-[#E8E4E0]">{publishedCount}</span>
            <span className="text-[#6B5C5C] dark:text-[#A89898]">Live Cards on Door 1</span>
          </div>
          {draftCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#DFDAD5] dark:bg-[#1A1818] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-neutral-400 inline-block" />
              <span className="font-bold text-[#2E2828] dark:text-[#E8E4E0]">{draftCount}</span>
              <span className="text-[#6B5C5C] dark:text-[#A89898]">Drafts (Hidden)</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F7E7E]" />
            <input
              type="text"
              placeholder="Search service or documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none w-full sm:w-56"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-[#6B5C5C]/25 dark:border-[#C4B0B0]/25 bg-[#DFDAD5]/50 dark:bg-[#201D1D]/50">
            <Layers className="w-8 h-8 mx-auto text-[#8F7E7E] mb-2" />
            <p className="text-sm font-semibold text-[#2E2828] dark:text-[#E8E4E0]">No document requirements found</p>
            <p className="text-xs text-[#6B5C5C] dark:text-[#A89898] mt-1">
              {docRequirements.length === 0
                ? 'Door 1 currently displays "No Document Requirements Available". Click "Add Requirement Card" to create one.'
                : 'Try adjusting your search query or filters.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`p-5 rounded-xl border transition-all bg-[#DFDAD5] dark:bg-[#201D1D] shadow-sm flex flex-col md:flex-row items-start justify-between gap-4 ${
                item.published
                  ? 'border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20'
                  : 'border-dashed border-neutral-400/40 opacity-70'
              }`}
            >
              {/* Card Badge & Title */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#6B5C5C]/15 dark:bg-[#C4B0B0]/15 text-[#2E2828] dark:text-[#E8E4E0]">
                    Card #{index + 1}
                  </span>
                  {item.category && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-200 dark:bg-neutral-800 text-[#6B5C5C] dark:text-[#A89898]">
                      {item.category}
                    </span>
                  )}
                  {item.published ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20">
                      LIVE ON DOOR 1
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-400/20 text-neutral-600 dark:text-neutral-400 border border-neutral-400/30">
                      DRAFT (HIDDEN)
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-[#2E2828] dark:text-[#E8E4E0] tracking-tight">
                  {item.serviceTitle}
                </h3>

                {/* Numbered Documents List */}
                <div className="pt-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#A4552C] dark:text-[#D9C6C6] mb-1.5 flex items-center gap-1">
                    <ListOrdered className="w-3.5 h-3.5" />
                    Required Documents ({item.requiredDocuments.length})
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-[#2E2828] dark:text-[#E8E4E0]/90 pl-1">
                    {item.requiredDocuments.map((doc, docIdx) => (
                      <li key={docIdx} className="leading-relaxed">
                        <span className="ml-1">{doc}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Optional Note */}
                {item.importantNote && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Important Note:</strong> {item.importantNote}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {/* Publish / Draft Toggle */}
                <button
                  onClick={() => toggleDocRequirementPublished(item.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    item.published
                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-500/25'
                      : 'bg-neutral-400/20 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-400/30'
                  }`}
                  title={item.published ? 'Visible on Door 1. Click to hide.' : 'Draft only. Click to publish.'}
                >
                  {item.published ? (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Published
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Draft
                    </>
                  )}
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded text-[#6B5C5C] dark:text-[#A89898] hover:text-[#2E2828] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  title="Edit entry"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    if (confirm(`Delete requirement card for "${item.serviceTitle}"?`)) {
                      deleteDocRequirement(item.id);
                    }
                  }}
                  className="p-1.5 rounded text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===================== ADD / EDIT MODAL ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#E4DFDA] dark:bg-[#201D1D] rounded-xl border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 max-w-2xl w-full p-6 shadow-2xl animate-in fade-in duration-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15">
              <h3 className="text-base font-bold text-[#2E2828] dark:text-[#E8E4E0]">
                {editingId ? 'Edit Document Requirement Card' : 'Create New Document Requirement Card'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-mono text-[#6B5C5C] dark:text-[#A89898] hover:text-[#2E2828] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Service Title */}
              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Service Title * (Large and bold on card)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AADHAAR CORRECTION or NEW PAN CARD"
                  value={formData.serviceTitle}
                  onChange={(e) => setFormData({ ...formData, serviceTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none font-semibold text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Required Documents Dynamic List */}
              <div className="space-y-2 p-3.5 rounded-lg bg-[#DFDAD5]/60 dark:bg-[#1A1818]/60 border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#2E2828] dark:text-[#E8E4E0] flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Required Documents List * (Numbered 1, 2, 3...)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddDocItem}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Document
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.requiredDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-center font-mono font-bold text-xs text-[#A4552C] dark:text-[#D9C6C6]">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        required={idx === 0}
                        placeholder={`Document item #${idx + 1} (e.g. Aadhaar Card)`}
                        value={doc}
                        onChange={(e) => handleDocItemChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded bg-[#E4DFDA] dark:bg-[#201D1D] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDocItem(idx)}
                        className="p-1 text-red-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Important Note */}
              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Important Note (Optional — will be hidden if empty)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Physical presence of cardholder required for biometric scanning."
                  value={formData.importantNote}
                  onChange={(e) => setFormData({ ...formData, importantNote: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none text-xs"
                />
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="docPublished"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <label htmlFor="docPublished" className="text-xs text-[#2E2828] dark:text-[#E8E4E0] cursor-pointer">
                  <strong>Publish immediately</strong> to public Documents Need door (Uncheck to save as draft)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#6B5C5C] dark:text-[#A89898] hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Publish Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
