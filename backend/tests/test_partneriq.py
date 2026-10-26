import os
import sys
import pytest
import asyncio
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from modules.discovery import DiscoveryEngine
from modules.extraction import ExtractionEngine
from modules.risk_engine import RiskValidationEngine
from modules.fit_scorer import PartnershipFitScorer
from modules.decision_matrix import ExecutiveDecisionMatrix
from firebase_db import DatabaseAdapter


# ==============================================================================
# MODULE 1: Discovery & Web Intelligence Tests
# ==============================================================================

def test_module1_evidence_collection_structure():
    """Verify Module 1 extracts evidence structure with source URLs, quotes, and timestamps"""
    discovery = asyncio.run(DiscoveryEngine.discover_and_collect(
        company_name="Cloudflare",
        domain="cloudflare.com",
        industry="Edge Cloud & Cybersecurity"
    ))
    assert discovery["company_name"] == "Cloudflare"
    assert discovery["domain"] == "cloudflare.com"
    assert len(discovery["evidence_sources"]) > 0
    
    first_ev = discovery["evidence_sources"][0]
    assert "source_url" in first_ev
    assert "snippet" in first_ev
    assert "confidence" in first_ev
    assert first_ev["confidence"] >= 0.80


# ==============================================================================
# MODULE 2: AI Information Extraction Tests
# ==============================================================================

def test_module2_profile_extraction():
    """Verify Module 2 extracts structured attributes, founders, tech stack, and APIs"""
    mock_discovery = {
        "company_name": "Acme Payments",
        "domain": "acmepayments.com",
        "industry": "FinTech Infrastructure",
        "raw_snippets": [
            "Acme Payments was founded in 2018 by John Doe and Jane Smith.",
            "Acme provides high-speed RESTful JSON APIs, Webhooks, and gRPC endpoints for credit card processing.",
            "The company is hosted on AWS and Google Cloud, compliant with SOC 2 Type II, ISO 27001, and GDPR.",
            "Acme has 850 employees, Series C funding of $120M, and estimated $85M ARR. Glassdoor rating is 4.4 out of 5 stars."
        ],
        "evidence_sources": [
            {
                "id": "ev_01",
                "source_url": "https://acmepayments.com/about",
                "source_title": "Acme About Us",
                "category": "primary_source",
                "snippet": "Founded in 2018 by John Doe and Jane Smith with 850 employees.",
                "confidence": 0.98,
                "timestamp": "2026-03-01T00:00:00Z"
            }
        ]
    }

    profile = asyncio.run(ExtractionEngine.extract_profile(mock_discovery))
    
    # Assert entity attributes
    assert profile["name"] == "Acme Payments"
    assert profile["domain"] == "acmepayments.com"
    assert profile["founding_year"] == 2018
    assert "John Doe" in profile["founders"]
    assert "850" in profile["employee_count"]
    assert "4.4" in profile["employee_rating"]
    assert "Series C" in profile["funding_stage"]
    assert "$85M" in profile["estimated_revenue"]

    # Assert tech stack
    tech = profile["tech_stack"]
    assert any("AWS" in c for c in tech["cloud_platforms"])
    assert any("REST" in a for a in tech["api_types"])
    assert any("Webhook" in a for a in tech["api_types"])
    assert any("SOC 2" in s for s in tech["security_features"])


# ==============================================================================
# MODULE 3: Mandatory Risk Validation & Gating Tests
# ==============================================================================

def test_module3_clean_company_passes_gate():
    """Verify compliant, solvent company passes all 4 mandatory risk gates"""
    compliant_profile = {
        "id": "comp_safe_co",
        "name": "SafeCo Cloud",
        "funding_stage": "Series B Funded ($45M)",
        "estimated_revenue": "$25M ARR",
        "profitability_status": "Capitalized & Solvent",
        "tech_stack": {
            "security_features": ["SOC 2 Type II", "ISO 27001", "GDPR Compliant"]
        },
        "evidence_sources": [
            {
                "source_title": "Security Whitepaper",
                "snippet": "SafeCo maintains SOC 2 Type II and ISO 27001 certifications with clean annual audits.",
                "category": "compliance"
            }
        ]
    }

    risk_eval = RiskValidationEngine.evaluate_risks(compliant_profile)
    assert risk_eval["gating_status"] == "PASS"
    assert risk_eval["qualification_status"] == "QUALIFIED"
    assert risk_eval["composite_risk_score"] >= 80.0
    assert risk_eval["mandatory_rules_passed"] == 4


