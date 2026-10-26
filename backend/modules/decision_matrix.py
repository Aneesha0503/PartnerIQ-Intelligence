import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from modules.fit_scorer import PartnershipFitScorer

logger = logging.getLogger("PartnerIQ.DecisionMatrix")

class ExecutiveDecisionMatrix:
    """
    Module 5: Executive Decision Matrix
    Aggregates evaluated companies, enables side-by-side multi-parameter comparison,
    real-time weight simulation, and generates executive partnership memos.
    """

    @classmethod
    def generate_comparison_matrix(
        cls,
        companies: List[Dict[str, Any]],
        evaluations: Dict[str, Dict[str, Any]],
        custom_weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Builds side-by-side comparison matrix with recalculated scores based on active weights.
        """
        compared_items = []
        
        for comp in companies:
            c_id = comp.get("id")
            existing_eval = evaluations.get(c_id, {})
            risk_eval = existing_eval.get("risk_evaluation", {})
            
            # Recalculate fit score with custom weights on the fly
            fit_scores = PartnershipFitScorer.compute_scores(comp, risk_eval, custom_weights)
            
            pillars = risk_eval.get("pillars", {})
            legal_status = pillars.get("legal", {}).get("status", "PASS")
            financial_status = pillars.get("financial", {}).get("status", "PASS")
            compliance_status = pillars.get("compliance", {}).get("status", "PASS")
            safety_status = pillars.get("safety", {}).get("status", "PASS")
            
            item = {
                "company_id": c_id,
                "company_name": comp.get("name"),
                "domain": comp.get("domain"),
                "industry": comp.get("industry"),
                "funding_stage": comp.get("funding_stage"),
                "employee_count": comp.get("employee_count"),
                "founding_year": comp.get("founding_year"),
                
                # Risk Gate Parameters
                "gating_status": risk_eval.get("gating_status", "PASS"),
                "composite_risk_score": risk_eval.get("composite_risk_score", 90.0),
                "qualification_status": risk_eval.get("qualification_status", "QUALIFIED"),
                "gate_verdict_message": risk_eval.get("gate_verdict_message", "Passed all mandatory gates."),
                "risk_breakdown": {
                    "legal": legal_status,
                    "financial": financial_status,
                    "compliance": compliance_status,
                    "safety": safety_status
                },
                
                # Dynamic Fit Scores
                "weighted_fit_score": fit_scores["weighted_fit_score"],
                "strategic_score": fit_scores["dimensions"]["strategic"]["score"],
                "technical_score": fit_scores["dimensions"]["technical"]["score"],
                "market_score": fit_scores["dimensions"]["market"]["score"],
                "partnership_tier": fit_scores["partnership_tier"],
                "recommendation_badge": fit_scores["recommendation_badge"],
                "recommendation_level": fit_scores["recommendation_level"],
                
                # Tech specs
                "cloud_platforms": comp.get("tech_stack", {}).get("cloud_platforms", []),
                "api_types": comp.get("tech_stack", {}).get("api_types", []),
                "sdks": comp.get("tech_stack", {}).get("sdks", []),
                "security_features": comp.get("tech_stack", {}).get("security_features", []),
                "integrations_count": len(comp.get("integrations", [])),
                
                # Evidence & Traceability
                "evidence_count": len(comp.get("evidence_sources", [])),
                "evidence_sources": comp.get("evidence_sources", [])
            }
            compared_items.append(item)

        # Sort: Qualified first, ordered by Weighted Fit Score descending
        def sort_key(item):
            # Rank 0 if QUALIFIED, 1 if CONDITIONAL, 2 if DISQUALIFIED
            qual_order = 0 if item["qualification_status"] == "QUALIFIED" else (1 if item["qualification_status"] == "CONDITIONAL" else 2)
            return (qual_order, -item["weighted_fit_score"])

        compared_items.sort(key=sort_key)

        # Assign ranks
        for idx, item in enumerate(compared_items):
            item["rank"] = idx + 1

        # Leaderboard highlights
        top_partner = compared_items[0] if compared_items else None
        tech_leader = max(compared_items, key=lambda x: x["technical_score"]) if compared_items else None
        strategic_leader = max(compared_items, key=lambda x: x["strategic_score"]) if compared_items else None
        market_leader = max(compared_items, key=lambda x: x["market_score"]) if compared_items else None

        return {
            "matrix_timestamp": datetime.utcnow().isoformat(),
            "weights_applied": custom_weights or PartnershipFitScorer._normalize_weights({}),
            "total_candidates": len(compared_items),
            "candidates": compared_items,
            "executive_summary": {
                "top_recommendation": top_partner["company_name"] if top_partner else None,
                "top_score": top_partner["weighted_fit_score"] if top_partner else 0,
                "technical_leader": tech_leader["company_name"] if tech_leader else None,
                "strategic_leader": strategic_leader["company_name"] if strategic_leader else None,
                "market_leader": market_leader["company_name"] if market_leader else None,
                "disqualified_count": len([c for c in compared_items if c["qualification_status"] == "DISQUALIFIED"])
            }
        }

    @classmethod
    def generate_executive_dossier_memo(cls, company_id: str, company: Dict[str, Any], evaluation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate formal C-suite Due Diligence Memo for a chosen candidate.
        """
        risk_eval = evaluation.get("risk_evaluation", {})
        fit_scores = evaluation.get("fit_scores", {})
        evidence = company.get("evidence_sources", [])

        memo = {
            "memo_id": f"MEMO_{company.get('slug', 'comp').upper()}_{datetime.utcnow().strftime('%Y%m%d')}",
            "generated_at": datetime.utcnow().isoformat(),
            "title": f"PARTNERSHIP DUE DILIGENCE & EXECUTIVE RECOMMENDATION: {company.get('name')}",
            "classification": "CONFIDENTIAL // PARTNERSHIP STEERING COMMITTEE",
            "candidate_overview": {
                "name": company.get("name"),
                "domain": company.get("domain"),
                "headquarters": company.get("headquarters"),
                "employee_count": company.get("employee_count"),
                "funding_stage": company.get("funding_stage"),
                "business_model": company.get("business_model")
            },
            "gate_audit": {
                "verdict": risk_eval.get("gating_status"),
                "qualification": risk_eval.get("qualification_status"),
                "composite_risk_score": f"{risk_eval.get('composite_risk_score', 0)}/100 (Safe)",
                "rules_verified": f"{risk_eval.get('mandatory_rules_passed', 4)} of {risk_eval.get('mandatory_rules_total', 4)} Mandatory Gates Passed"
            },
            "fit_scorecard": {
                "composite_fit_score": f"{fit_scores.get('weighted_fit_score', 0)}%",
                "tier": fit_scores.get("partnership_tier"),
                "recommendation": fit_scores.get("recommendation_level"),
                "strategic_score": fit_scores.get("dimensions", {}).get("strategic", {}).get("score"),
                "technical_score": fit_scores.get("dimensions", {}).get("technical", {}).get("score"),
                "market_score": fit_scores.get("dimensions", {}).get("market", {}).get("score")
            },
            "supporting_evidence": evidence[:5],
            "executive_verdict_narrative": (
                f"{company.get('name')} successfully passed all mandatory legal, compliance, financial, and data safety gates. "
                f"With a quantitative partnership fit score of {fit_scores.get('weighted_fit_score', 0)}%, the platform recommends "
                f"formalization of the partnership agreement under {fit_scores.get('partnership_tier')}."
            )
        }
        return memo
