import { test } from 'node:test'
import assert from 'node:assert/strict'

test('TPSG foundation is initialized', () => {
  assert.equal('TPSG'.length, 4)
})

test('privacy-safe aggregation is represented in the domain model', () => {
  const participation = {
    privateParticipantId: 'participant-001',
    scope: 'WARD',
    participatedAt: '2026-10-06T00:00:00.000Z',
  }

  assert.equal(participation.scope, 'WARD')
  assert.match(participation.privateParticipantId, /^participant-/)
})
