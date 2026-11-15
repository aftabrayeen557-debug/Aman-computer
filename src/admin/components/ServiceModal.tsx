import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ServiceCategory } from '../types';
import { X, Layers, Sparkles } from 'lucide-react';

const CATEGORIES: ServiceCategory[] = [
  'Government Forms',
  'Identity & Cards',
  'Printing & Documents',
  'Financial & Banking',
  'Travel & Ticketing',
  'Computer & Design',
];

export const ServiceModal: React.FC = () => {
  const {
    serviceModalOpen,
    setServiceModalOpen,
    editingService,
    setEditingService,
    addService,
    updateService,
  } = useAdmin();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Government Forms');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [priceStartingAt, setPriceStartingAt] = useState('₹50');
  const [tat, setTat] = useState('15 Mins');
  const [featured, setFeatured] = useState(false);
  const [visible, setVisible] = useState(true);
  const [image, setImage] = useState('');
  const [whatsappTemplate, setWhatsappTemplate] = useState('');

  useEffect(() => {
    if (editingService) {
      setTitle(editingService.title);
      setCategory(editingService.category);
      setShortDesc(editingService.shortDescription);
      setFullDesc(editingService.fullDescription);
      setPriceStartingAt(editingService.priceStartingAt);
      setTat(editingService.tat);
      setFeatured(editingService.featured);
      setVisible(editingService.visible);
      setImage(editingService.image || '');
      setWhatsappTemplate(editingService.whatsappMessageTemplate);
    } else {
      setTitle('');
      setCategory('Government Forms');
      setShortDesc('');
      setFullDesc('');
      setPriceStartingAt('₹50');
      setTat('15 Mins');
      setFeatured(false);
      setVisible(true);
      setImage('');
      setWhatsappTemplate('Hello Aman Computer, I need information regarding this service.');
    }
  }, [editingService, serviceModalOpen]);

  if (!serviceModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingService) {
      updateService(editingService.id, {
        title,
        category,
        shortDescription: shortDesc,
        fullDescription: fullDesc,
        priceStartingAt,
        tat,
        featured,
        visible,
        image: image.trim(),
        whatsappMessageTemplate: whatsappTemplate,
      });
    } else {
      addService({
        title,
        category,
        shortDescription: shortDesc,
        fullDescription: fullDesc,
        iconName: 'Layers',
        image: image.trim(),
        priceStartingAt,
        tat,
        featured,
        displayOrder: 99,
        visible,
        whatsappMessageTemplate: whatsappTemplate,
        requirements: ['Standard Identity Proof', 'Passport Photo', 'Supporting Documents'],
      });
    }

    setServiceModalOpen(false);
    setEditingService(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className="w-full max-w-xl max-h-[90vh] rounded-2xl bg-[#141419] border border-[#C9A96E]/25 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#211B16] border border-[#C9A96E]/30 flex items-center justify-center text-[#C9A96E]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-medium text-[#E8E5DF]">
                {editingService ? 'Edit Aman Computer Service' : 'Add New Service'}
              </h3>
              <p className="text-xs text-[#85838A]">
                Configure offering details, pricing, and direct WhatsApp message template
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setServiceModalOpen(false);
              setEditingService(null);
            }}
            className="p-1.5 rounded-lg hover:bg-white/[0.05] text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 admin-studio-scroll">
          <div>
            <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
              Service Title *
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Online Job Forms & Exam Registrations"
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                Turn Around Time (TAT)
              </label>
              <input
                type="text"
                value={tat}
                onChange={(e) => setTat(e.target.value)}
                placeholder="e.g. 15 Mins / Same Day"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                Price Starting At
              </label>
              <input
                type="text"
                value={priceStartingAt}
                onChange={(e) => setPriceStartingAt(e.target.value)}
                placeholder="e.g. ₹50 / ₹2 per page"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                Cover Image URL (Optional)
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
              Short Description (Card Summary)
            </label>
            <textarea
              rows={2}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Crisp 1-2 line description for customer cards..."
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
              WhatsApp Pre-filled Customer Message
            </label>
            <input
              type="text"
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              placeholder="e.g. Hello Aman Computer, I need help applying for..."
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#E8E5DF]">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                className="w-4 h-4 accent-[#C9A96E]"
              />
              <span>Visible on Website</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#E8E5DF]">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#C9A96E]"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
                Featured on Homepage
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-white/[0.07] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setServiceModalOpen(false);
                setEditingService(null);
              }}
              className="px-4 py-2 rounded-xl border border-white/[0.1] text-xs font-medium text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
            >
              {editingService ? 'Save Service' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
