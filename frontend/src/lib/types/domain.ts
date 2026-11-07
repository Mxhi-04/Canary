export type DemoRole = 'hse_officer' | 'oh_lead' | 'public_health' | 'regulator';

export interface DemoRoleInfo {
  id: DemoRole;
  title: string;
  shortName: string;
  description: string;
  scope: string;
  hasHealthDetail: boolean;
  permittedUnitIds: string[] | 'all';
}

export type RiskTier = 'WATCH' | 'ALERT' | 'ACTION';

export type TierStatus = 'active' | 'under_review' | 'resolved';

export type HazardType = 'respiratory' | 'gastrointestinal' | 'heat_stress' | 'injury';

export type ProvenanceKind = 'real' | 'simulated' | 'illustrative' | 'approximation';

export type UnitType = 'construction' | 'accommodation' | 'logistics' | 'office';

export type FeedQualityStatus = 'ok' | 'stale' | 'missing';

export interface District {
  id: string;
  name: string;
  code: string;
  riskTier: RiskTier;
  activeAlertCount: number;
  averageCompleteness: number;
}

export interface MonitoringUnit {
  id: string;
  name: string;
  districtId: string;
  districtName: string;
  unitType: UnitType;
  latitude: number;
  longitude: number;
  headcountBand: string;
  currentTier: RiskTier | null;
  completeness: number;
  openAlertCount: number;
  feedStatus: FeedQualityStatus;
  primaryRiskReason?: string;
  observedTrendPercent?: number;
}

export interface ObservedVsExpectedPoint {
  date: string;
  observed: number | null; // null if missing
  expected: number;
  expectedMin: number;
  expectedMax: number;
  isExceedance?: boolean;
}

export interface SignalStreamData {
  streamId: string;
  streamName: string;
  category: string;
  unit: string;
  provenance: ProvenanceKind;
  sourceName: string;
  completeness: number;
  history: ObservedVsExpectedPoint[];
}

export interface ContributionItem {
  stream: string;
  label: string;
  observed: number | string;
  expected: number | string;
  contribution: number; // percentage or relative value
  capped: boolean;
  correlationDiscountApplied?: boolean;
  provenance: ProvenanceKind;
  missing?: boolean;
}

export interface Recommendation {
  action: string;
  ownerRole: DemoRole;
  ownerRoleLabel: string;
  evidence: string[];
  assumptions: string[];
  escalationPath: string;
  reviewBy: string;
  guidanceReference: string;
  guidanceUrl?: string;
}

export interface AlertDetail {
  id: string;
  title: string;
  tier: RiskTier;
  hazard: HazardType;
  hazardLabel: string;
  status: TierStatus;
  unit: {
    id: string;
    name: string;
    district: string;
    unitType: UnitType;
  };
  window: {
    start: string;
    end: string;
  };
  detectedAt: string;
  summary: string;
  observedVsExpected: SignalStreamData[];
  contributions: ContributionItem[];
  overallCompleteness: number;
  missingStreams: string[];
  freshness: 'fresh' | 'delayed' | 'stale';
  uncertaintyScore: 'low' | 'moderate' | 'high';
  persistenceRuleMet: boolean;
  recommendation: Recommendation;
  provenance: {
    environmental: 'real';
    outcomes: 'simulated';
  };
}

export interface FeedHealthItem {
  id: string;
  unitId: string;
  unitName: string;
  streamName: string;
  source: string;
  status: FeedQualityStatus;
  completeness: number;
  lastSuccess: string;
  issueDescription?: string;
}

export interface AuditEvent {
  id: string;
  actorRole: DemoRole;
  actorLabel: string;
  eventType: 'VIEW_ALERT' | 'ROLE_SWITCH' | 'VIEW_PROTECTED_UNIT' | 'EXPORT_DATA' | 'SIMULATION_STEP' | 'SIGN_OFF_ATTEMPT';
  resourceType: string;
  resourceId: string;
  timestamp: string;
  details: string;
  ipMasked: string;
}

