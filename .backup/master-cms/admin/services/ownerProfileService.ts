import { BusinessProfile, OwnerCustomLink, OwnerProfile } from '../types';

export const DEFAULT_OWNER_PROFILE: OwnerProfile = {
  fullName: 'Sharique Aman',
  designation: 'Founder & Proprietor',
  businessIdentity: 'Aman Computer — Cyber Cafe & Digital Center',
  bio: 'Leading Aman Computer since 2014 with reliable government portal assistance, identity card facilitation, commercial printing, and transparent digital citizen services in Varanasi.',
  email: 'shariqueaman77@gmail.com',
  phone: '+91 85955 15718',
  profileImage: '',
  locationLabel: 'Varanasi, Uttar Pradesh',
  experienceLabel: '12+ Years Experience',
  socialLinks: {
    website: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    other: [],
  },
};

export const createDefaultOwnerProfile = (
  overrides?: Partial<OwnerProfile>,
  businessProfile?: Partial<BusinessProfile>
): OwnerProfile => ({
  ...DEFAULT_OWNER_PROFILE,
  businessIdentity:
    overrides?.businessIdentity ||
    (businessProfile?.businessName
      ? `${businessProfile.businessName}${businessProfile.tagline ? ` — ${businessProfile.tagline.split('—')[0].trim()}` : ''}`
      : DEFAULT_OWNER_PROFILE.businessIdentity),
  phone: overrides?.phone ?? businessProfile?.primaryPhone ?? DEFAULT_OWNER_PROFILE.phone,
  email: overrides?.email ?? DEFAULT_OWNER_PROFILE.email,
  locationLabel:
    overrides?.locationLabel ??
    (businessProfile?.city && businessProfile?.state
      ? `${businessProfile.city}, ${businessProfile.state}`
      : DEFAULT_OWNER_PROFILE.locationLabel),
  ...overrides,
  socialLinks: {
    ...DEFAULT_OWNER_PROFILE.socialLinks,
    ...(overrides?.socialLinks || {}),
    other: Array.isArray(overrides?.socialLinks?.other)
      ? overrides!.socialLinks!.other.map((link) => ({ ...link }))
      : [],
  },
});

const isSafeRelativeAssetPath = (value: string): boolean => {
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('..');
};

export const validateHttpUrl = (
  rawValue: string,
  fieldLabel = 'URL',
  options: { allowRelativeAsset?: boolean } = {}
): { valid: boolean; normalized: string; error?: string } => {
  const trimmed = (rawValue || '').trim();
  if (!trimmed) {
    return { valid: true, normalized: '' };
  }

  if (/[\s<>"'`]/.test(trimmed)) {
    return {
      valid: false,
      normalized: trimmed,
      error: `${fieldLabel} cannot contain spaces or unsafe characters.`,
    };
  }

  if (trimmed.startsWith('/')) {
    if (options.allowRelativeAsset && isSafeRelativeAssetPath(trimmed)) {
      return { valid: true, normalized: trimmed };
    }
    return {
      valid: false,
      normalized: trimmed,
      error: `${fieldLabel} must be a valid https:// or http:// URL.`,
    };
  }

  // Reject dangerous or non-HTTP schemes explicitly before attempting normalization
  const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(trimmed);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (scheme !== 'http' && scheme !== 'https') {
      return {
        valid: false,
        normalized: trimmed,
        error: `${fieldLabel} must start with https:// or http://.`,
      };
    }
  }

  const candidate = schemeMatch ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        valid: false,
        normalized: trimmed,
        error: `${fieldLabel} must use https:// or http://.`,
      };
    }
    if (parsed.username || parsed.password) {
      return {
        valid: false,
        normalized: trimmed,
        error: `${fieldLabel} cannot contain embedded credentials.`,
      };
    }
    if (
      !parsed.hostname ||
      parsed.hostname.startsWith('.') ||
      parsed.hostname.endsWith('.') ||
      parsed.hostname.includes('..') ||
      (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')
    ) {
      return {
        valid: false,
        normalized: trimmed,
        error: `Please enter a valid domain for ${fieldLabel}.`,
      };
    }
    return { valid: true, normalized: parsed.toString() };
  } catch {
    return {
      valid: false,
      normalized: trimmed,
      error: `Please enter a valid URL for ${fieldLabel} (e.g. https://example.com).`,
    };
  }
};

