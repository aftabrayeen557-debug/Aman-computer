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
  const { serviceModalOpen, setServiceModalOpen, editingService, setEditingService, addService, updateService } = useAdmin();

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
      setImage(editingService.image);
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
      setImage('https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80');
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
        image,
        whatsappMessageTemplate: whatsappTemplate,
      });
    } else {
      addService({
        title,
        category,
        shortDescription: shortDesc,
        fullDescription: fullDesc,
        iconName: 'Layers',
        image: image || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[90vh] rounded-2xl bg-[#F0ECE9] dark:bg-[#1A1818] border border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.2)] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(107,92,92,0.15)] dark:bg-[rgba(196,176,176,0.1)] flex items-center justify-center text-[#6B5C5C] dark:text-[#C4B0B0]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1818] dark:text-[#E8E4E0]">
                {editingService ? 'Edit Aman Computer Service' : 'Add New Service'}
              </h3>
              <p className="text-xs text-[#857878] dark:text-[#B5A8A8]">
                Configure catalog offering, pricing and direct WhatsApp message template
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setServiceModalOpen(false);
              setEditingService(null);
            }}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#857878] dark:text-[#B5A8A8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
              Service Title *
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Online Job Forms & Exam Registrations"
              className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden focus:border-[#1A1818] dark:focus:border-[#E8E4E0]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                Turn Around Time (TAT)
              </label>
              <input
                type="text"
                value={tat}
                onChange={(e) => setTat(e.target.value)}
                placeholder="e.g. 15 Mins / Same Day"
                className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                Price Starting At
              </label>
              <input
                type="text"
                value={priceStartingAt}
                onChange={(e) => setPriceStartingAt(e.target.value)}
                placeholder="e.g. ₹50 / ₹2 per page"
                className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
              Short Description (Card Summary)
            </label>
            <textarea
              rows={2}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Crisp 1-2 line description for customer cards..."
              className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
              WhatsApp Pre-filled Customer Message
            </label>
            <input
              type="text"
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              placeholder="e.g. Hello Aman Computer, I need help applying for..."
              className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
            />
          </div>

          {/* Visibility & Spotlight Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0]">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                className="w-4 h-4 rounded text-[#1A1818] focus:ring-0"
              />
              <span>Visible on Website</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0]">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Featured on Homepage
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.1)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setServiceModalOpen(false);
                setEditingService(null);
              }}
              className="px-4 py-2 rounded-xl border border-[rgba(196,176,176,0.4)] text-xs font-semibold text-[#857878] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1A1818] hover:bg-[#302A2A] dark:bg-[#E8E4E0] dark:hover:bg-white text-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold shadow-xs"
            >
              {editingService ? 'Save Service' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
