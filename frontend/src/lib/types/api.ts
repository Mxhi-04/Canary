import {
  AlertDetail,
  AuditEvent,
  District,
  FeedHealthItem,
  MonitoringUnit,
  RiskTier,
  SignalStreamData
} from './domain';

export interface UnitsApiResponse {
  districts: District[];
  units: MonitoringUnit[];
  overallCompleteness: number;
  totalSites: number;
  sitesAtAlertOrAbove: number;
  openActionAlerts: number;
  deltas: {
    completenessDelta: number;
    sitesAtAlertDelta: number;
    openActionsDelta: number;
    comparisonPeriod: string;
  };
}

export interface AlertsListResponse {
  alerts: AlertDetail[];
  total: number;
  unacknowledgedActionCount: number;
}

export interface BacktestComparatorRow {
  methodId: string;
  methodName: string;
  signalsUsed: string;
  isCanary?: boolean;
  sensitivity: number; // e.g. 0.912
  leadTimeDays: number; // e.g. +2.8 days
  ppv: number; // e.g. 0.845
  falseAlertsPerSiteMonth: number; // e.g. 0.72
  latencySeconds: number; // e.g. 1.4s
}

export interface AblationResult {
  condition: string;
  description: string;
  sensitivityDrop: number;
  leadTimeLossDays: number;
  falseAlertIncrease: number;
}

export interface BacktestSummaryResponse {
  runId: string;
  calibrationSeed: number;
  testSeed: number;
  testedScenariosCount: number;
  syntheticEventCount: number;
  comparators: BacktestComparatorRow[];
  ablations: AblationResult[];
  datasetDateRange: string;
  isSyntheticEvaluated: true;
}

export interface ReplayDayState {
  dayNumber: number;
  calendarDate: string;
  scenarioId: string;
  scenarioTitle: string;
  currentTier: RiskTier | null;
  observedHazardValue: number;
  observedClinicCount: number | null;
  observedAbsenceCount: number | null;
  canaryMarker?: {
    tier: RiskTier;
    label: string;
    details: string;
  };
  comparatorMarkers: {
    methodName: string;
    alertRaised: boolean;
    tierLabel?: string;
  }[];
  groundTruthActive: boolean;
  groundTruthEventName?: string;
  evidenceSnapshot: {
    title: string;
    summary: string;
    contributingFeeds: string[];
  };
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  subtitle: string;
  hazardType: string;
  siteName: string;
  startDate: string;
  totalDays: number;
  groundTruthWindow: {
    startDay: number;
    endDay: number;
  };
  description: string;
}

export interface SuppressionDemoRow {
  id: string;
  siteName: string;
  category: string;
  rawCount: number;
  maskedValue: string | number;
  isSuppressed: boolean;
  isSecondarySuppressed: boolean;
  suppressionReason?: string;
}

export interface IngestValidationTestResult {
  testId: string;
  name: string;
  payload: Record<string, unknown>;
  expectedStatus: 'accepted' | 'rejected';
  actualStatus: 'accepted' | 'rejected';
  rejectionReason?: string;
}