export const normalizeOwnerProfile = (
  raw: unknown,
  fallback?: Partial<OwnerProfile>
): OwnerProfile => {
  const base = createDefaultOwnerProfile(fallback);
  if (!raw || typeof raw !== 'object') {
    return base;
  }
  const src = raw as Partial<OwnerProfile> & {
    socialLinks?: Partial<OwnerProfile['socialLinks']>;
  };

  const cleanOther: OwnerCustomLink[] = Array.isArray(src.socialLinks?.other)
    ? src.socialLinks!.other
        .filter((item): item is OwnerCustomLink => Boolean(item && typeof item === 'object'))
        .map((item, idx) => ({
          id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `link-${idx + 1}`,
          label: typeof item.label === 'string' ? item.label.trim() : '',
          url: typeof item.url === 'string' ? item.url.trim() : '',
        }))
    : base.socialLinks.other;

  const rawImage = typeof src.profileImage === 'string' ? src.profileImage.trim() : base.profileImage;
  const safeImage =
    rawImage.startsWith('data:image/') && rawImage.length > 16384 ? '' : rawImage;

  return {
    fullName:
      typeof src.fullName === 'string' && src.fullName.trim()
        ? src.fullName.trim()
        : base.fullName,
    designation:
      typeof src.designation === 'string'
        ? src.designation.trim()
        : base.designation,
    businessIdentity:
      typeof src.businessIdentity === 'string'
        ? src.businessIdentity.trim()
        : base.businessIdentity,
    bio: typeof src.bio === 'string' ? src.bio : base.bio,
    email: typeof src.email === 'string' ? src.email.trim() : base.email,
    phone: typeof src.phone === 'string' ? src.phone.trim() : base.phone,
    profileImage: safeImage,
    locationLabel:
      typeof src.locationLabel === 'string'
        ? src.locationLabel.trim()
        : base.locationLabel,
    experienceLabel:
      typeof src.experienceLabel === 'string'
        ? src.experienceLabel.trim()
        : base.experienceLabel,
    socialLinks: {
      website:
        typeof src.socialLinks?.website === 'string'
          ? src.socialLinks.website.trim()
          : base.socialLinks.website,
      linkedin:
        typeof src.socialLinks?.linkedin === 'string'
          ? src.socialLinks.linkedin.trim()
          : base.socialLinks.linkedin,
      instagram:
        typeof src.socialLinks?.instagram === 'string'
          ? src.socialLinks.instagram.trim()
          : base.socialLinks.instagram,
      facebook:
        typeof src.socialLinks?.facebook === 'string'
          ? src.socialLinks.facebook.trim()
          : base.socialLinks.facebook,
      other: cleanOther,
    },
    updatedAt: typeof src.updatedAt === 'string' ? src.updatedAt : base.updatedAt,
  };
};

export interface OwnerProfileValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitized: OwnerProfile;
}

