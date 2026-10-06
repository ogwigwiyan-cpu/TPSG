export const LANGUAGE_OPTIONS = [
  'English',
  'Afrikaans',
  'isiZulu',
  'isiXhosa',
  'Sesotho',
  'Setswana',
  'Sepedi',
  'siSwati',
  'Tshivenda',
  'Xitsonga',
  'isiNdebele',
]

export const AGE_BANDS = ['UNDER_18', '18_24', '25_34', '35_44', '45_54', '55_64', '65_PLUS']
export const GENDER_OPTIONS = ['NOT_PROVIDED', 'WOMAN', 'MAN', 'NON_BINARY', 'OTHER']
export const EMPLOYMENT_STATUS_OPTIONS = ['EMPLOYED', 'SELF_EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'RETIRED', 'OTHER', 'NOT_PROVIDED']
export const CONTRIBUTION_CAPABILITIES = [
  'MONEY',
  'SKILLS',
  'SERVICES',
  'PRODUCTS_OR_EQUIPMENT',
  'TIME',
  'IDEAS',
  'RESEARCH',
  'COMMUNITY_ORGANISING',
  'SOCIAL_MEDIA',
  'SHARING_OR_REPOSTING',
  'TRANSLATION',
  'RECRUITMENT',
  'OTHER',
]
export const PRIVACY_LEVELS = ['EXACT_LOCATION_PRIVATE', 'WARD_VISIBLE', 'MUNICIPALITY_VISIBLE', 'PROVINCE_VISIBLE']
export const ONBOARDING_STATES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']

export function validateRegistrationInput({ firstName, surname, email, password, confirmPassword }) {
  const errors = {}

  if (!firstName || firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters.'
  }

  if (!surname || surname.trim().length < 2) {
    errors.surname = 'Surname must be at least 2 characters.'
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, and a number.'
  }

  if (!confirmPassword || confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateProfileInput(profile = {}) {
  const errors = {}

  if (!profile.first_name || !profile.first_name.trim()) {
    errors.first_name = 'First name is required.'
  }

  if (!profile.surname || !profile.surname.trim()) {
    errors.surname = 'Surname is required.'
  }

  if (profile.mobile_number && !/^\+?[0-9\s()-]{7,20}$/.test(profile.mobile_number.trim())) {
    errors.mobile_number = 'Enter a valid mobile number.'
  }

  if (profile.preferred_language && !LANGUAGE_OPTIONS.includes(profile.preferred_language)) {
    errors.preferred_language = 'Choose a supported language.'
  }

  if (profile.age_band && !AGE_BANDS.includes(profile.age_band)) {
    errors.age_band = 'Choose a valid age band.'
  }

  if (profile.gender && !GENDER_OPTIONS.includes(profile.gender)) {
    errors.gender = 'Choose a valid gender.'
  }

  if (profile.employment_status && !EMPLOYMENT_STATUS_OPTIONS.includes(profile.employment_status)) {
    errors.employment_status = 'Choose a valid employment status.'
  }

  if (profile.privacy_level && !PRIVACY_LEVELS.includes(profile.privacy_level)) {
    errors.privacy_level = 'Choose a valid privacy level.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function getDisplayName(profile, fallback = 'TPSG user') {
  if (profile) {
    const firstName = profile.first_name || profile.firstName
    const surname = profile.surname || profile.last_name
    const fullName = profile.full_name || profile.fullName

    if (firstName && surname) {
      return `${firstName} ${surname}`.trim()
    }

    if (fullName) {
      return fullName
    }

    if (firstName) {
      return firstName
    }
  }

  return fallback
}

export function isAuthenticatedSession(session) {
  return Boolean(session && session.user)
}

export function buildProfileRecord(userId, firstName, surname) {
  return {
    user_id: userId,
    first_name: firstName.trim(),
    surname: surname.trim(),
    updated_at: new Date().toISOString(),
  }
}

export function calculateProfileCompletion(profile = {}) {
  const requiredFields = ['first_name', 'surname']
  const optionalFields = ['mobile_number', 'preferred_language', 'age_band', 'gender', 'employment_status', 'province', 'municipality', 'ward', 'community', 'street_locality', 'privacy_level']

  const completedRequired = requiredFields.filter((field) => !!profile[field] && String(profile[field]).trim().length > 0).length
  const completedOptional = optionalFields.filter((field) => profile[field] !== undefined && profile[field] !== null && String(profile[field]).trim() !== '').length
  const totalRequired = requiredFields.length
  const totalOptional = optionalFields.length
  const progressPercent = Math.round(((completedRequired + completedOptional) / (totalRequired + totalOptional)) * 100)

  return {
    requiredCompleted: completedRequired,
    requiredTotal: totalRequired,
    optionalCompleted: completedOptional,
    optionalTotal: totalOptional,
    progressPercent,
  }
}

export function getOnboardingState(profile = {}) {
  if (!profile || Object.keys(profile).length === 0) {
    return 'NOT_STARTED'
  }

  if (profile.onboarding_state === 'COMPLETED') {
    return 'COMPLETED'
  }

  if (profile.onboarding_state === 'IN_PROGRESS') {
    return 'IN_PROGRESS'
  }

  const hasMeaningfulData = Object.entries(profile).some(([key, value]) => {
    if (key === 'onboarding_state') {
      return false
    }

    if (typeof value === 'string') {
      return value.trim().length > 0
    }

    if (typeof value === 'boolean') {
      return value === true
    }

    return value !== null && value !== undefined
  })

  return hasMeaningfulData ? 'IN_PROGRESS' : 'NOT_STARTED'
}

export function normalizeAcknowledgementValue(value) {
  if (typeof value === 'string') {
    return value.trim().length > 0 ? value : null
  }

  return value ?? null
}

export function canCompleteOnboarding(profile = {}) {
  const hasRequiredPersonalInfo = Boolean(
    profile.first_name && profile.first_name.trim() && profile.surname && profile.surname.trim(),
  )
  const hasExplicitAcknowledgement = Boolean(
    profile.accepted_at && String(profile.accepted_at).trim().length > 0,
  )

  return hasRequiredPersonalInfo && hasExplicitAcknowledgement
}

export function sanitizePublicProfile(profile = {}) {
  const publicProfile = {
    onboarding_state: profile.onboarding_state || 'NOT_STARTED',
    profile_completion: calculateProfileCompletion(profile).progressPercent,
    privacy_level: profile.privacy_level || 'EXACT_LOCATION_PRIVATE',
  }

  return publicProfile
}

export function canAccessProfile(profileUserId, currentUserId) {
  return String(profileUserId) === String(currentUserId)
}

export function formatCapabilityLabel(capability) {
  return capability
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}
