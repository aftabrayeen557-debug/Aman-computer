import React, { useState, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { GalleryItem } from '../types';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Pencil,
  Eye, 
  EyeOff, 
  Star, 
  Filter, 
  Upload, 
  Loader2,
} from 'lucide-react';
import { uploadFileToStorage } from '../services/storageService';

const SUGGESTED_CATEGORIES = [
  'Aman Computer',
  'Our Services',
  'Office & Infrastructure',
  'Customer Work',
  'Printing & Documentation',
  'Events & Activities',
];

export const GalleryView: React.FC = () => {
  const { 
    gallery, 
    addGalleryItem, 
    updateGalleryItem, 
    deleteGalleryItem, 
    toggleGalleryVisibility, 
    toggleGalleryFeatured, 
    showToast 
  } = useAdmin();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    category: 'Aman Computer',
    customCategory: '',
    imageUrl: '',
    description: '',
    featured: false,
    displayOrder: 1,
    visible: true,
  });

  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Compute all available categories dynamically
  const existingCategories = Array.from(new Set(gallery.map(g => g.category?.trim()).filter(Boolean)));
  const allCategories = Array.from(new Set([...SUGGESTED_CATEGORIES, ...existingCategories]));

  const filteredGallery = gallery.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadFileToStorage('gallery-images', file, 'center-gallery', 'image');
      if (!res.success || !res.url) {
        showToast('Upload Failed', res.error || "We couldn't upload this photo right now.", 'error');
        return;
      }

      if (isEditing && editingItem) {
        setEditingItem({ ...editingItem, imageUrl: res.url });
      } else {
        setFormData((prev) => ({
          ...prev,
          imageUrl: res.url!,
          title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        }));
      }
      showToast('Photo Uploaded', 'Photo saved to media storage.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      showToast('Image Required', 'Please upload a photo or provide an image link.', 'error');
      return;
    }

    const category = formData.category === '__custom__'
      ? (formData.customCategory.trim() || 'Aman Computer')
      : formData.category;

    addGalleryItem({
      title: formData.title.trim(),
      category,
      imageUrl: formData.imageUrl.trim(),
      description: formData.description.trim(),
      featured: formData.featured,
      displayOrder: formData.displayOrder || gallery.length + 1,
      visible: formData.visible,
    });

    setIsAddModalOpen(false);
    setFormData({
      title: '',
      category: 'Aman Computer',
      customCategory: '',
      imageUrl: '',
      description: '',
      featured: false,
      displayOrder: gallery.length + 2,
      visible: true,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.imageUrl.trim()) {
      showToast('Image Required', 'Please upload a photo or provide an image link.', 'error');
      return;
    }

    updateGalleryItem(editingItem.id, {
      title: editingItem.title.trim(),
      category: editingItem.category.trim() || 'Aman Computer',
      imageUrl: editingItem.imageUrl.trim(),
      description: editingItem.description.trim(),
      featured: editingItem.featured,
      displayOrder: editingItem.displayOrder,
      visible: editingItem.visible,
    });

    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-xl border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 bg-[#E4DFDA] dark:bg-[#201D1D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[#6B5C5C] dark:text-[#A89898]">
            <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Aman Computer Photo Showcase
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2E2828] dark:text-[#E8E4E0] mt-1">
            Center Photo Gallery
          </h2>
          <p className="text-xs text-[#6B5C5C] dark:text-[#A89898] mt-0.5">
            Owner-uploaded photographs for the Gallery door. Grouped by category and displayed with horizontal pinned-photo animation.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: '',
              category: 'Aman Computer',
              customCategory: '',
              imageUrl: '',
              description: '',
              featured: false,
              displayOrder: gallery.length + 1,
              visible: true,
            });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold tracking-wide hover:opacity-90 transition-opacity shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Upload New Photo
        </button>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15">
        <Filter className="w-3.5 h-3.5 text-[#6B5C5C] dark:text-[#A89898] shrink-0 ml-1" />
        <span className="text-xs font-medium text-[#6B5C5C] dark:text-[#A89898] mr-2">Category:</span>
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
              : 'bg-[#DFDAD5] dark:bg-[#252222] text-[#6B5C5C] dark:text-[#A89898] hover:text-[#2E2828] dark:hover:text-[#E8E4E0]'
          }`}
        >
          All Photos ({gallery.length})
        </button>
        {allCategories.map((cat) => {
          const count = gallery.filter(g => g.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
                  : 'bg-[#DFDAD5] dark:bg-[#252222] text-[#6B5C5C] dark:text-[#A89898] hover:text-[#2E2828] dark:hover:text-[#E8E4E0]'
              }`}
            >
              {cat} {count > 0 ? `(${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Grid of Gallery Photos */}
      {filteredGallery.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              className={`group rounded-xl border transition-all overflow-hidden bg-[#DFDAD5] dark:bg-[#201D1D] shadow-sm flex flex-col ${
                item.visible
                  ? 'border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 hover:border-[#6B5C5C]/40 dark:hover:border-[#C4B0B0]/40'
                  : 'border-dashed border-red-500/30 opacity-70'
              }`}
            >
              {/* Image Thumbnail Container */}
              <div className="relative h-52 w-full bg-[#D5CFC9] dark:bg-[#181616] overflow-hidden flex items-center justify-center">
                <img
                  src={item.imageUrl}
                  alt={item.title || item.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide bg-black/60 backdrop-blur-sm text-white border border-white/10">
                    {item.category}
                  </span>
                  {!item.visible && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide bg-red-600/90 text-white">
                      Unpublished
                    </span>
                  )}
                  {item.featured && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-wide bg-amber-500/90 text-white flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" /> Spotlight
                    </span>
                  )}
                </div>

                {/* Action Buttons Overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingItem(item)}
                    title="Edit Photo Details"
                    className="p-1.5 rounded-md bg-black/60 text-white/80 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleGalleryVisibility(item.id)}
                    title={item.visible ? 'Unpublish from public website' : 'Publish to public website'}
                    className="p-1.5 rounded-md bg-black/60 text-white/80 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
                  >
                    {item.visible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete this photo from ${item.category}?`)) {
                        deleteGalleryItem(item.id);
                      }
                    }}
                    title="Delete photo"
                    className="p-1.5 rounded-md bg-black/60 text-red-300 hover:text-red-400 hover:bg-black/80 backdrop-blur-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-2 left-3 right-3 text-white text-[11px] font-mono opacity-80 flex justify-between items-center">
                  <span>Uploaded: {item.uploadedAt}</span>
                  <span>#{item.displayOrder}</span>
                </div>
              </div>

              {/* Content Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-[#2E2828] dark:text-[#E8E4E0] tracking-tight line-clamp-1">
                    {item.title || <span className="italic text-[#6B5C5C] dark:text-[#A89898]">Untitled photo</span>}
                  </h3>
                  <p className="text-xs text-[#6B5C5C] dark:text-[#A89898] mt-1 line-clamp-2 leading-relaxed">
                    {item.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#6B5C5C]/10 dark:border-[#C4B0B0]/10 flex items-center justify-between text-xs text-[#8F7E7E] dark:text-[#7A6E6E]">
                  <span className="font-mono text-[11px]">{item.visible ? '● Live on public gallery' : '○ Hidden (Draft)'}</span>
                  <button
                    onClick={() => setEditingItem(item)}
                    className="inline-flex items-center gap-1 hover:text-[#2E2828] dark:hover:text-[#E8E4E0] font-medium transition-colors cursor-pointer"
                  >
                    Edit Photo
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-xl border border-dashed border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 bg-[#E4DFDA]/50 dark:bg-[#201D1D]/50">
          <ImageIcon className="w-10 h-10 mx-auto text-[#6B5C5C] dark:text-[#A89898] opacity-50 mb-3" />
          <h3 className="text-base font-semibold text-[#2E2828] dark:text-[#E8E4E0]">
            {gallery.length === 0 ? 'No Gallery Photos Available' : 'No photos in this category'}
          </h3>
          <p className="text-xs text-[#6B5C5C] dark:text-[#A89898] mt-1 max-w-md mx-auto">
            {gallery.length === 0
              ? 'Upload real photographs of Aman Computer office, printing machines, and client services to showcase in the Gallery door.'
              : 'No photographs uploaded under this category yet.'}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload First Photo
          </button>
        </div>
      )}

      {/* Add Photo Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E4DFDA] dark:bg-[#201D1D] rounded-xl border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15">
              <h3 className="text-base font-bold text-[#2E2828] dark:text-[#E8E4E0] flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Upload Gallery Photo
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs font-mono text-[#6B5C5C] dark:text-[#A89898] hover:text-[#2E2828] dark:hover:text-[#E8E4E0] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {/* Photo Upload Section */}
              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Photo *
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] font-medium flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-60"
                    >
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {uploading ? 'Uploading...' : 'Upload to Cloud'}
                    </button>
                    <input
                      type="text"
                      placeholder="Or paste image URL (https://...)"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] font-mono text-[11px]"
                    />
                  </div>

                  {formData.imageUrl && (
                    <div className="mt-2 relative h-36 rounded-lg overflow-hidden border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 bg-black/10 flex items-center justify-center">
                      <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white rounded text-[10px] font-mono cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Category selection or custom creation */}
              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                >
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__custom__">+ Create New Custom Category...</option>
                </select>

                {formData.category === '__custom__' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter new category name..."
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    className="mt-2 w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-amber-500 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                  />
                )}
              </div>

              {/* Optional Photo Title */}
              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Photo Title <span className="text-[#8F7E7E] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Color Xerox & Lamination Setup"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                />
              </div>

              {/* Optional Description */}
              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Short Description <span className="text-[#8F7E7E] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief details or service description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div className="flex flex-col justify-end space-y-2 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs text-[#2E2828] dark:text-[#E8E4E0]">Publish Publicly</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#6B5C5C] dark:text-[#A89898] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 cursor-pointer"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E4DFDA] dark:bg-[#201D1D] rounded-xl border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15">
              <h3 className="text-base font-bold text-[#2E2828] dark:text-[#E8E4E0] flex items-center gap-2">
                <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Edit Gallery Photo
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-xs font-mono text-[#6B5C5C] dark:text-[#A89898] hover:text-[#2E2828] dark:hover:text-[#E8E4E0] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Photo
                </label>
                <input
                  type="file"
                  ref={editFileInputRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, true)}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => editFileInputRef.current?.click()}
                    className="px-3 py-2 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] font-medium flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-60"
                  >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? 'Uploading...' : 'Replace via Cloud'}
                  </button>
                  <input
                    type="text"
                    value={editingItem.imageUrl}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] font-mono text-[11px]"
                  />
                </div>

                {editingItem.imageUrl && (
                  <div className="mt-2 relative h-36 rounded-lg overflow-hidden border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 bg-black/10 flex items-center justify-center">
                    <img src={editingItem.imageUrl} alt="Preview" className="h-full w-full object-contain" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Photo Title <span className="text-[#8F7E7E] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                  Short Description <span className="text-[#8F7E7E] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingItem.displayOrder}
                    onChange={(e) => setEditingItem({ ...editingItem, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.visible}
                      onChange={(e) => setEditingItem({ ...editingItem, visible: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs text-[#2E2828] dark:text-[#E8E4E0]">Publish Publicly</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#6B5C5C] dark:text-[#A89898] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