export const validateOwnerProfileDraft = (
  draft: OwnerProfile
): OwnerProfileValidationResult => {
  const errors: Record<string, string> = {};

  const fullName = draft.fullName.trim();
  const designation = draft.designation.trim();
  const businessIdentity = draft.businessIdentity.trim();
  const bio = draft.bio.trim();
  const email = draft.email.trim();
  const phone = draft.phone.trim();
  const locationLabel = (draft.locationLabel || '').trim();
  const experienceLabel = (draft.experienceLabel || '').trim();

  if (fullName.length < 2 || fullName.length > 80) {
    errors.fullName = 'Full name must be between 2 and 80 characters.';
  }

  if (designation.length < 2 || designation.length > 100) {
    errors.designation = 'Professional designation must be between 2 and 100 characters.';
  }

  if (businessIdentity.length < 2 || businessIdentity.length > 120) {
    errors.businessIdentity = 'Business identity must be between 2 and 120 characters.';
  }

  if (bio.length > 800) {
    errors.bio = 'Short biography must be 800 characters or fewer.';
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid contact email address.';
  }

  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15 || phone.length > 24) {
      errors.phone = 'Please enter a valid 10 to 15 digit phone number.';
    }
  }

  const imageCheck = validateHttpUrl(draft.profileImage, 'Profile Image URL', {
    allowRelativeAsset: true,
  });
  if (!imageCheck.valid && imageCheck.error) {
    errors.profileImage = imageCheck.error;
  }

  const websiteCheck = validateHttpUrl(draft.socialLinks.website, 'Website URL');
  if (!websiteCheck.valid && websiteCheck.error) {
    errors.website = websiteCheck.error;
  }

  const linkedinCheck = validateHttpUrl(draft.socialLinks.linkedin, 'LinkedIn URL');
  if (!linkedinCheck.valid && linkedinCheck.error) {
    errors.linkedin = linkedinCheck.error;
  }

  const instagramCheck = validateHttpUrl(draft.socialLinks.instagram, 'Instagram URL');
  if (!instagramCheck.valid && instagramCheck.error) {
    errors.instagram = instagramCheck.error;
  }

  const facebookCheck = validateHttpUrl(draft.socialLinks.facebook, 'Facebook URL');
  if (!facebookCheck.valid && facebookCheck.error) {
    errors.facebook = facebookCheck.error;
  }

  const sanitizedOther: OwnerCustomLink[] = [];
  (draft.socialLinks.other || []).forEach((item, idx) => {
    const label = (item.label || '').trim();
    const rawUrl = (item.url || '').trim();
    if (!label && !rawUrl) {
      return;
    }
    if (!label) {
      errors[`other.${item.id || idx}`] = `Platform label is required for custom link #${idx + 1}.`;
    }
    const urlCheck = validateHttpUrl(rawUrl, label || `Custom Link #${idx + 1}`);
    if (!rawUrl) {
      errors[`other.${item.id || idx}`] = `URL is required for ${label || `custom link #${idx + 1}`}.`;
    } else if (!urlCheck.valid && urlCheck.error) {
      errors[`other.${item.id || idx}`] = urlCheck.error;
    }
    sanitizedOther.push({
      id: item.id || `link-${idx + 1}`,
      label,
      url: urlCheck.valid ? urlCheck.normalized : rawUrl,
    });
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      fullName,
      designation,
      businessIdentity,
      bio,
      email,
      phone,
      profileImage: imageCheck.valid ? imageCheck.normalized : draft.profileImage.trim(),
      locationLabel,
      experienceLabel,
      socialLinks: {
        website: websiteCheck.valid ? websiteCheck.normalized : draft.socialLinks.website.trim(),
        linkedin: linkedinCheck.valid ? linkedinCheck.normalized : draft.socialLinks.linkedin.trim(),
        instagram: instagramCheck.valid ? instagramCheck.normalized : draft.socialLinks.instagram.trim(),
        facebook: facebookCheck.valid ? facebookCheck.normalized : draft.socialLinks.facebook.trim(),
        other: sanitizedOther,
      },
      updatedAt: new Date().toISOString(),
    },
  };
};

export interface OwnerProfileCompletionSummary {
  percentage: number;
  completedCount: number;
  totalCount: number;
  items: Array<{
    key: string;
    label: string;
    completed: boolean;
    targetInputId: string;
  }>;
  missingFields: Array<{
    key: string;
    label: string;
    targetInputId: string;
  }>;
}

