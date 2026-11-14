import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { MediaAsset } from '../types';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  Copy, 
  Upload, 
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { uploadFileToStorage } from '../services/storageService';

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
        showToast('Upload Failed', res.error || 'Could not upload file to Supabase Storage.', 'error');
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
      showToast('File Uploaded', 'Asset stored in Supabase media-library bucket.');
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
        return <ImageIcon className="w-5 h-5 text-amber-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'doc':
      default:
        return <FileCode className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 bg-[#E4DFDA] dark:bg-[#201D1D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[#6B5C5C] dark:text-[#A89898]">
            <FolderOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Central Documents, PDFs & Banners
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2E2828] dark:text-[#E8E4E0] mt-1">
            Media & Document Library
          </h2>
          <p className="text-xs text-[#6B5C5C] dark:text-[#A89898] mt-0.5">
            Store downloadable government offline application forms, affidavit templates, brand logos, and promotional graphics.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold tracking-wide hover:opacity-90 transition-opacity shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload Asset / Form
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 border-b border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 pb-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors capitalize ${
              selectedCategory === cat
                ? 'bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
                : 'bg-[#DFDAD5] dark:bg-[#252222] text-[#6B5C5C] dark:text-[#A89898]'
            }`}
          >
            {cat === 'all' ? 'All Assets' : cat.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 bg-[#DFDAD5] dark:bg-[#201D1D] shadow-sm flex flex-col justify-between hover:border-[#6B5C5C]/40 dark:hover:border-[#C4B0B0]/40 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#E4DFDA] dark:bg-[#252222] border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 flex items-center justify-center">
                  {getFileIcon(item.fileType)}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyLink(item.url)}
                    className="p-1.5 rounded text-[#6B5C5C] dark:text-[#A89898] hover:text-[#2E2828] dark:hover:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                    title="Copy direct URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded text-[#6B5C5C] dark:text-[#A89898] hover:text-[#2E2828] dark:hover:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5"
                    title="Open link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${item.name}"?`)) deleteMediaAsset(item.id);
                    }}
                    className="p-1.5 rounded text-red-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="font-semibold text-xs text-[#2E2828] dark:text-[#E8E4E0] line-clamp-1">
                {item.name}
              </h4>

              <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-[#8F7E7E] dark:text-[#7A6E6E]">
                <span className="px-1.5 py-0.5 rounded bg-[#E4DFDA] dark:bg-[#252222] uppercase">
                  {item.fileType}
                </span>
                <span>{item.fileSize}</span>
                <span>•</span>
                <span>{item.uploadedDate}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#6B5C5C]/10 dark:border-[#C4B0B0]/10 flex items-center justify-between text-[11px] text-[#6B5C5C] dark:text-[#A89898]">
              <span className="font-mono capitalize">{item.category.replace('-', ' ')}</span>
              <button
                onClick={() => handleCopyLink(item.url)}
                className="text-xs font-medium hover:text-[#2E2828] dark:hover:text-[#E8E4E0] cursor-pointer"
              >
                Copy Link
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#E4DFDA] dark:bg-[#201D1D] rounded-xl border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15">
              <h3 className="text-base font-bold text-[#2E2828] dark:text-[#E8E4E0]">
                Register Document / Media Asset
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
                  Asset Title / Form Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Form 49A PAN Application Blank Format"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                    File Type
                  </label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="image">Image (.jpg / .png)</option>
                    <option value="doc">Word / Text Form (.docx)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none capitalize"
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
                  <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={formData.fileSize}
                    onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2E2828] dark:text-[#E8E4E0] mb-1">
                    Asset File or URL *
                  </label>
                  <div className="space-y-2">
                    <label className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] font-medium cursor-pointer">
                      {uploadingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>{uploadingFile ? 'Uploading...' : 'Upload PDF / Doc / Image'}</span>
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
                      className="w-full px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818] border border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20 text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none font-mono text-[10px]"
                    />
                  </div>
                </div>
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
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
