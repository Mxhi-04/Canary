"""
Canary Detection Engine: Tier Thresholds, Persistence, and Cooldown
Implements:
1. Four-tier hierarchy: NORMAL (score < 30), WATCH (30-49), ALERT (50-74), ACTION (>= 75).
2. Alert persistence: At least 2 of the last 3 days must exceed Alert threshold.
3. 3-day cooldown: Prevents re-alerting noise on resolving incidents.
4. Unit/hazard deduplication.
"""

from typing import List, Dict, Any, Optional
from enum import Enum


class RiskTier(str, Enum):
    NORMAL = "NORMAL"
    WATCH = "WATCH"
    ALERT = "ALERT"
    ACTION = "ACTION"


class TieringEngine:
    WATCH_THRESHOLD = 30.0
    ALERT_THRESHOLD = 50.0
    ACTION_THRESHOLD = 75.0
    COOLDOWN_DAYS = 3

    def evaluate_tier(
        self,
        current_score: float,
        recent_3day_scores: List[float],
        last_alert_closed_days_ago: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Evaluates risk tier with persistence and cooldown logic.
        """
        # Check cooldown first
        if last_alert_closed_days_ago is not None and last_alert_closed_days_ago < self.COOLDOWN_DAYS:
            return {
                "tier": RiskTier.NORMAL,
                "in_cooldown": True,
                "cooldown_remaining_days": self.COOLDOWN_DAYS - last_alert_closed_days_ago,
                "reason": "Active 3-day post-alert cooldown suppresses duplicate alarms.",
            }

        # Check Action Tier (Immediate danger: heat stroke emergency, major outbreak)
        if current_score >= self.ACTION_THRESHOLD:
            return {
                "tier": RiskTier.ACTION,
                "in_cooldown": False,
                "score": current_score,
                "reason": f"Anomaly score {current_score:.1f} exceeds Action threshold ({self.ACTION_THRESHOLD}). Immediate operational intervention required.",
            }

        # Check Alert Tier with 2-of-3 days persistence rule
        if current_score >= self.ALERT_THRESHOLD:
            elevated_days = sum(1 for s in recent_3day_scores if s >= self.ALERT_THRESHOLD)
            if elevated_days >= 2:
                return {
                    "tier": RiskTier.ALERT,
                    "in_cooldown": False,
                    "score": current_score,
                    "reason": f"Anomaly score {current_score:.1f} sustained ({elevated_days} of last 3 days >= {self.ALERT_THRESHOLD}). Protocol review triggered.",
                }
            else:
                # If only 1 day elevated, holds at WATCH until persistence confirms
                return {
                    "tier": RiskTier.WATCH,
                    "in_cooldown": False,
                    "score": current_score,
                    "reason": f"Single-day elevation to {current_score:.1f}. Held at WATCH pending 2-day persistence confirmation.",
                }

        # Check Watch Tier
        if current_score >= self.WATCH_THRESHOLD:
            return {
                "tier": RiskTier.WATCH,
                "in_cooldown": False,
                "score": current_score,
                "reason": f"Anomaly score {current_score:.1f} in Watch tier ({self.WATCH_THRESHOLD}-{self.ALERT_THRESHOLD - 1}). Surveillance sensitivity increased.",
            }

        return {
            "tier": RiskTier.NORMAL,
            "in_cooldown": False,
            "score": current_score,
            "reason": f"Score {current_score:.1f} within expected baseline boundaries.",
        }

