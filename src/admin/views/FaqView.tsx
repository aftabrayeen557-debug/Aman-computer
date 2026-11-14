import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { FaqItem } from '../types';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff, 
  Edit3, 
  Search 
} from 'lucide-react';

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
      {/* Header */}
      <div className="p-6 rounded-xl border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 bg-[#E4DFDA] dark:bg-[#201D1D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[#6B5C5C] dark:text-[#A89898]">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Knowledge Base & Customer Guidance
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2E2828] dark:text-[#E8E4E0] mt-1">
            FAQ Management
          </h2>
          <p className="text-xs text-[#6B5C5C] dark:text-[#A89898] mt-0.5">
            Answer common customer questions regarding document requirements, turnaround times, and cyber counter procedures.
          </p>
        </div>

        <button
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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold tracking-wide hover:opacity-90 transition-opacity shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add FAQ Item
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5C5C] dark:text-[#A89898]" />
        <input
          type="text"
          placeholder="Search question, answer or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#201D1D] border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 text-xs text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* FAQs Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <div
              key={faq.id}
              className={`rounded-xl border transition-all overflow-hidden bg-[#DFDAD5] dark:bg-[#201D1D] shadow-sm ${
                faq.visible
                  ? 'border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15'
                  : 'border-dashed border-red-500/30 opacity-70'
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 w-6 h-6 rounded bg-[#E4DFDA] dark:bg-[#252222] font-mono text-[10px] flex items-center justify-center font-bold text-[#6B5C5C] dark:text-[#A89898]">
                    #{faq.displayOrder}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-[#2E2828] dark:text-[#E8E4E0] truncate">
                        {faq.question}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B5C5C] dark:text-[#A89898]">
                      {faq.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFaqVisibility(faq.id);
                    }}
                    title={faq.visible ? 'Hide from website' : 'Make visible'}
                    className="p-1 rounded text-[#6B5C5C] dark:text-[#A89898] hover:text-[#2E2828] dark:hover:text-[#E8E4E0] cursor-pointer"
                  >
                    {faq.visible ? <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(faq);
                    }}
                    className="p-1 rounded text-[#6B5C5C] dark:text-[#A89898] hover:text-[#2E2828] dark:hover:text-[#E8E4E0] cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete this FAQ?`)) deleteFaq(faq.id);
                    }}
                    className="p-1 rounded text-red-400 hover:text-red-500 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#6B5C5C] dark:text-[#A89898]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B5C5C] dark:text-[#A89898]" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[#6B5C5C]/10 dark:border-[#C4B0B0]/10 text-xs text-[#2E2828] dark:text-[#E8E4E0] leading-relaxed bg-[#E4DFDA]/40 dark:bg-[#1A1818]/40">
                  <div className="font-mono text-[10px] text-[#6B5C5C] dark:text-[#A89898] mb-1 uppercase tracking-wider">
                    Published Answer:
                  </div>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="p-8 text-center text-xs text-[#6B5C5C] dark:text-[#A89898] rounded-xl border border-dashed border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20">
            No FAQ entries found matching "{searchQuery}".
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E4DFDA] dark:bg-[#201D1D] rounded-xl border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 max-w-lg w-full p-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15">
              <h3 className="text-base font-bold text-[#2E2828] dark:text-[#E8E4E0]">
                {editingItem ? 'Edit FAQ Item' : 'Add New FAQ'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs font-mono text-[#6B5C5C] dark:text-[#A89898] hover:text-[#2E2828] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Can I apply for a Tatkal train ticket at your counter?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                  >
                    <option value="General Enquiries">General Enquiries</option>
                    <option value="Document Requirements">Document Requirements</option>
                    <option value="Govt Exam Registrations">Govt Exam Registrations</option>
                    <option value="Printing & Photo Services">Printing & Photo Services</option>
                    <option value="Travel & Railway Ticketing">Travel & Railway Ticketing</option>
                    <option value="Banking & Cash Withdrawal">Banking & Cash Withdrawal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Detailed Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide an exact, step-by-step answer including required documents, counter timings, and fees..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="faqVisible"
                  checked={formData.visible}
                  onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                  className="rounded text-amber-600"
                />
                <label htmlFor="faqVisible" className="text-xs text-[#2E2828] dark:text-[#E8E4E0] cursor-pointer">
                  Visible on public website FAQ section
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#6B5C5C] dark:text-[#A89898] hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Publish FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
