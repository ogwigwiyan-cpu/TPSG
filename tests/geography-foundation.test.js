import test from 'node:test'
import assert from 'node:assert/strict'

function validateGeographicHierarchy(input) {
  const errors = {}

  if (input.municipality_id && input.province_id && input.municipality_province_id && input.municipality_province_id !== input.province_id) {
    errors.municipality_id = 'Municipality must belong to the selected province.'
  }

  if (input.ward_id && input.municipality_id && input.ward_municipality_id && input.ward_municipality_id !== input.municipality_id) {
    errors.ward_id = 'Ward must belong to the selected municipality.'
  }

  if (input.community_id && input.ward_id && input.community_ward_id && input.community_ward_id !== input.ward_id) {
    errors.community_id = 'Community must belong to the selected ward.'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

function buildGeographicAssociation(input) {
  const now = new Date().toISOString()

  return {
    id: input.user_id,
    user_id: input.user_id,
    country_id: input.country_id ?? null,
    province_id: input.province_id ?? null,
    municipality_id: input.municipality_id ?? null,
    ward_id: input.ward_id ?? null,
    community_id: input.community_id ?? null,
    street_locality_id: input.street_locality_id ?? null,
    exact_location_private: input.exact_location_private ?? true,
    created_at: input.created_at ?? now,
    updated_at: input.updated_at ?? now,
  }
}

function describeGeographicSelection(level, value) {
  if (!value) {
    return `Select ${level.toLowerCase().replace('_', ' ')}.`
  }

  return value
}

test('province, municipality, ward, and community hierarchy validate correctly', () => {
  const result = validateGeographicHierarchy({
    province_id: 'province_1',
    municipality_id: 'municipality_1',
    municipality_province_id: 'province_1',
    ward_id: 'ward_1',
    ward_municipality_id: 'municipality_1',
    community_id: 'community_1',
    community_ward_id: 'ward_1',
  })

  assert.equal(result.isValid, true)
  assert.deepEqual(result.errors, {})
})

test('municipality hierarchy validation fails when the province does not match', () => {
  const result = validateGeographicHierarchy({
    province_id: 'province_1',
    municipality_id: 'municipality_2',
    municipality_province_id: 'province_3',
  })

  assert.equal(result.isValid, false)
  assert.match(result.errors.municipality_id, /must belong to the selected province/i)
})

test('ward hierarchy validation fails when the municipality does not match', () => {
  const result = validateGeographicHierarchy({
    municipality_id: 'municipality_1',
    ward_id: 'ward_2',
    ward_municipality_id: 'municipality_3',
  })

  assert.equal(result.isValid, false)
  assert.match(result.errors.ward_id, /must belong to the selected municipality/i)
})

test('citizen geographic association keeps exact location private by default', () => {
  const association = buildGeographicAssociation({
    user_id: 'user_123',
    province_id: 'province_1',
    municipality_id: 'municipality_1',
    ward_id: 'ward_1',
  })

  assert.equal(association.user_id, 'user_123')
  assert.equal(association.exact_location_private, true)
  assert.equal(association.province_id, 'province_1')
})

test('geographic selection labels are descriptive and safe for empty states', () => {
  assert.equal(describeGeographicSelection('PROVINCE'), 'Select province.')
  assert.equal(describeGeographicSelection('WARD', 'Ward 12'), 'Ward 12')
})
