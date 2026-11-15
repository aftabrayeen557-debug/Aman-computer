import React, { useState } from 'react';
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
  ExternalLink,
} from 'lucide-react';
import {
  CmsMediaField,
  CmsModal,
  CmsPageHeader,
  CmsSurfaceCard,
  CmsToggle,
} from '../components/CmsPrimitives';
import { deleteStorageFileByUrl } from '../services/storageService';

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
    showToast,
  } = useAdmin();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

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

  const existingCategories = Array.from(
    new Set(gallery.map((g) => g.category?.trim()).filter(Boolean))
  );
  const allCategories = Array.from(
    new Set([...SUGGESTED_CATEGORIES, ...existingCategories])
  );

  const filteredGallery = gallery.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      showToast(
        'Image Required',
        'Please upload a photo or provide an image link.',
        'error'
      );
      return;
    }

    const category =
      formData.category === '__custom__'
        ? formData.customCategory.trim() || 'Aman Computer'
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
      showToast(
        'Image Required',
        'Please upload a photo or provide an image link.',
        'error'
      );
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
      <CmsPageHeader
        eyebrow="Doors Management · Door 4 Photo Gallery"
        title="Center Photo Gallery"
        description="Upload authentic photographs of Aman Computer counters, printing equipment, and completed studio work."
        actions={
          <>
            <a
              href="/graphic-designer/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#101014] border border-white/[0.08] text-xs font-medium text-[#E8E5DF] hover:border-[#C9A96E]/45 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>Preview Gallery Door</span>
            </a>
            <button
              type="button"
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>
          </>
        }
      />

      <CmsSurfaceCard>
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-5 border-b border-white/[0.06]">
          <Filter className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
          <span className="text-xs font-mono text-[#85838A] mr-1">
            Category:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#211B16] text-[#DFC492] border border-[#C9A96E]/35'
                : 'bg-[#101014] text-[#85838A] border border-white/[0.06] hover:text-[#E8E5DF]'
            }`}
          >
            All ({gallery.length})
          </button>
          {allCategories.map((cat) => {
            const count = gallery.filter((g) => g.category === cat).length;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#211B16] text-[#DFC492] border border-[#C9A96E]/35'
                    : 'bg-[#101014] text-[#85838A] border border-white/[0.06] hover:text-[#E8E5DF]'
                }`}
              >
                {cat} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>

        {filteredGallery.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                className={`group rounded-2xl border overflow-hidden bg-[#101014] flex flex-col transition-all ${
                  item.visible
                    ? 'border-white/[0.08] hover:border-[#C9A96E]/40'
                    : 'border-dashed border-rose-500/35 opacity-65'
                }`}
              >
                <div className="relative h-52 w-full bg-[#0A0A0E] overflow-hidden flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt={item.title || item.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/70 text-[#E8E5DF] border border-white/15">
                      {item.category}
                    </span>
                    {!item.visible && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-rose-600/90 text-white">
                        Hidden
                      </span>
                    )}
                    {item.featured && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#C9A96E] text-[#0A0A0E] font-semibold flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" /> Spotlight
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 rounded-lg bg-black/70 text-[#E8E5DF] hover:text-[#DFC492] cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleGalleryFeatured(item.id)}
                      className="p-1.5 rounded-lg bg-black/70 text-[#C9A96E] hover:text-[#DFC492] cursor-pointer"
                      title="Toggle Spotlight"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleGalleryVisibility(item.id)}
                      className="p-1.5 rounded-lg bg-black/70 text-[#E8E5DF] cursor-pointer"
                      title={item.visible ? 'Hide' : 'Show'}
                    >
                      {item.visible ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete this photo from ${item.category}?`
                          )
                        ) {
                          if (item.imageUrl) {
                            void deleteStorageFileByUrl(item.imageUrl);
                          }
                          deleteGalleryItem(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-black/70 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-3 right-3 text-white/80 text-[10px] font-mono flex justify-between">
                    <span>{item.uploadedAt}</span>
                    <span>#{item.displayOrder}</span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-editorial text-lg text-[#E8E5DF] line-clamp-1">
                      {item.title || 'Untitled Photo'}
                    </h3>
                    <p className="text-xs text-[#85838A] mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'No description added.'}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#85838A]">
                    <span>
                      {item.visible ? 'Live on Gallery Door' : 'Hidden Draft'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="text-[#C9A96E] hover:text-[#DFC492] cursor-pointer"
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-xl border border-dashed border-white/[0.1] bg-[#0A0A0E] space-y-3">
            <ImageIcon className="w-9 h-9 mx-auto text-[#C9A96E]/60" />
            <h3 className="font-editorial text-xl text-[#E8E5DF]">
              {gallery.length === 0
                ? 'No Gallery Photos Uploaded'
                : 'No Photos in This Category'}
            </h3>
            <p className="text-xs text-[#85838A] max-w-md mx-auto">
              Upload authentic center photos to display in the public Gallery door.
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload First Photo</span>
            </button>
          </div>
        )}
      </CmsSurfaceCard>

      <CmsModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Upload Gallery Photo"
        subtitle="Photos appear inside the public Gallery door once published."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <CmsMediaField
            label="Photo *"
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            onRemove={(prev) => {
              void deleteStorageFileByUrl(prev);
            }}
            bucket="gallery-images"
            folder="center-gallery"
            aspectClass="aspect-video"
            onError={(msg) => showToast('Upload Failed', msg, 'error')}
          />

          <div>
            <label className="block font-medium text-[#E8E5DF] mb-1.5">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__custom__">+ Create New Category...</option>
            </select>
            {formData.category === '__custom__' && (
              <input
                type="text"
                required
                placeholder="Enter custom category..."
                value={formData.customCategory}
                onChange={(e) =>
                  setFormData({ ...formData, customCategory: e.target.value })
                }
                className="mt-2 w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-[#C9A96E]/50 text-[#E8E5DF] outline-none"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#E8E5DF] mb-1.5">
                Photo Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#E8E5DF] mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    displayOrder: parseInt(e.target.value, 10) || 1,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#E8E5DF] mb-1.5">
              Short Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
            />
          </div>

          <CmsToggle
            checked={formData.visible}
            onChange={(next) => setFormData({ ...formData, visible: next })}
            label="Publish Publicly"
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.07]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#101014] border border-white/[0.08] text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] font-semibold cursor-pointer"
            >
              Save Photo
            </button>
          </div>
        </form>
      </CmsModal>

      <CmsModal
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Edit Gallery Photo"
      >
        {editingItem && (
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <CmsMediaField
              label="Photo"
              value={editingItem.imageUrl}
              onChange={(url) =>
                setEditingItem({ ...editingItem, imageUrl: url })
              }
              onRemove={(prev) => {
                void deleteStorageFileByUrl(prev);
              }}
              bucket="gallery-images"
              folder="center-gallery"
              aspectClass="aspect-video"
              onError={(msg) => showToast('Upload Failed', msg, 'error')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#E8E5DF] mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-[#E8E5DF] mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editingItem.displayOrder}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      displayOrder: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#E8E5DF] mb-1.5">
                Photo Title
              </label>
              <input
                type="text"
                value={editingItem.title}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, title: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#E8E5DF] mb-1.5">
                Short Description
              </label>
              <textarea
                rows={2}
                value={editingItem.description}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    description: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none"
              />
            </div>

            <CmsToggle
              checked={editingItem.visible}
              onChange={(next) =>
                setEditingItem({ ...editingItem, visible: next })
              }
              label="Publish Publicly"
            />

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.07]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl bg-[#101014] border border-white/[0.08] text-[#85838A] hover:text-[#E8E5DF] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] font-semibold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </CmsModal>
    </div>
  );
};
