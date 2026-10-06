export type DecisionEligibility = 'REGISTERED_CITIZEN' | 'WARD_RESIDENT' | 'MUNICIPAL_RESIDENT' | 'PROVINCIAL_RESIDENT';
export type GeographicScope = 'NATIONAL' | 'PROVINCIAL' | 'MUNICIPAL' | 'WARD' | 'COMMUNITY';

export interface ParticipationRecord {
  privateParticipantId: string;
  scope: GeographicScope;
  participatedAt: string;
}

export interface AggregateResult {
  scope: GeographicScope;
  geographicCode: string;
  totalParticipants: number;
  aggregateCounts: Record<string, number>;
  privacyProtected: boolean;
}

export interface CollectiveDecision {
  id: string;
  title: string;
  description: string;
  scope: GeographicScope;
  eligibility: DecisionEligibility;
  createdAt: string;
}
