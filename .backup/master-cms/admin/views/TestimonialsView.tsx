import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { 
  MessageSquareQuote, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  User, 
  MapPin, 
  Calendar 
} from 'lucide-react';

export const TestimonialsView: React.FC = () => {
  const { testimonials, approveTestimonial, deleteTestimonial, addTestimonial, showToast } = useAdmin();
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    location: '',
    serviceName: 'Online Job Forms & Exam Registrations',
    rating: 5,
    comment: '',
    verified: true,
    approved: true,
  });

  const filtered = testimonials.filter((t) => {
    if (filter === 'approved') return t.approved;
    if (filter === 'pending') return !t.approved;
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.comment.trim()) {
      showToast('Validation Error', 'Name and review text are required', 'error');
      return;
    }
    addTestimonial(formData);
    setIsAddModalOpen(false);
    setFormData({
      customerName: '',
      location: '',
      serviceName: 'Online Job Forms & Exam Registrations',
      rating: 5,
      comment: '',
      verified: true,
      approved: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 bg-[#E4DFDA] dark:bg-[#201D1D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[#6B5C5C] dark:text-[#A89898]">
            <MessageSquareQuote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Social Proof & Customer Feedback
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2E2828] dark:text-[#E8E4E0] mt-1">
            Testimonials & Reviews
          </h2>
          <p className="text-xs text-[#6B5C5C] dark:text-[#A89898] mt-0.5">
            Audit, verify, and feature real customer experiences from counter patrons across job forms, passport seva, and ticketing.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold tracking-wide hover:opacity-90 transition-opacity shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Feedback
        </button>
      </div>

      {/* Tabs / Filter */}
      <div className="flex items-center gap-2 border-b border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
            filter === 'all'
              ? 'bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
              : 'bg-[#DFDAD5] dark:bg-[#252222] text-[#6B5C5C] dark:text-[#A89898]'
          }`}
        >
          All Reviews ({testimonials.length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
            filter === 'approved'
              ? 'bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
              : 'bg-[#DFDAD5] dark:bg-[#252222] text-[#6B5C5C] dark:text-[#A89898]'
          }`}
        >
          Approved & Published ({testimonials.filter((t) => t.approved).length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
            filter === 'pending'
              ? 'bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
              : 'bg-[#DFDAD5] dark:bg-[#252222] text-[#6B5C5C] dark:text-[#A89898]'
          }`}
        >
          Pending Review ({testimonials.filter((t) => !t.approved).length})
        </button>
      </div>

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-xl border transition-all bg-[#DFDAD5] dark:bg-[#201D1D] shadow-sm flex flex-col justify-between ${
              item.approved
                ? 'border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15'
                : 'border-amber-500/40 bg-amber-500/5'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#D5CFC9] dark:bg-[#2A2626] border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 flex items-center justify-center font-bold text-xs text-[#2E2828] dark:text-[#E8E4E0]">
                    {item.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-[#2E2828] dark:text-[#E8E4E0]">
                        {item.customerName}
                      </span>
                      {item.verified && (
                        <span title="Verified Customer">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#6B5C5C] dark:text-[#A89898]">
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.location}
                        </span>
                      )}
                      <span>•</span>
                      <span className="font-mono text-[10px]">{item.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < item.rating ? 'fill-current' : 'opacity-30'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-[#E4DFDA] dark:bg-[#252222] text-[#6B5C5C] dark:text-[#A89898] mb-2.5">
                Service: {item.serviceName}
              </div>

              <p className="text-xs text-[#2E2828] dark:text-[#E8E4E0] italic leading-relaxed">
                "{item.comment}"
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#6B5C5C]/10 dark:border-[#C4B0B0]/10 flex items-center justify-between text-xs">
              <span
                className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                  item.approved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {item.approved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Published
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" /> Hidden / Pending
                  </>
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => approveTestimonial(item.id)}
                  className="px-2.5 py-1 rounded text-xs font-medium bg-[#E4DFDA] dark:bg-[#2A2626] text-[#2E2828] dark:text-[#E8E4E0] hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {item.approved ? 'Unpublish' : 'Approve & Publish'}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete feedback from "${item.customerName}"?`)) {
                      deleteTestimonial(item.id);
                    }
                  }}
                  className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                  title="Delete review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E4DFDA] dark:bg-[#201D1D] rounded-xl border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15">
              <h3 className="text-base font-bold text-[#2E2828] dark:text-[#E8E4E0]">
                Add Customer Feedback
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs font-mono text-[#6B5C5C] dark:text-[#A89898] hover:text-[#2E2828] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Verma"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                    Location / Village
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ward 4, Station Rd"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                    Star Rating (1-5)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                    <option value="2">⭐⭐ (2/5)</option>
                    <option value="1">⭐ (1/5)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Service Rendered
                </label>
                <input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Customer Review Comment *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What did the customer say about our prompt service, printing clarity, or counter assistance..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="rounded text-amber-600"
                  />
                  <span className="text-xs text-[#2E2828] dark:text-[#E8E4E0]">Mark as Verified Customer</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.approved}
                    onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                    className="rounded text-amber-600"
                  />
                  <span className="text-xs text-[#2E2828] dark:text-[#E8E4E0]">Publish Immediately</span>
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
                  Add Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
