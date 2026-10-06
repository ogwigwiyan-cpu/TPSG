export type DecisionEligibility =
  | 'REGISTERED_CITIZEN'
  | 'WARD_RESIDENT'
  | 'MUNICIPAL_RESIDENT'
  | 'PROVINCIAL_RESIDENT'

export type GeographicScope = 'NATIONAL' | 'PROVINCIAL' | 'MUNICIPAL' | 'WARD' | 'COMMUNITY'

export interface ParticipationRecord {
  privateParticipantId: string
  scope: GeographicScope
  participatedAt: string
}

export interface AggregateResult {
  scope: GeographicScope
  geographicCode: string
  totalParticipants: number
  aggregateCounts: Record<string, number>
  privacyProtected: boolean
}

export interface CollectiveDecision {
  id: string
  title: string
  description: string
  scope: GeographicScope
  eligibility: DecisionEligibility
  createdAt: string
}

export interface IdentityRecord {
  id: string
  privateRecordId: string
  createdAt: string
}

export interface GeographyBoundary {
  id: string
  scope: GeographicScope
  code: string
  name: string
}

export interface CivicActionRecord {
  id: string
  title: string
  summary: string
  scope: GeographicScope
  createdAt: string
}

export interface TaxonomyNode {
  id: string
  key: string
  parentId?: string
  label: string
}

export interface ResponsibilityRecord {
  id: string
  title: string
  owner: string
  scope: GeographicScope
  createdAt: string
}

export interface EvidenceRecord {
  id: string
  source: string
  hash: string
  createdAt: string
}

export interface VerificationResult {
  id: string
  subjectId: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  checkedAt: string
}

export interface PrioritySignal {
  id: string
  subject: string
  weight: number
  createdAt: string
}

export interface PoliticalContext {
  id: string
  scope: GeographicScope
  summary: string
  createdAt: string
}

export interface ElectionPlan {
  id: string
  title: string
  scope: GeographicScope
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
}

export interface GovernanceStructure {
  id: string
  name: string
  scope: GeographicScope
  description: string
}

export interface CommitmentRecord {
  id: string
  title: string
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED'
  createdAt: string
}

export interface PlanRecord {
  id: string
  title: string
  phases: string[]
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETE'
}

export interface ProjectRecord {
  id: string
  name: string
  status: 'PLANNED' | 'IN_PROGRESS' | 'ACTIVE'
}

export interface FinanceRecord {
  id: string
  code: string
  amount: number
  currency: string
}

export interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
}

export interface NotificationRecord {
  id: string
  template: string
  audience: string
  sentAt: string
}

export interface AnalyticsSnapshot {
  id: string
  label: string
  createdAt: string
  values: Record<string, number>
}

export interface AuditTrailEntry {
  id: string
  actor: string
  action: string
  timestamp: string
}

export interface SystemCapability {
  id: string
  name: string
  enabled: boolean
  summary: string
}

export interface PowerDomainFoundation {
  participation: ParticipationRecord[]
  decisions: CollectiveDecision[]
  eligibility: DecisionEligibility[]
  scope: GeographicScope[]
  auditability: AuditTrailEntry[]
}