def test_module3_sanctioned_company_fails_legal_gate():
    """Verify company with trade sanctions is DISQUALIFIED by mandatory risk rules"""
    sanctioned_profile = {
        "id": "comp_risky_entity",
        "name": "Sanctioned Entity LLC",
        "funding_stage": "Distressed (<2 mo runway)",
        "estimated_revenue": "$1M",
        "profitability_status": "Insolvent",
        "tech_stack": {
            "security_features": [] # Missing SOC 2 & ISO 27001
        },
        "evidence_sources": [
            {
                "source_title": "Commerce Department Sanction Alert",
                "snippet": "Entity is subject to active trade sanctions and federal fraud indictment.",
                "category": "risk_audit"
            },
            {
                "source_title": "Critical Breach Report",
                "snippet": "Catastrophic ransomware attack and unmitigated zero-day exploit leaked customer records.",
                "category": "risk_audit"
            }
        ]
    }

    risk_eval = RiskValidationEngine.evaluate_risks(sanctioned_profile)
    assert risk_eval["gating_status"] == "FAIL"
    assert risk_eval["qualification_status"] == "DISQUALIFIED"
    assert "Gating FAILED" in risk_eval["gate_verdict_message"]
    assert risk_eval["mandatory_rules_passed"] < 4


# ==============================================================================
# MODULE 4: Mathematical Fit Scoring Tests
# ==============================================================================

def test_module4_fit_scoring_and_dynamic_weights():
    """Verify mathematical fit score computation and dynamic weight normalization"""
    sample_profile = {
        "id": "comp_tech_pro",
        "name": "TechPro Engine",
        "funding_stage": "Public Entity (NASDAQ: TECH)",
        "employee_count": "4,500 Employees",
        "employee_rating": "4.5 / 5.0 (Glassdoor)",
        "tech_stack": {
            "cloud_platforms": ["AWS", "GCP"],
            "api_types": ["REST API", "GraphQL", "Webhooks", "gRPC"],
            "sdks": ["Python", "Node.js", "Go", "Java", "Ruby", "C#"],
            "security_features": ["SOC 2 Type II", "ISO 27001"]
        },
        "integrations": ["Salesforce", "Slack", "AWS", "GitHub", "Jira"],
        "products": [{"name": "Core"}, {"name": "APIs"}, {"name": "Cloud Hub"}]
    }

    dummy_passed_gate = {"gating_status": "PASS", "qualification_status": "QUALIFIED"}

    # Test Default Weights (35% Strategic, 40% Technical, 25% Market)
    scores_default = PartnershipFitScorer.compute_scores(sample_profile, dummy_passed_gate)
    assert 80.0 <= scores_default["weighted_fit_score"] <= 100.0
    assert scores_default["recommendation_badge"] in ["TOP_RECOMMENDED", "STRONG_CONTENDER"]

    # Test Dynamic Weight Adjustment (e.g. Technical 70%, Strategic 15%, Market 15%)
    custom_weights = {"strategic": 15, "technical": 70, "market": 15}
    scores_custom = PartnershipFitScorer.compute_scores(sample_profile, dummy_passed_gate, custom_weights)
    assert scores_custom["weights_applied"]["technical"] == 70.0
    assert scores_custom["weights_applied"]["strategic"] == 15.0
    assert scores_custom["weights_applied"]["market"] == 15.0
    assert 80.0 <= scores_custom["weighted_fit_score"] <= 100.0


# ==============================================================================
# MODULE 5: Executive Decision Matrix Tests
# ==============================================================================

def test_module5_decision_matrix_and_ranking():
    """Verify side-by-side comparative matrix generation and leaderboard ranking"""
    company_a = {
        "id": "comp_a",
        "name": "Company Alpha",
        "domain": "alpha.com",
        "industry": "Cloud Infrastructure",
        "tech_stack": {"api_types": ["REST", "gRPC"], "sdks": ["Go", "Python"], "cloud_platforms": ["AWS"]},
        "employee_rating": "4.5 / 5.0",
        "funding_stage": "Public",
        "evidence_sources": [{"source_url": "https://alpha.com", "snippet": "Alpha cloud"}]
    }
    company_b = {
        "id": "comp_b",
        "name": "Company Beta",
        "domain": "beta.com",
        "industry": "DevTools",
        "tech_stack": {"api_types": ["REST"], "sdks": ["JavaScript"], "cloud_platforms": ["AWS"]},
        "employee_rating": "4.0 / 5.0",
        "funding_stage": "Series A",
        "evidence_sources": [{"source_url": "https://beta.com", "snippet": "Beta devtools"}]
    }

    evaluations = {
        "comp_a": {"risk_evaluation": {"gating_status": "PASS", "qualification_status": "QUALIFIED"}},
        "comp_b": {"risk_evaluation": {"gating_status": "PASS", "qualification_status": "QUALIFIED"}}
    }

    matrix = ExecutiveDecisionMatrix.generate_comparison_matrix(
        companies=[company_a, company_b],
        evaluations=evaluations,
        custom_weights={"strategic": 35, "technical": 40, "market": 25}
    )

    assert matrix["total_candidates"] == 2
    assert len(matrix["candidates"]) == 2
    assert matrix["candidates"][0]["rank"] == 1
    assert matrix["candidates"][1]["rank"] == 2
    assert matrix["executive_summary"]["top_recommendation"] is not None


# ==============================================================================
# DATABASE & FIRESTORE ADAPTER TESTS
# ==============================================================================

def test_database_adapter_status():
    """Verify database adapter reports active connection and collection counts"""
    status = DatabaseAdapter.get_status()
    assert "mode" in status
    assert "collections" in status
    assert status["collections"]["companies"] >= 1
