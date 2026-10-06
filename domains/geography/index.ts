export type GeographicLevel =
  | 'COUNTRY'
  | 'PROVINCE'
  | 'MUNICIPALITY'
  | 'WARD'
  | 'COMMUNITY'
  | 'STREET_LOCALITY'

export type MunicipalityType = 'METROPOLITAN' | 'CITY' | 'MUNICIPALITY' | 'DISTRICT' | 'LOCAL'

export interface Country {
  id: string
  code: string
  name: string
  created_at: string
  updated_at: string
}

export interface Province {
  id: string
  country_id: string
  code: string
  name: string
  created_at: string
  updated_at: string
}

export interface Municipality {
  id: string
  province_id: string
  code: string
  name: string
  municipality_type: MunicipalityType
  created_at: string
  updated_at: string
}

export interface Ward {
  id: string
  municipality_id: string
  code: string
  name: string
  created_at: string
  updated_at: string
}

export interface Community {
  id: string
  ward_id: string | null
  code: string
  name: string
  locality_type: 'COMMUNITY' | 'SUBURB' | 'TOWNSHIP' | 'VILLAGE' | 'LOCALITY' | 'OTHER'
  created_at: string
  updated_at: string
}

export interface StreetLocality {
  id: string
  community_id: string | null
  code: string
  name: string
  created_at: string
  updated_at: string
}

export interface GeographicAssociation {
  id: string
  user_id: string
  country_id: string | null
  province_id: string | null
  municipality_id: string | null
  ward_id: string | null
  community_id: string | null
  street_locality_id: string | null
  exact_location_private: boolean
  created_at: string
  updated_at: string
}

export interface GeographicHierarchyValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function buildGeographicAssociation(input: {
  user_id: string
  country_id?: string | null
  province_id?: string | null
  municipality_id?: string | null
  ward_id?: string | null
  community_id?: string | null
  street_locality_id?: string | null
  exact_location_private?: boolean
  created_at?: string
  updated_at?: string
}): GeographicAssociation {
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

export function validateGeographicHierarchy(input: {
  country_id?: string | null
  province_id?: string | null
  municipality_id?: string | null
  ward_id?: string | null
  community_id?: string | null
  municipality_province_id?: string | null
  ward_municipality_id?: string | null
  community_ward_id?: string | null
}): GeographicHierarchyValidationResult {
  const errors: Record<string, string> = {}

  if (input.municipality_id && input.province_id && input.municipality_province_id && input.municipality_province_id !== input.province_id) {
    errors.municipality_id = 'Municipality must belong to the selected province.'
  }

  if (input.ward_id && input.municipality_id && input.ward_municipality_id && input.ward_municipality_id !== input.municipality_id) {
    errors.ward_id = 'Ward must belong to the selected municipality.'
  }

  if (input.community_id && input.ward_id && input.community_ward_id && input.community_ward_id !== input.ward_id) {
    errors.community_id = 'Community must belong to the selected ward.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function describeGeographicSelection(level: GeographicLevel, value?: string | null): string {
  if (!value) {
    return `Select ${level.toLowerCase().replace('_', ' ')}.`
  }

  return value
}
