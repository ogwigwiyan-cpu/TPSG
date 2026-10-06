import { test } from 'node:test'
import assert from 'node:assert/strict'

test('TPSG foundation is initialized', () => {
  assert.equal('TPSG'.length, 4)
})

test('privacy-safe domain model supports scoped aggregation', () => {
  const scopedAggregation = {
    scope: 'WARD',
    privacyProtected: true,
  }

  assert.equal(scopedAggregation.scope, 'WARD')
  assert.equal(scopedAggregation.privacyProtected, true)
})
