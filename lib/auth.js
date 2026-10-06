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
