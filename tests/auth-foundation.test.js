import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildProfileRecord,
  isAuthenticatedSession,
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

test('authenticated and unauthenticated session states are distinguished explicitly', () => {
  assert.equal(isAuthenticatedSession({ user: { id: 'user_123' } }), true)
  assert.equal(isAuthenticatedSession({ user: null }), false)
  assert.equal(isAuthenticatedSession(null), false)
})
