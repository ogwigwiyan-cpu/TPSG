import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildProfileRecord,
  canCompleteOnboarding,
  getOnboardingState,
  isAuthenticatedSession,
  normalizeAcknowledgementValue,
  validateRegistrationInput,
} from '../lib/auth.js'

test('registration input requires valid, privacy-safe identity fields', () => {
  const { isValid, errors } = validateRegistrationInput({
    firstName: 'J',
    surname: '',
    email: 'invalid',
    password: 'weak',
    confirmPassword: 'different',
  })

  assert.equal(isValid, false)
  assert.match(errors.firstName, /at least 2 characters/i)
  assert.match(errors.surname, /at least 2 characters/i)
  assert.match(errors.email, /valid email/i)
  assert.match(errors.password, /at least 8 characters/i)
  assert.match(errors.confirmPassword, /do not match/i)
})

test('registration password confirmation is enforced using secure criteria', () => {
  const validInput = {
    firstName: 'Jane',
    surname: 'Doe',
    email: 'jane@example.com',
    password: 'SecurePass9',
    confirmPassword: 'SecurePass9',
  }

  const { isValid, errors } = validateRegistrationInput(validInput)

  assert.equal(isValid, true)
  assert.deepEqual(errors, {})
})

test('profiles keep user ownership scoped to the authenticated identity', () => {
  const profile = buildProfileRecord('user_123', 'Jane', 'Doe')

  assert.deepEqual(profile, {
    user_id: 'user_123',
    first_name: 'Jane',
    surname: 'Doe',
    updated_at: profile.updated_at,
  })
})

test('new profile starts in the not-started state', () => {
  assert.equal(getOnboardingState({}), 'NOT_STARTED')
  assert.equal(getOnboardingState({ onboarding_state: 'NOT_STARTED' }), 'NOT_STARTED')
})

test('user starts onboarding in progress rather than completed', () => {
  const profile = { first_name: 'Tshepo', surname: 'Ramalapa' }

  assert.equal(getOnboardingState(profile), 'IN_PROGRESS')
  assert.notEqual(getOnboardingState(profile), 'COMPLETED')
})

test('save progress preserves in-progress state and prevents implicit acknowledgement', () => {
  const profile = {
    first_name: 'Tshepo',
    surname: 'Ramalapa',
    onboarding_state: 'IN_PROGRESS',
    accepted_at: '',
  }

  assert.equal(getOnboardingState(profile), 'IN_PROGRESS')
  assert.equal(normalizeAcknowledgementValue(profile.accepted_at), null)
})

test('explicit acknowledgement sets a persisted timestamp', () => {
  const timestamp = '2026-10-06T06:50:00.000Z'

  assert.equal(normalizeAcknowledgementValue(timestamp), timestamp)
})

test('unchecking acknowledgement clears the timestamp', () => {
  assert.equal(normalizeAcknowledgementValue('   '), null)
  assert.equal(normalizeAcknowledgementValue(''), null)
})

test('completion requires both profile data and an explicit acknowledgement', () => {
  const incompleteProfile = { first_name: 'Tshepo', surname: 'Ramalapa' }
  const completeProfile = {
    first_name: 'Tshepo',
    surname: 'Ramalapa',
    accepted_at: '2026-10-06T06:50:00.000Z',
  }

  assert.equal(canCompleteOnboarding(incompleteProfile), false)
  assert.equal(canCompleteOnboarding(completeProfile), true)
})

test('explicit completion state persists without inferring completion from fields', () => {
  const profile = {
    first_name: 'Tshepo',
    surname: 'Ramalapa',
    accepted_at: '2026-10-06T06:50:00.000Z',
    onboarding_state: 'COMPLETED',
  }

  assert.equal(getOnboardingState(profile), 'COMPLETED')
  assert.equal(getOnboardingState({ first_name: 'Tshepo', surname: 'Ramalapa' }), 'IN_PROGRESS')
})

test('authenticated and unauthenticated session states are distinguished explicitly', () => {
  assert.equal(isAuthenticatedSession({ user: { id: 'user_123' } }), true)
  assert.equal(isAuthenticatedSession({ user: null }), false)
  assert.equal(isAuthenticatedSession(null), false)
})
