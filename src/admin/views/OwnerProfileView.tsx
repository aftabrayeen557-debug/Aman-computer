import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  Facebook,
  Globe,
  ImagePlus,
  Instagram,
  Link2,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { OwnerCustomLink, OwnerProfile } from '../types';
import {
  calculateOwnerProfileCompletion,
  getOwnerProfileChanges,
  getOwnerProfileInitials,
  validateHttpUrl,
  validateOwnerProfileDraft,
} from '../services/ownerProfileService';
import {
  deleteStorageFileByUrl,
  formatFileSize,
  uploadFileToStorage,
  UploadOptions,
} from '../services/storageService';
import { StudioLoadingState } from '../components/StateViews';
import { ContextualDropZone } from '../components/ContextualDropZone';

const cloneOwnerProfile = (profile: OwnerProfile): OwnerProfile => ({
  ...profile,
  socialLinks: {
    ...profile.socialLinks,
    other: (profile.socialLinks.other || []).map((link) => ({ ...link })),
  },
});

const generateCustomLinkId = () =>
  `link-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const safeHref = (rawUrl: string): string | null => {
  const check = validateHttpUrl(rawUrl, 'Link', { allowRelativeAsset: false });
  if (!check.valid || !check.normalized) return null;
  return check.normalized;
};

export const OwnerProfileView: React.FC = () => {
  const {
    currentUser,
    ownerProfile,
    ownerProfileStatus,
    ownerProfileError,
    updateOwnerProfile,
    refreshOwnerProfile,
    addMediaAsset,
    isSupabaseActive,
    showToast,
  } = useAdmin();

  const [draft, setDraft] = useState<OwnerProfile>(() => cloneOwnerProfile(ownerProfile));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [previewAvatarLoadError, setPreviewAvatarLoadError] = useState(false);

  const syncedSerializedRef = useRef<string>(JSON.stringify(ownerProfile));

  const savedSerialized = useMemo(() => JSON.stringify(ownerProfile), [ownerProfile]);
  const stagedChanges = useMemo(
    () => getOwnerProfileChanges(ownerProfile, draft),
    [ownerProfile, draft]
  );
  const isDirty = stagedChanges.length > 0;

  useEffect(() => {
    if (savedSerialized !== syncedSerializedRef.current) {
      syncedSerializedRef.current = savedSerialized;
      setDraft((prev) => {
        const prevDirty =
          getOwnerProfileChanges(
            JSON.parse(syncedSerializedRef.current) as OwnerProfile,
            prev
          ).length > 0;
        return prevDirty && isDirty ? prev : cloneOwnerProfile(ownerProfile);
      });
    }
  }, [ownerProfile, savedSerialized, isDirty]);

  useEffect(() => {
    setAvatarLoadError(false);
    setPreviewAvatarLoadError(false);
  }, [draft.profileImage, ownerProfile.profileImage]);

  const savedCompletion = useMemo(
    () => calculateOwnerProfileCompletion(ownerProfile),
    [ownerProfile]
  );
  const draftCompletion = useMemo(
    () => calculateOwnerProfileCompletion(draft),
    [draft]
  );

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleFieldChange = <K extends keyof OwnerProfile>(key: K, value: OwnerProfile[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    clearFieldError(String(key));
  };

  const handleSocialChange = (
    key: 'website' | 'linkedin' | 'instagram' | 'facebook',
    value: string
  ) => {
    setDraft((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [key]: value,
      },
    }));
    clearFieldError(key);
  };

  const handleAddCustomLink = () => {
    const newItem: OwnerCustomLink = {
      id: generateCustomLinkId(),
      label: '',
      url: '',
    };
    setDraft((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        other: [...(prev.socialLinks.other || []), newItem],
      },
    }));
  };

  const handleUpdateCustomLink = (
    id: string,
    patch: Partial<Pick<OwnerCustomLink, 'label' | 'url'>>
  ) => {
    setDraft((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        other: (prev.socialLinks.other || []).map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      },
    }));
    clearFieldError(`other.${id}`);
  };

  const handleRemoveCustomLink = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        other: (prev.socialLinks.other || []).filter((item) => item.id !== id),
      },
    }));
    clearFieldError(`other.${id}`);
  };

  const focusTargetInput = (inputId: string) => {
    setPreviewMode(false);
    window.requestAnimationFrame(() => {
      const el = document.getElementById(inputId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    });
  };

  const handleOwnerPortraitUpload = async (file: File, options?: UploadOptions) => {
    setImageUploading(true);
    try {
      const previousUrl = draft.profileImage;
      const result = options
        ? await uploadFileToStorage('media-library', file, 'owner-profile', 'image', options)
        : await uploadFileToStorage('media-library', file, 'owner-profile', 'image');

      if (!result.success || !result.url) {
        if (!result.aborted) {
          const msg =
            result.error ||
            'Unable to upload portrait photo. Check storage permissions or provide a direct HTTPS image URL.';
          showToast('Portrait Upload Failed', msg, 'error');
        }
        return result;
      }

      if (previousUrl && previousUrl !== ownerProfile.profileImage && previousUrl !== result.url) {
        void deleteStorageFileByUrl(previousUrl);
      }

      clearFieldError('profileImage');
      setAvatarLoadError(false);

      addMediaAsset({
        name: `Owner Portrait — ${file.name}`,
        url: result.url,
        fileType: 'image',
        fileSize: result.fileSize || formatFileSize(file.size),
        category: 'gallery',
      });

      showToast(
        'Portrait Ready',
        'Image uploaded to media storage. Select "Save Profile" to apply this change.',
        'success'
      );
      return result;
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    const prev = draft.profileImage;
    handleFieldChange('profileImage', '');
    if (prev && prev !== ownerProfile.profileImage) {
      void deleteStorageFileByUrl(prev);
    }
  };

  const handleCancel = () => {
    setDraft(cloneOwnerProfile(ownerProfile));
    setFieldErrors({});
    setPreviewMode(false);
    showToast('Edits Discarded', 'Reverted staged edits to last saved owner profile.', 'info');
  };

  const handleSave = async (): Promise<boolean> => {
    const validation = validateOwnerProfileDraft(draft);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      const firstError =
        Object.values(validation.errors)[0] || 'Please fix the highlighted profile fields.';
      showToast('Validation Required', firstError, 'warning');
      setPreviewMode(false);
      return false;
    }

    const prevSavedImage = ownerProfile.profileImage;
    setFieldErrors({});
    const ok = await updateOwnerProfile(validation.sanitized);
    if (ok) {
      if (prevSavedImage && prevSavedImage !== validation.sanitized.profileImage) {
        void deleteStorageFileByUrl(prevSavedImage);
      }
      setDraft(cloneOwnerProfile(validation.sanitized));
      setPreviewMode(false);
    }
    return ok;
  };

  if (ownerProfileStatus === 'loading' && !isDirty) {
    return (
      <StudioLoadingState
        title="Loading your information..."
        subtitle="Preparing your proprietor profile and public details."
      />
    );
  }

  const activeOverviewSocials = [
    { key: 'Website', url: ownerProfile.socialLinks.website, icon: Globe },
    { key: 'LinkedIn', url: ownerProfile.socialLinks.linkedin, icon: Linkedin },
    { key: 'Instagram', url: ownerProfile.socialLinks.instagram, icon: Instagram },
    { key: 'Facebook', url: ownerProfile.socialLinks.facebook, icon: Facebook },
    ...(ownerProfile.socialLinks.other || []).map((item) => ({
      key: item.label || 'Custom Link',
      url: item.url,
      icon: Link2,
    })),
  ]
    .map((entry) => ({ ...entry, href: safeHref(entry.url) }))
    .filter((entry): entry is typeof entry & { href: string } => Boolean(entry.href));

  const previewSocials = [
    { key: 'Website', url: draft.socialLinks.website, icon: Globe },
    { key: 'LinkedIn', url: draft.socialLinks.linkedin, icon: Linkedin },
    { key: 'Instagram', url: draft.socialLinks.instagram, icon: Instagram },
    { key: 'Facebook', url: draft.socialLinks.facebook, icon: Facebook },
    ...(draft.socialLinks.other || []).map((item) => ({
      key: item.label || 'Custom Link',
      url: item.url,
      icon: Link2,
    })),
  ]
    .map((entry) => ({ ...entry, href: safeHref(entry.url) }))
    .filter((entry): entry is typeof entry & { href: string } => Boolean(entry.href));

  const savedInitials = getOwnerProfileInitials(ownerProfile.fullName);
  const draftInitials = getOwnerProfileInitials(draft.fullName);
  const bioLength = draft.bio.trim().length;

  return (
    <div className="space-y-6">
      {/* Error Recovery Banner */}
      {ownerProfileError && (
        <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-rose-100">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Unable to Save Profile</div>
              <p className="text-rose-200/80 mt-0.5">{ownerProfileError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void refreshOwnerProfile()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-400/30 bg-[#101014] text-[11px] font-medium text-rose-100 hover:bg-rose-500/15 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Top Action Header */}
      <div className="rounded-2xl bg-[#141419] border border-[#C9A96E]/25 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
            <span>Owner &amp; Brand</span>
            <span className="text-[#85838A]">/</span>
            <span className="text-[#E8E5DF]">Proprietor Profile</span>
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#211B16] border border-[#C9A96E]/40 text-[#DFC492] text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] animate-pulse" />
                {stagedChanges.length} Unsaved {stagedChanges.length === 1 ? 'Change' : 'Changes'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight text-[#E8E5DF]">
            Owner Profile &amp; Public Identity
          </h1>
          <p className="text-xs sm:text-sm text-[#85838A] leading-relaxed">
            Manage your proprietor details, profile photo, public contact information, and online presence with a live preview before saving.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setPreviewMode((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              previewMode
                ? 'border-[#C9A96E]/60 bg-[#211B16] text-[#DFC492]'
                : 'border-white/[0.1] bg-[#101014] text-[#E8E5DF] hover:border-[#C9A96E]/40 hover:bg-[#211B16]/70'
            }`}
          >
            {previewMode ? (
              <EyeOff className="w-3.5 h-3.5 text-[#C9A96E]" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-[#C9A96E]" />
            )}
            <span>{previewMode ? 'Back to Editor' : 'Preview Changes'}</span>
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty || ownerProfileStatus === 'saving'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-[#101014] text-xs font-medium text-[#85838A] hover:text-[#E8E5DF] hover:border-white/[0.18] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!isDirty || ownerProfileStatus === 'saving' || imageUploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold disabled:opacity-45 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            {ownerProfileStatus === 'saving' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{ownerProfileStatus === 'saving' ? 'Saving…' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {/* Saved Overview + Profile Completion Card */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 relative rounded-2xl bg-[#141419] border border-white/[0.07] p-6 overflow-hidden">
          <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-[#C9A96E]/35 bg-[#211B16] flex items-center justify-center overflow-hidden">
                {ownerProfile.profileImage && !avatarLoadError ? (
                  <img
                    src={ownerProfile.profileImage}
                    alt={ownerProfile.fullName}
                    onError={() => setAvatarLoadError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-editorial text-2xl sm:text-3xl text-[#C9A96E] tracking-wide">
                    {savedInitials}
                  </span>
                )}
              </div>
              <span
                title="Verified Administrator"
                className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-[#101014] border border-[#C9A96E]/45 flex items-center justify-center text-[#C9A96E]"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Identity Details */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-editorial text-2xl text-[#E8E5DF] tracking-tight truncate">
                    {ownerProfile.fullName || 'Sharique Aman'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-[#211B16] border border-[#C9A96E]/30 text-[10px] font-mono uppercase tracking-[0.12em] text-[#C9A96E]">
                    Verified Proprietor
                  </span>
                </div>
                <div className="text-sm text-[#DFC492] font-medium mt-0.5">
                  {ownerProfile.designation || 'Founder & Proprietor'}
                </div>
                <div className="text-xs text-[#85838A] mt-0.5">
                  {ownerProfile.businessIdentity || 'Aman Computer — Cyber Cafe & Digital Center'}
                </div>
              </div>

              {ownerProfile.bio ? (
                <p className="text-xs sm:text-[13px] text-[#E8E5DF]/80 leading-relaxed">
                  {ownerProfile.bio}
                </p>
              ) : (
                <p className="text-xs italic text-[#85838A]">
                  No biography added yet. Add a short introduction about your experience and services below.
                </p>
              )}

              {/* Quick Meta Badges */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-[#85838A] pt-1">
                {ownerProfile.locationLabel && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span className="text-[#E8E5DF]">{ownerProfile.locationLabel}</span>
                  </span>
                )}
                {ownerProfile.experienceLabel && (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#DFC492]" />
                    <span className="text-[#E8E5DF]">{ownerProfile.experienceLabel}</span>
                  </span>
                )}
                {ownerProfile.email && (
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
                    <span className="text-[#E8E5DF] truncate">{ownerProfile.email}</span>
                  </span>
                )}
                {ownerProfile.phone && (
                  <span className="inline-flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
                    <span className="text-[#E8E5DF]">{ownerProfile.phone}</span>
                  </span>
                )}
              </div>

              {/* Active Social Links */}
              <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
                {activeOverviewSocials.length > 0 ? (
                  activeOverviewSocials.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={`${item.key}-${item.href}`}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#101014] border border-white/[0.08] hover:border-[#C9A96E]/45 hover:bg-[#211B16] text-[11px] text-[#E8E5DF] transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5 text-[#C9A96E]" />
                        <span>{item.key}</span>
                      </a>
                    );
                  })
                ) : (
                  <span className="text-[11px] text-[#85838A]">
                    No public social or portfolio links added yet.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Profile Completion Indicator */}
        <div className="xl:col-span-4 rounded-2xl bg-[#141419] border border-white/[0.07] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                <span className="text-xs font-mono uppercase tracking-[0.14em] text-[#85838A]">
                  Profile Completeness
                </span>
              </div>
              <span className="font-mono text-sm font-semibold text-[#C9A96E] tabular-nums">
                {draftCompletion.percentage}%
              </span>
            </div>

            <div className="h-2 rounded-full bg-[#0A0A0E] border border-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#C9A96E] to-[#DFC492] transition-all duration-500"
                style={{ width: `${draftCompletion.percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#85838A]">
              <span>
                {draftCompletion.completedCount} of {draftCompletion.totalCount} details completed
              </span>
              {savedCompletion.percentage !== draftCompletion.percentage && (
                <span className="font-mono text-[#DFC492]">
                  Saved: {savedCompletion.percentage}%
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            {draftCompletion.missingFields.length > 0 ? (
              <>
                <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#85838A]">
                  Recommended Additions
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {draftCompletion.missingFields.map((missing) => (
                    <button
                      key={missing.key}
                      type="button"
                      onClick={() => focusTargetInput(missing.targetInputId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#101014] border border-[#C9A96E]/25 hover:border-[#C9A96E]/60 text-[11px] text-[#DFC492] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-[#C9A96E]" />
                      <span>{missing.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2.5 flex items-center gap-2 text-xs text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Your owner profile is 100% complete.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Live Preview Changes Panel */}
      <AnimatePresence mode="wait">
        {previewMode && (
          <motion.section
            key="owner-preview-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl bg-[#141419] border border-[#C9A96E]/35 p-6 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.07]">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#C9A96E]">
                  Live Staged Preview
                </div>
                <h3 className="font-editorial text-xl text-[#E8E5DF] mt-0.5">
                  Compare Saved vs Staged Profile Appearance
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className="px-3.5 py-2 rounded-xl border border-white/[0.1] bg-[#101014] text-xs text-[#E8E5DF] hover:border-white/[0.2] transition-colors cursor-pointer"
                >
                  Continue Editing
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={!isDirty || ownerProfileStatus === 'saving'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold disabled:opacity-45 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Confirm &amp; Save Changes</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#85838A]">
                  Rendered Proprietor Card Preview
                </div>
                <div className="rounded-xl bg-[#101014] border border-[#C9A96E]/25 p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl border border-[#C9A96E]/40 bg-[#211B16] flex items-center justify-center overflow-hidden shrink-0">
                      {draft.profileImage && !previewAvatarLoadError ? (
                        <img
                          src={draft.profileImage}
                          alt={draft.fullName}
                          onError={() => setPreviewAvatarLoadError(true)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-editorial text-xl text-[#C9A96E]">
                          {draftInitials}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-editorial text-xl text-[#E8E5DF] truncate">
                        {draft.fullName || '(Name Required)'}
                      </div>
                      <div className="text-xs text-[#DFC492] font-medium">
                        {draft.designation || '(Designation)'}
                      </div>
                      <div className="text-[11px] text-[#85838A]">
                        {draft.businessIdentity || '(Business Identity)'}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[#E8E5DF]/80 leading-relaxed">
                    {draft.bio || 'No biography set.'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px] text-[#85838A]">
                    {draft.locationLabel && <span>{draft.locationLabel}</span>}
                    {draft.experienceLabel && <span>· {draft.experienceLabel}</span>}
                    {draft.email && <span>· {draft.email}</span>}
                    {draft.phone && <span className="font-mono">· {draft.phone}</span>}
                  </div>
                  {previewSocials.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.06]">
                      {previewSocials.map((s) => (
                        <span
                          key={`${s.key}-${s.href}`}
                          className="px-2 py-1 rounded-md bg-[#141419] border border-white/[0.08] text-[10px] text-[#DFC492]"
                        >
                          {s.key}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#85838A] mb-2">
                    Top Navigation Bar Identity Chip
                  </div>
                  <div className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#101014] border border-white/[0.08]">
                    <div className="w-8 h-8 rounded-lg bg-[#211B16] border border-[#C9A96E]/40 flex items-center justify-center overflow-hidden">
                      {draft.profileImage && !previewAvatarLoadError ? (
                        <img
                          src={draft.profileImage}
                          alt={draft.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-[#C9A96E]">
                          {draftInitials}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#E8E5DF]">
                        {draft.fullName || 'Sharique Aman'}
                      </div>
                      <div className="text-[10px] text-[#85838A]">
                        {draft.designation || 'Proprietor'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#85838A]">
                  Field-by-Field Changes ({stagedChanges.length})
                </div>
                {stagedChanges.length === 0 ? (
                  <div className="rounded-xl bg-[#101014] border border-white/[0.07] p-5 text-xs text-[#85838A]">
                    No unstaged differences yet. Edit any field below to preview changes before saving.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto admin-studio-scroll pr-1">
                    {stagedChanges.map((change) => (
                      <div
                        key={change.field}
                        className="rounded-xl bg-[#101014] border border-white/[0.07] p-3 space-y-1.5"
                      >
                        <div className="text-[11px] font-mono text-[#C9A96E]">
                          {change.field}
                        </div>
                        <div className="text-[11px] text-[#85838A] break-all">
                          <span className="line-through opacity-75">{change.before}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-[11px] text-emerald-300 break-all">
                          <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#C9A96E]" />
                          <span>{change.after}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <section className="rounded-2xl bg-[#141419] border border-white/[0.07] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-[#C9A96E]" />
                <h3 className="text-sm font-medium text-[#E8E5DF]">Profile Image</h3>
              </div>
              {draft.profileImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <ContextualDropZone
              label="Portrait Photo"
              fieldId="owner-profile-portrait"
              value={draft.profileImage}
              onChange={(url) => {
                handleFieldChange('profileImage', url);
                setAvatarLoadError(false);
              }}
              onRemove={(prev) => {
                if (prev && prev !== ownerProfile.profileImage) {
                  void deleteStorageFileByUrl(prev);
                }
              }}
              config={{ category: 'image' }}
              onUploadFile={handleOwnerPortraitUpload}
              emptyLabel="Upload official portrait photo"
              aspectClass="aspect-square max-w-[220px] mx-auto"
              fitClass="object-cover"
              allowUrlInput={false}
            />

            <div className="space-y-1.5">
              <label
                htmlFor="owner-profile-image-input"
                className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#85838A]"
              >
                Image URL (Optional)
              </label>
              <input
                id="owner-profile-image-input"
                type="text"
                value={draft.profileImage}
                onChange={(e) => handleFieldChange('profileImage', e.target.value)}
                placeholder="https://example.com/portrait.jpg"
                className="w-full rounded-xl bg-[#0A0A0E] border border-white/[0.08] focus:border-[#C9A96E]/70 focus:outline-none px-3 py-2 text-xs text-[#E8E5DF] placeholder:text-[#85838A]/60"
              />
              {fieldErrors.profileImage && (
                <p className="text-[11px] text-rose-400">{fieldErrors.profileImage}</p>
              )}
            </div>
          </section>

          {/* Owner Account Protection Summary */}
          <section className="rounded-2xl bg-[#141419] border border-white/[0.07] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-[#E8E5DF]">
              <UserCheck className="w-4 h-4 text-[#C9A96E]" />
              <span>Owner Account Protection</span>
            </div>
            <p className="text-[11px] text-[#85838A] leading-relaxed">
              Your account is protected and restricted exclusively to the authorized Aman Computer owner. Updating public profile details here does not affect your sign-in credentials.
            </p>
            <div className="rounded-xl bg-[#101014] border border-white/[0.06] p-3 space-y-2 text-[11px] font-mono">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#85838A]">Account Security</span>
                <span className="text-emerald-400">Your account is protected</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#85838A]">Sign-In Email</span>
                <span className="text-[#E8E5DF] truncate">{currentUser?.email || 'Verified Owner'}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#85838A]">Online Sync Status</span>
                <span className={isSupabaseActive ? 'text-emerald-400' : 'text-[#DFC492]'}>
                  {isSupabaseActive ? 'Services Operational' : 'Offline Mode'}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          <section className="rounded-2xl bg-[#141419] border border-white/[0.07] p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5">
              <div>
                <h3 className="text-sm font-medium text-[#E8E5DF]">Identity &amp; Biography</h3>
                <p className="text-[11px] text-[#85838A] mt-0.5">
                  Updates your dashboard greeting, header identity chip, and public owner card.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="owner-full-name"
                  className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#85838A]"
                >
                  Full Name <span className="text-[#C9A96E]">*</span>
                </label>
                <input
                  id="owner-full-name"
                  type="text"
                  maxLength={80}
                  value={draft.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  placeholder="Sharique Aman"
                  className="w-full rounded-xl bg-[#0A0A0E] border border-white/[0.08] focus:border-[#C9A96E]/70 focus:outline-none px-3.5 py-2.5 text-sm text-[#E8E5DF] placeholder:text-[#85838A]/60"
                />
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.fullName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="owner-designation"
                  className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#85838A]"
                >
                  Professional Designation <span className="text-[#C9A96E]">*</span>
                </label>
                <input
                  id="owner-designation"
                  type="text"
                  maxLength={100}
                  value={draft.designation}
                  onChange={(e) => handleFieldChange('designation', e.target.value)}
                  placeholder="Founder & Proprietor"
                  className="w-full rounded-xl bg-[#0A0A0E] border border-white/[0.08] focus:border-[#C9A96E]/70 focus:outline-none px-3.5 py-2.5 text-sm text-[#E8E5DF] placeholder:text-[#85838A]/60"
                />
                {fieldErrors.designation && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.designation}</p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label
                  htmlFor="owner-business-identity"
                  className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#85838A]"
                >
                  Business Identity <span className="text-[#C9A96E]">*</span>
                </label>
                <input
                  id="owner-business-identity"
                  type="text"
                  maxLength={120}
                  value={draft.businessIdentity}
                  onChange={(e) => handleFieldChange('businessIdentity', e.target.value)}
                  placeholder="Aman Computer — Cyber Cafe & Digital Center"
                  className="w-full rounded-xl bg-[#0A0A0E] border border-white/[0.08] focus:border-[#C9A96E]/70 focus:outline-none px-3.5 py-2.5 text-sm text-[#E8E5DF] placeholder:text-[#85838A]/60"
                />
                {fieldErrors.businessIdentity && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.businessIdentity}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="owner-location"
                  className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#85838A]"
                >
                  City / Center Location
                </label>
                <input
                  id="owner-location"
                  type="text"
                  maxLength={80}
                  value={draft.locationLabel || ''}
                  onChange={(e) => handleFieldChange('locationLabel', e.target.value)}
                  placeholder="Varanasi, Uttar Pradesh"
                  className="w-full rounded-xl bg-[#0A0A0E] border border-white/[0.08] focus:border-[#C9A96E]/70 focus:outline-none px-3.5 py-2.5 text-sm text-[#E8E5DF] placeholder:text-[#85838A]/60"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="owner-experience"
                  className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#85838A]"
                >
                  Experience Badge
                </label>
                <input
                  id="owner-experience"
                  type="text"
                  maxLength={60}
                  value={draft.experienceLabel || ''}
                  onChange={(e) => handleFieldChange('experienceLabel', e.target.value)}
                  placeholder="12+ Years Experience"
                  className="w-full rounded-xl bg-[#0A0A0E] border border-white/[0.08] focus:border-[#C9A96E]/70 focus:outline-none px-3.5 py-2.5 text-sm text-[#E8E5DF] placeholder:text-[#85838A]/60"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="owner-bio"
                    className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#85838A]"
                  >
                    Short Biography
                  </label>
                  <span
                    className={`text-[11px] font-mono tabular-nums ${
                      bioLength > 800 ? 'text-rose-400' : 'text-[#85838A]'
                    }`}
                  >
                    {bioLength} / 800
                  </span>
                </div>
                <textarea
                  id="owner-bio"
                  rows={4}
                  value={draft.bio}
                  onChange={(e) => handleFieldChange('bio', e.target.value)}
                  placeholder="Describe your proprietor journey, government portal expertise, and service standards…"
                  className="w-full rounded-xl bg-[#0A0A0E] border border-white/[0.08] focus:border-[#C9A96E]/70 focus:outline-none px-3.5 py-2.5 text-sm text-[#E8E5DF] placeholder:text-[#85838A]/60 leading-relaxed resize-y"
                />
                {fieldErrors.bio && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.bio}</p>
                )}
              </div>
            </div>
          </section>

          {/* Public Contact Information */}
          <section className="rounded-2xl bg-[#141419] border border-white/[0.07] p-5 sm:p-6 space-y-4">
            <div className="border-b border-white/[0.06] pb-3.5">
              <h3 className="text-sm font-medium text-[#E8E5DF]">Public Contact Information</h3>
              <p className="text-[11px] text-[#85838A] mt-0.5">
                Shown on your Owner Card and dashboard header. Updating this email does not change your sign-in account.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="owner-email"
                  className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#85838A]"
                >
                  Public Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#85838A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="owner-email"
                    type="email"
                    value={draft.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="shariqueaman77@gmail.com"
                    className="w-full rounded-xl bg-[#0A0A0E] border border-white/[0.08] focus:border-[#C9A96E]/70 focus:outline-none pl-9 pr-3.5 py-2.5 text-sm text-[#E8E5DF] placeholder:text-[#85838A]/60"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="owner-phone"
                  className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#85838A]"
                >
                  Public Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#85838A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="owner-phone"
                    type="tel"
                    value={draft.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+91 85955 15718"
                    className="w-full rounded-xl bg-[#0A0A0E] border border-white/[0.08] focus:border-[#C9A96E]/70 focus:outline-none pl-9 pr-3.5 py-2.5 text-sm font-mono text-[#E8E5DF] placeholder:text-[#85838A]/60"
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-[11px] text-rose-400">{fieldErrors.phone}</p>
                )}
              </div>
            </div>
          </section>

          {/* Online Presence */}
          <section className="rounded-2xl bg-[#141419] border border-white/[0.07] p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5">
              <div>
                <h3 className="text-sm font-medium text-[#E8E5DF]">Online Presence</h3>
                <p className="text-[11px] text-[#85838A] mt-0.5">
                  Optional website and social profile links shown on your Owner Card. Leave blank if unused.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCustomLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C9A96E]/35 bg-[#211B16] hover:border-[#C9A96E] text-xs font-medium text-[#DFC492] transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>Add Custom Link</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: 'owner-social-website',
                  key: 'website' as const,
                  label: 'Website / Portfolio',
                  icon: Globe,
                  placeholder: 'https://amancomputer.in',
                },
                {
                  id: 'owner-social-linkedin',
                  key: 'linkedin' as const,
                  label: 'LinkedIn',
                  icon: Linkedin,
                  placeholder: 'https://linkedin.com/in/username',
                },
                {
                  id: 'owner-social-instagram',
                  key: 'instagram' as const,
                  label: 'Instagram',
                  icon: Instagram,
                  placeholder: 'https://instagram.com/amancomputer',
                },
                {
                  id: 'owner-social-facebook',
                  key: 'facebook' as const,
                  label: 'Facebook',
                  icon: Facebook,
                  placeholder: 'https://facebook.com/amancomputer',
                },
              ].map((social) => {
                const Icon = social.icon;
                const val = draft.socialLinks[social.key];
                return (
                  <div key={social.key} className="space-y-1.5">
                    <label
                      htmlFor={social.id}
                      className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#85838A]"
                    >
                      {social.label}
                    </label>
                    <div className="relative">
                      <Icon className="w-4 h-4 text-[#C9A96E]/80 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id={social.id}
                        type="url"
                        value={val}
                        onChange={(e) => handleSocialChange(social.key, e.target.value)}
                        placeholder={social.placeholder}
                        className="w-full rounded-xl bg-[#0A0A0E] border border-white/[0.08] focus:border-[#C9A96E]/70 focus:outline-none pl-9 pr-3.5 py-2.5 text-xs text-[#E8E5DF] placeholder:text-[#85838A]/60"
                      />
                    </div>
                    {fieldErrors[social.key] && (
                      <p className="text-[11px] text-rose-400">{fieldErrors[social.key]}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-[#85838A]">
                Other Links ({draft.socialLinks.other.length})
              </div>

              {draft.socialLinks.other.length === 0 ? (
                <div className="rounded-xl bg-[#101014] border border-white/[0.06] px-4 py-3 text-xs text-[#85838A]">
                  Need YouTube, X/Twitter, WhatsApp Channel, or Google Business Profile? Click &ldquo;Add Custom Link&rdquo;.
                </div>
              ) : (
                <div className="space-y-3">
                  {draft.socialLinks.other.map((item, idx) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-[#101014] border border-white/[0.07] p-3 space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) =>
                              handleUpdateCustomLink(item.id, { label: e.target.value })
                            }
                            placeholder={`Platform #${idx + 1} (e.g. YouTube)`}
                            className="w-full rounded-lg bg-[#0A0A0E] border border-white/[0.08] focus:border-[#C9A96E]/70 focus:outline-none px-3 py-2 text-xs text-[#E8E5DF] placeholder:text-[#85838A]/60"
                          />
                        </div>
                        <div className="sm:col-span-7">
                          <input
                            type="url"
                            value={item.url}
                            onChange={(e) =>
                              handleUpdateCustomLink(item.id, { url: e.target.value })
                            }
                            placeholder="https://..."
                            className="w-full rounded-lg bg-[#0A0A0E] border border-white/[0.08] focus:border-[#C9A96E]/70 focus:outline-none px-3 py-2 text-xs text-[#E8E5DF] placeholder:text-[#85838A]/60"
                          />
                        </div>
                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomLink(item.id)}
                            aria-label="Remove custom link"
                            className="p-2 rounded-lg text-[#85838A] hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {fieldErrors[`other.${item.id}`] && (
                        <p className="text-[11px] text-rose-400">
                          {fieldErrors[`other.${item.id}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