export const calculateOwnerProfileCompletion = (
  profile: OwnerProfile
): OwnerProfileCompletionSummary => {
  const hasSocial =
    Boolean(profile.socialLinks.website.trim()) ||
    Boolean(profile.socialLinks.linkedin.trim()) ||
    Boolean(profile.socialLinks.instagram.trim()) ||
    Boolean(profile.socialLinks.facebook.trim()) ||
    profile.socialLinks.other.some((l) => Boolean(l.label.trim() && l.url.trim()));

  const items = [
    {
      key: 'profileImage',
      label: 'Profile Photo',
      completed: Boolean(profile.profileImage.trim()),
      targetInputId: 'owner-profile-image-input',
    },
    {
      key: 'fullName',
      label: 'Full Name',
      completed: profile.fullName.trim().length >= 2,
      targetInputId: 'owner-full-name',
    },
    {
      key: 'designation',
      label: 'Designation',
      completed: profile.designation.trim().length >= 2,
      targetInputId: 'owner-designation',
    },
    {
      key: 'businessIdentity',
      label: 'Business Identity',
      completed: profile.businessIdentity.trim().length >= 2,
      targetInputId: 'owner-business-identity',
    },
    {
      key: 'bio',
      label: 'Short Biography',
      completed: profile.bio.trim().length >= 20,
      targetInputId: 'owner-bio',
    },
    {
      key: 'email',
      label: 'Display Email',
      completed: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim()),
      targetInputId: 'owner-email',
    },
    {
      key: 'phone',
      label: 'Display Phone',
      completed: profile.phone.replace(/\D/g, '').length >= 10,
      targetInputId: 'owner-phone',
    },
    {
      key: 'socialLinks',
      label: 'Social / Web Link',
      completed: hasSocial,
      targetInputId: 'owner-social-website',
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const missingFields = items
    .filter((item) => !item.completed)
    .map(({ key, label, targetInputId }) => ({ key, label, targetInputId }));

  return {
    percentage,
    completedCount,
    totalCount,
    items,
    missingFields,
  };
};

export const getOwnerProfileInitials = (fullName?: string | null): string => {
  const parts = (fullName || 'Sharique Aman')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'SA';
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
};

export const getOwnerProfileChanges = (
  saved: OwnerProfile,
  draft: OwnerProfile
): Array<{ field: string; before: string; after: string }> => {
  const changes: Array<{ field: string; before: string; after: string }> = [];

  const compare = (field: string, beforeVal: string, afterVal: string) => {
    const a = (beforeVal || '').trim();
    const b = (afterVal || '').trim();
    if (a !== b) {
      changes.push({
        field,
        before: a || '(empty)',
        after: b || '(empty)',
      });
    }
  };

  compare('Full Name', saved.fullName, draft.fullName);
  compare('Designation', saved.designation, draft.designation);
  compare('Business Identity', saved.businessIdentity, draft.businessIdentity);
  compare('Short Biography', saved.bio, draft.bio);
  compare('Display Email', saved.email, draft.email);
  compare('Display Phone', saved.phone, draft.phone);
  compare('Location Label', saved.locationLabel || '', draft.locationLabel || '');
  compare('Experience Badge', saved.experienceLabel || '', draft.experienceLabel || '');
  compare('Profile Image', saved.profileImage, draft.profileImage);
  compare('Website Link', saved.socialLinks.website, draft.socialLinks.website);
  compare('LinkedIn Link', saved.socialLinks.linkedin, draft.socialLinks.linkedin);
  compare('Instagram Link', saved.socialLinks.instagram, draft.socialLinks.instagram);
  compare('Facebook Link', saved.socialLinks.facebook, draft.socialLinks.facebook);

  const savedOther = JSON.stringify(saved.socialLinks.other || []);
  const draftOther = JSON.stringify(draft.socialLinks.other || []);
  if (savedOther !== draftOther) {
    changes.push({
      field: 'Other Professional Links',
      before: `${(saved.socialLinks.other || []).length} link(s)`,
      after: `${(draft.socialLinks.other || []).length} link(s)`,
    });
  }

  return changes;
};
