import re
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("PartnerIQ.FitScorer")

DEFAULT_WEIGHTS = {
    "strategic": 35.0,
    "technical": 40.0,
    "market": 25.0
}

class PartnershipFitScorer:
    """
    Module 4: Dynamic Partnership Fit Scoring Engine.
    Quantifies Strategic Fit, Technical Compatibility, and Market Viability dynamically
    from company capabilities, tech stacks, and scale indicators without hardcoded company branches.
    """

    @classmethod
    def compute_scores(
        cls,
        company_profile: Dict[str, Any],
        risk_evaluation: Dict[str, Any],
        custom_weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        weights = cls._normalize_weights(custom_weights or DEFAULT_WEIGHTS)
        
        name = company_profile.get("name", "Unknown")
        tech_stack = company_profile.get("tech_stack", {})
        
        # 1. Strategic Fit Evaluation (0 - 100) - Dynamic Algorithm
        strategic_submetrics = cls._score_strategic_dimensions(company_profile)
        strategic_score = round(sum(strategic_submetrics.values()) / len(strategic_submetrics), 1)

        # 2. Technical Compatibility Evaluation (0 - 100) - Dynamic Algorithm
        technical_submetrics = cls._score_technical_dimensions(tech_stack)
        technical_score = round(sum(technical_submetrics.values()) / len(technical_submetrics), 1)

        # 3. Market Viability Evaluation (0 - 100) - Dynamic Algorithm
        market_submetrics = cls._score_market_dimensions(company_profile)
        market_score = round(sum(market_submetrics.values()) / len(market_submetrics), 1)

        # Compute Composite Weighted Score
        weighted_score = round(
            (weights["strategic"] * strategic_score +
             weights["technical"] * technical_score +
             weights["market"] * market_score) / 100.0,
            1
        )

        # Risk Gate Impact Verification
        risk_passed = (risk_evaluation.get("gating_status") == "PASS")
        is_conditional = (risk_evaluation.get("gating_status") == "CONDITIONAL_PASS")

        if not risk_passed and not is_conditional:
            partnership_tier = "DISQUALIFIED (Risk Gate Failed)"
            recommendation_level = "DO NOT PROCEED"
            recommendation_badge = "FAIL_DISQUALIFIED"
        elif weighted_score >= 85:
            partnership_tier = "Tier 1: Strategic Alliance (Ideal Fit)"
            recommendation_level = "HIGHLY RECOMMENDED"
            recommendation_badge = "TOP_RECOMMENDED"
        elif weighted_score >= 70:
            partnership_tier = "Tier 2: Strong Commercial Partner"
            recommendation_level = "RECOMMENDED"
            recommendation_badge = "STRONG_CONTENDER"
        elif weighted_score >= 55:
            partnership_tier = "Tier 3: Moderate Ecosystem Partner"
            recommendation_level = "CONDITIONAL APPROVAL"
            recommendation_badge = "MODERATE_FIT"
        else:
            partnership_tier = "Tier 4: Low Strategic Alignment"
            recommendation_level = "LOW PRIORITY"
            recommendation_badge = "LOW_FIT"

        return {
            "company_id": company_profile.get("id"),
            "company_name": name,
            "weights_applied": weights,
            "weighted_fit_score": weighted_score,
            "partnership_tier": partnership_tier,
            "recommendation_level": recommendation_level,
            "recommendation_badge": recommendation_badge,
            "risk_gating_status": risk_evaluation.get("gating_status", "PASS"),
            "dimensions": {
                "strategic": {
                    "score": strategic_score,
                    "weight_percent": weights["strategic"],
                    "contribution": round(strategic_score * (weights["strategic"] / 100.0), 1),
                    "submetrics": strategic_submetrics,
                    "key_strengths": [
                        "High synergy with cloud & enterprise workflows",
                        "Demonstrated go-to-market co-selling and mutual customer reach",
                        "Scalable partner commitment and ecosystem architecture"
                    ]
                },
                "technical": {
                    "score": technical_score,
                    "weight_percent": weights["technical"],
                    "contribution": round(technical_score * (weights["technical"] / 100.0), 1),
                    "submetrics": technical_submetrics,
                    "key_strengths": [
                        f"Modern programmatic APIs ({', '.join(tech_stack.get('api_types', ['REST'])[:3])})",
                        f"Multi-language SDK coverage ({', '.join(tech_stack.get('sdks', ['Python', 'Node.js'])[:3])})",
                        "High availability multi-region cloud deployment"
                    ]
                },
                "market": {
                    "score": market_score,
                    "weight_percent": weights["market"],
                    "contribution": round(market_score * (weights["market"] / 100.0), 1),
                    "submetrics": market_submetrics,
                    "key_strengths": [
                        "Established brand equity and executive market trust",
                        "Proven commercial momentum and capital stability",
                        "High user ratings and verified peer review sentiment"
                    ]
                }
            }
        }

    @classmethod
    def _normalize_weights(cls, weights: Dict[str, float]) -> Dict[str, float]:
        strat = float(weights.get("strategic", DEFAULT_WEIGHTS["strategic"]))
        tech = float(weights.get("technical", DEFAULT_WEIGHTS["technical"]))
        mkt = float(weights.get("market", DEFAULT_WEIGHTS["market"]))
        
        total = strat + tech + mkt
        if total <= 0:
            return DEFAULT_WEIGHTS.copy()
        
        return {
            "strategic": round((strat / total) * 100.0, 1),
            "technical": round((tech / total) * 100.0, 1),
            "market": round((mkt / total) * 100.0, 1)
        }

    @classmethod
    def _score_strategic_dimensions(cls, profile: Dict[str, Any]) -> Dict[str, int]:
        """Dynamically score Strategic Alignment based on capabilities, scale, and integrations"""
        integrations_count = len(profile.get("integrations", []))
        products_count = len(profile.get("products", []))
        stage_str = str(profile.get("funding_stage", "")).lower()

        # Alignment calculation
        base_align = 80
        if "public" in stage_str or "late" in stage_str or "growth" in stage_str:
            base_align += 10
        elif "series" in stage_str:
            base_align += 7

        obj_alignment = min(98, base_align + min(8, products_count * 2))
        eco_synergy = min(98, 75 + min(20, integrations_count * 3))
        co_sell = min(96, 74 + min(20, integrations_count * 2 + products_count * 2))
        partner_commit = min(95, 78 + min(15, products_count * 3))

        return {
            "objective_alignment": obj_alignment,
            "ecosystem_synergy": eco_synergy,
            "co_selling_potential": co_sell,
            "partner_commitment": partner_commit
        }

    @classmethod
    def _score_technical_dimensions(cls, tech_stack: Dict[str, Any]) -> Dict[str, int]:
        """Dynamically score Technical Compatibility based on APIs, SDKs, and infrastructure"""
        apis = tech_stack.get("api_types", [])
        sdks = tech_stack.get("sdks", [])
        clouds = tech_stack.get("cloud_platforms", [])
        security_certs = tech_stack.get("security_features", [])

        # API Maturity calculation
        api_score = 75 + min(22, len(apis) * 5)
        # Bonus for GraphQL or gRPC or Webhooks
        apis_str = " ".join(apis).lower()
        if "graphql" in apis_str: api_score += 2
        if "grpc" in apis_str: api_score += 2
        if "webhook" in apis_str: api_score += 2
        api_maturity = min(99, api_score)

        # Architectural Harmony
        arch_score = 78 + min(12, len(clouds) * 4) + min(8, len(security_certs) * 2)
        architectural_harmony = min(98, arch_score)

        # Integration Velocity
        integration_velocity = min(97, 76 + min(20, len(sdks) * 3))

        # Developer Ecosystem
        dev_eco = min(98, 72 + min(24, len(sdks) * 4))

        return {
            "api_maturity": api_maturity,
            "architectural_harmony": architectural_harmony,
            "integration_velocity": integration_velocity,
            "developer_ecosystem": dev_eco
        }

    @classmethod
    def _score_market_dimensions(cls, profile: Dict[str, Any]) -> Dict[str, int]:
        """Dynamically score Market Viability from employee rating, funding stage, and revenue"""
        stage_str = str(profile.get("funding_stage", "")).lower()
        rating_str = str(profile.get("employee_rating", ""))
        headcount_str = str(profile.get("employee_count", ""))

        # 1. Parse numeric rating out of 5.0
        m = re.search(r'(\d\.\d)', rating_str)
        if m:
            rating_num = float(m.group(1))
            # 4.5/5 -> 90%
            brand_reputation = int(min(99, max(60, rating_num * 20.0)))
        else:
            brand_reputation = 85

        # 2. Market Momentum
        if "public" in stage_str or "ipo" in stage_str:
            momentum = 94
        elif "series" in stage_str:
            momentum = 90
        else:
            momentum = 82

        # 3. Customer Sentiment
        cust_sentiment = min(98, max(75, brand_reputation - 2))

        # 4. Defensibility from scale
        if "1,000" in headcount_str or "3,000" in headcount_str or "5,000" in headcount_str:
            defensibility = 95
        elif "500" in headcount_str:
            defensibility = 88
        else:
            defensibility = 81

        return {
            "market_momentum": momentum,
            "brand_reputation": brand_reputation,
            "customer_sentiment": cust_sentiment,
            "competitive_defensibility": defensibility
        }
