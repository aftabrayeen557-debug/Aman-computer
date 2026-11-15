import React, { useState } from 'react';
import {
  Copy,
  ExternalLink,
  FileCode,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { MediaAsset } from '../types';
import { deleteStorageFileByUrl, uploadFileToStorage } from '../services/storageService';
import { CmsModal, CmsPageHeader, CmsSurfaceCard } from '../components/CmsPrimitives';

export const MediaLibraryView: React.FC = () => {
  const { mediaAssets, addMediaAsset, deleteMediaAsset, showToast } = useAdmin();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    fileType: 'image' | 'pdf' | 'doc';
    fileSize: string;
    url: string;
    category: 'banner' | 'logo' | 'document-template' | 'gallery';
  }>({
    name: '',
    fileType: 'pdf',
    fileSize: '420 KB',
    url: '',
    category: 'document-template',
  });

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const res = await uploadFileToStorage('media-library', file, formData.category, 'any');
      if (!res.success || !res.url) {
        showToast(
          'Upload Failed',
          res.error || "We couldn't upload this file right now.",
          'error'
        );
        return;
      }
      const detectedType: 'image' | 'pdf' | 'doc' = file.type.startsWith('image/')
        ? 'image'
        : file.type === 'application/pdf'
        ? 'pdf'
        : 'doc';

      setFormData((prev) => ({
        ...prev,
        name: prev.name || file.name,
        fileType: detectedType,
        fileSize: res.fileSize || prev.fileSize,
        url: res.url!,
      }));
      showToast('File Uploaded', 'Your file has been saved to media storage.');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const categories = ['all', 'document-template', 'banner', 'logo', 'gallery'];

  const filtered = mediaAssets.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Link Copied', 'Direct asset URL copied to clipboard', 'info');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) {
      showToast('Validation Error', 'Name and URL are required', 'error');
      return;
    }
    addMediaAsset(formData);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      fileType: 'pdf',
      fileSize: '420 KB',
      url: '',
      category: 'document-template',
    });
  };

  const getFileIcon = (fileType: MediaAsset['fileType']) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-[#C9A96E]" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-400" />;
      case 'doc':
      default:
        return <FileCode className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Media & Assets"
        title="Media Library"
        description="Manage uploaded images, downloadable government application PDFs, affidavit templates, and brand assets."
        actions={
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Asset / Form</span>
          </button>
        }
      />

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors capitalize whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#211B16] border border-[#C9A96E]/40 text-[#DFC492]'
                : 'bg-[#141419] border border-white/[0.07] text-[#85838A] hover:text-[#E8E5DF]'
            }`}
          >
            {cat === 'all' ? 'All Assets' : cat.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {filtered.length === 0 ? (
        <CmsSurfaceCard className="text-center py-12 border-dashed border-white/[0.12]">
          <FolderOpen className="w-10 h-10 mx-auto text-[#C9A96E]/70 mb-3" />
          <h3 className="font-editorial text-xl text-[#E8E5DF] mb-1">
            No Assets in This Category
          </h3>
          <p className="text-xs text-[#85838A] max-w-sm mx-auto">
            Upload photos, logos, or printable forms to manage them from your Media Library.
          </p>
        </CmsSurfaceCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-white/[0.07] bg-[#141419] flex flex-col justify-between hover:border-[#C9A96E]/35 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#101014] border border-white/[0.08] flex items-center justify-center overflow-hidden">
                    {item.fileType === 'image' && item.url ? (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getFileIcon(item.fileType)
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item.url)}
                      className="p-1.5 rounded-lg text-[#85838A] hover:text-[#E8E5DF] hover:bg-white/[0.05] cursor-pointer"
                      title="Copy direct URL"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-[#85838A] hover:text-[#E8E5DF] hover:bg-white/[0.05]"
                      title="Open link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete "${item.name}"?`)) {
                          if (item.url) void deleteStorageFileByUrl(item.url);
                          deleteMediaAsset(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-medium text-xs text-[#E8E5DF] line-clamp-1">{item.name}</h4>

                <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-[#85838A]">
                  <span className="px-1.5 py-0.5 rounded bg-[#0A0A0E] border border-white/[0.06] uppercase text-[#C9A96E]">
                    {item.fileType}
                  </span>
                  <span>{item.fileSize}</span>
                  <span>·</span>
                  <span>{item.uploadedDate}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#85838A]">
                <span className="font-mono capitalize">{item.category.replace('-', ' ')}</span>
                <button
                  type="button"
                  onClick={() => handleCopyLink(item.url)}
                  className="text-xs font-medium text-[#C9A96E] hover:text-[#DFC492] cursor-pointer"
                >
                  Copy Link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <CmsModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Document / Media Asset"
        subtitle="Upload files or register a direct HTTPS asset URL"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[#E8E5DF] mb-1.5">
              Asset Title / Form Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Form 49A PAN Application Blank Format"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#E8E5DF] mb-1.5">File Type</label>
              <select
                value={formData.fileType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fileType: e.target.value as 'image' | 'pdf' | 'doc',
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              >
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="image">Image (.jpg / .png)</option>
                <option value="doc">Word / Text Form (.docx)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#E8E5DF] mb-1.5">Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as
                      | 'banner'
                      | 'logo'
                      | 'document-template'
                      | 'gallery',
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60 capitalize"
              >
                <option value="document-template">Document Template</option>
                <option value="banner">Banner</option>
                <option value="logo">Logo / Seal</option>
                <option value="gallery">Gallery Photo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#E8E5DF] mb-1.5">File Size</label>
              <input
                type="text"
                value={formData.fileSize}
                onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] font-mono text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
              />
            </div>

            <div>
              <label className="block font-medium text-[#E8E5DF] mb-1.5">
                Upload File or URL *
              </label>
              <div className="space-y-2">
                <label className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#211B16] border border-[#C9A96E]/35 text-[#DFC492] font-medium cursor-pointer hover:border-[#C9A96E]/65">
                  {uploadingFile ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A96E]" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-[#C9A96E]" />
                  )}
                  <span>{uploadingFile ? 'Uploading…' : 'Choose File'}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={handleFilePick}
                    disabled={uploadingFile}
                    className="hidden"
                  />
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60 font-mono text-[10px]"
                />
              </div>
            </div>
          </div>

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
              Register Asset
            </button>
          </div>
        </form>
      </CmsModal>
    </div>
  );
};
