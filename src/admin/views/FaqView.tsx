import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit3, Eye, EyeOff, Plus, Search, Trash2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { FaqItem } from '../types';
import {
  CmsModal,
  CmsPageHeader,
  CmsSurfaceCard,
  CmsToggle,
} from '../components/CmsPrimitives';

export const FaqView: React.FC = () => {
  const { faqs, addFaq, updateFaq, deleteFaq, toggleFaqVisibility, showToast } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(faqs[0]?.id || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General Enquiries',
    displayOrder: faqs.length + 1,
    visible: true,
  });

  const filteredFaqs = faqs.filter((faq) => {
    const q = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q) ||
      faq.category.toLowerCase().includes(q)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      showToast('Validation Error', 'Question and answer are required', 'error');
      return;
    }

    if (editingItem) {
      updateFaq(editingItem.id, formData);
      setEditingItem(null);
    } else {
      addFaq(formData);
    }

    setIsAddModalOpen(false);
    setFormData({
      question: '',
      answer: '',
      category: 'General Enquiries',
      displayOrder: faqs.length + 2,
      visible: true,
    });
  };

  const handleStartEdit = (faq: FaqItem) => {
    setEditingItem(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      displayOrder: faq.displayOrder,
      visible: faq.visible,
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Knowledge Base & Guidance"
        title="FAQ Management"
        description="Answer common customer questions regarding document checklists, turnaround times, and counter procedures."
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setFormData({
                question: '',
                answer: '',
                category: 'General Enquiries',
                displayOrder: faqs.length + 1,
                visible: true,
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add FAQ Item</span>
          </button>
        }
      />

      <CmsSurfaceCard className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85838A]" />
          <input
            type="text"
            placeholder="Search question, answer or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
          />
        </div>
      </CmsSurfaceCard>

      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all overflow-hidden bg-[#141419] ${
                faq.visible
                  ? 'border-white/[0.07]'
                  : 'border-dashed border-rose-500/35 opacity-65'
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.03] transition-colors select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-[#211B16] border border-[#C9A96E]/30 font-mono text-[10px] flex items-center justify-center font-semibold text-[#C9A96E]">
                    #{faq.displayOrder}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-xs sm:text-sm text-[#E8E5DF] truncate">
                      {faq.question}
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#85838A]">
                      {faq.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFaqVisibility(faq.id);
                    }}
                    title={faq.visible ? 'Hide from website' : 'Make visible'}
                    className="p-1.5 rounded-lg border border-white/[0.08] text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
                  >
                    {faq.visible ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-[#DFC492]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(faq);
                    }}
                    className="p-1.5 rounded-lg border border-white/[0.08] text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this FAQ item?')) deleteFaq(faq.id);
                    }}
                    className="p-1.5 rounded-lg border border-rose-500/25 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#85838A]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#85838A]" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-3 border-t border-white/[0.06] text-xs text-[#E8E5DF]/85 leading-relaxed bg-[#101014]">
                  <div className="font-mono text-[10px] text-[#C9A96E] mb-1 uppercase tracking-wider">
                    Published Answer
                  </div>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <CmsSurfaceCard className="text-center py-10 border-dashed border-white/[0.1]">
            <p className="text-xs text-[#85838A]">
              No FAQ entries match &ldquo;{searchQuery}&rdquo;.
            </p>
          </CmsSurfaceCard>
        )}
      </div>

      <CmsModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingItem ? 'Edit FAQ Item' : 'Add New FAQ'}
        subtitle="Configure frequently asked question and counter answer"
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
              Question *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Can I apply for a Tatkal train ticket at your counter?"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              >
                <option value="General Enquiries">General Enquiries</option>
                <option value="Document Requirements">Document Requirements</option>
                <option value="Govt Exam Registrations">Govt Exam Registrations</option>
                <option value="Printing & Photo Services">Printing &amp; Photo Services</option>
                <option value="Travel & Railway Ticketing">Travel &amp; Railway Ticketing</option>
                <option value="Banking & Cash Withdrawal">Banking &amp; Cash Withdrawal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs font-mono text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
              Detailed Answer *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Provide a clear, step-by-step answer including required documents and timings..."
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60 leading-relaxed"
            />
          </div>

          <CmsToggle
            checked={formData.visible}
            onChange={(next) => setFormData({ ...formData, visible: next })}
            label="Visible on Public Website"
            description="Show this FAQ item inside the website guidance section."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.07]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-white/[0.1] text-xs font-medium text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold cursor-pointer"
            >
              {editingItem ? 'Save Changes' : 'Publish FAQ'}
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
};
