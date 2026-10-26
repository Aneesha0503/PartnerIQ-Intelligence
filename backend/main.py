import os
import sys
from pathlib import Path

# Ensure backend directory is in sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import HOST, PORT
from firebase_db import DatabaseAdapter
from seed_data import seed_initial_benchmark_partners
from modules.discovery import DiscoveryEngine
from modules.extraction import ExtractionEngine
from modules.risk_engine import RiskValidationEngine
from modules.fit_scorer import PartnershipFitScorer, DEFAULT_WEIGHTS
from modules.decision_matrix import ExecutiveDecisionMatrix

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("PartnerIQ.API")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing PartnerIQ AI Platform backend...")
    # Seed bootstrap partners asynchronously in background so port binds immediately
    asyncio.create_task(seed_initial_benchmark_partners())
    yield
    logger.info("Shutting down PartnerIQ AI Platform backend...")

app = FastAPI(
    title="PartnerIQ — AI-Powered Partnership Intelligence Platform",
    description="Enterprise AI platform for partner discovery, web intelligence, mandatory risk gating, and quantitative partnership fit scoring.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Request Models
class DiscoverRequest(BaseModel):
    query: str
    max_results: Optional[int] = 5

class AnalyzeCompanyRequest(BaseModel):
    company_name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    custom_weights: Optional[Dict[str, float]] = None

class RecalculateFitRequest(BaseModel):
    company_id: str
    weights: Dict[str, float]

class MatrixRequest(BaseModel):
    company_ids: Optional[List[str]] = None
    weights: Optional[Dict[str, float]] = None

class EvaluateRulesRequest(BaseModel):
    company_id: str
    rule_overrides: Optional[Dict[str, bool]] = None
    custom_rules: Optional[List[Dict[str, Any]]] = None


# Endpoints

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "PartnerIQ Enterprise AI", "version": "1.0.0"}

@app.get("/api/status")
def get_system_status():
    """Return backend status and Firebase connectivity information"""
    firebase_status = DatabaseAdapter.get_status()
    return {
        "status": "healthy",
        "firebase": firebase_status,
        "default_weights": DEFAULT_WEIGHTS
    }

@app.post("/api/discovery/search")
async def search_partners(req: DiscoverRequest):
    """Module 1: Search web sources for prospective partners based on domain or niche"""
    results = await asyncio.to_thread(DiscoveryEngine.search_web_sources, req.query, req.max_results or 5)
    return {
        "query": req.query,
        "results_count": len(results),
        "results": results
    }

@app.post("/api/discovery/analyze")
async def analyze_company(req: AnalyzeCompanyRequest):
    """
    End-to-End Orchestrated Pipeline:
    Module 1: Discovery & Web Evidence Collection
    Module 2: AI Information Extraction (Attributes, Stack, Capabilities)
    Module 3: Mandatory Risk Validation & Gating (PASS/FAIL)
    Module 4: Partnership Fit Scoring (Strategic, Technical, Market)
    Saves results into Firebase Firestore.
    """
    if not req.company_name.strip():
        raise HTTPException(status_code=400, detail="Company name is required.")

    logger.info(f"Initiating end-to-end analysis for '{req.company_name}'...")

    # Step 1: Web Discovery & Evidence Harvesting
    discovery_data = await DiscoveryEngine.discover_and_collect(
        company_name=req.company_name,
        domain=req.domain,
        industry=req.industry
    )

    # Step 2: AI Information Extraction
    company_profile = await ExtractionEngine.extract_profile(discovery_data)
    company_id = company_profile["id"]

    # Step 3: Mandatory Risk Validation & Gating
    risk_evaluation = RiskValidationEngine.evaluate_risks(company_profile)

    # Step 4: Partnership Fit Scoring
    fit_scores = PartnershipFitScorer.compute_scores(
        company_profile=company_profile,
        risk_evaluation=risk_evaluation,
        custom_weights=req.custom_weights
    )

    # Persist in Firebase
    DatabaseAdapter.save_company(company_id, company_profile)
    DatabaseAdapter.save_evaluation(company_id, {
        "company_id": company_id,
        "company_name": company_profile["name"],
        "risk_evaluation": risk_evaluation,
        "fit_scores": fit_scores
    })

    DatabaseAdapter.log_audit_event("COMPANY_ANALYZED", {
        "company_id": company_id,
        "company_name": company_profile["name"],
        "gating_status": risk_evaluation["gating_status"],
        "fit_score": fit_scores["weighted_fit_score"]
    })

    return {
        "status": "success",
        "company_id": company_id,
        "company_profile": company_profile,
        "risk_evaluation": risk_evaluation,
        "fit_scores": fit_scores
    }

@app.get("/api/companies")
def list_companies():
    """List all evaluated companies with summary scores and risk gating status"""
    companies = DatabaseAdapter.list_companies()
    evaluations = {e["company_id"]: e for e in DatabaseAdapter.list_evaluations()}

    summary_list = []
    for c in companies:
        c_id = c.get("id")
        e = evaluations.get(c_id, {})
        risk_eval = e.get("risk_evaluation", {})
        fit_scores = e.get("fit_scores", {})
        
        summary_list.append({
            "id": c_id,
            "name": c.get("name"),
            "domain": c.get("domain"),
            "industry": c.get("industry"),
            "employee_count": c.get("employee_count"),
            "funding_stage": c.get("funding_stage"),
            "gating_status": risk_eval.get("gating_status", "PASS"),
            "qualification_status": risk_eval.get("qualification_status", "QUALIFIED"),
            "weighted_fit_score": fit_scores.get("weighted_fit_score", 0),
            "recommendation_level": fit_scores.get("recommendation_level", "EVALUATING"),
            "recommendation_badge": fit_scores.get("recommendation_badge", "EVALUATING"),
            "evidence_count": len(c.get("evidence_sources", [])),
            "created_at": c.get("created_at")
        })

    # Sort by fit score descending
    summary_list.sort(key=lambda x: -x["weighted_fit_score"])
    return summary_list

@app.get("/api/companies/{company_id}")
def get_company_details(company_id: str):
    """Retrieve deep profile, evidence sources, risk evaluation, and fit scoring for a company"""
    company = DatabaseAdapter.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")
    
    evaluation = DatabaseAdapter.get_evaluation(company_id)
    return {
        "company_profile": company,
        "evaluation": evaluation
    }

@app.delete("/api/companies/{company_id}")
def delete_company(company_id: str):
    """Delete a company and its evaluations"""
    success = DatabaseAdapter.delete_company(company_id)
    if not success:
        raise HTTPException(status_code=404, detail="Company not found.")
    return {"status": "success", "deleted_id": company_id}

@app.post("/api/risk-engine/evaluate")
def evaluate_risk_rules(req: EvaluateRulesRequest):
    """Module 3: Dynamically re-evaluate mandatory gating rules with live overrides and custom policies"""
    company = DatabaseAdapter.get_company(req.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")
    
    evaluation = DatabaseAdapter.get_evaluation(req.company_id) or {}
    updated_risk = RiskValidationEngine.evaluate_risks(
        company_profile=company,
        custom_rules=req.custom_rules,
        rule_overrides=req.rule_overrides
    )
    
    # Recalculate fit scores dynamically because gating qualification affects fit score & recommendation
    existing_weights = evaluation.get("fit_scores", {}).get("weights_applied")
    updated_fit = PartnershipFitScorer.compute_scores(
        company_profile=company,
        risk_evaluation=updated_risk,
        custom_weights=existing_weights
    )
    
    evaluation["risk_evaluation"] = updated_risk
    evaluation["fit_scores"] = updated_fit
    DatabaseAdapter.save_evaluation(req.company_id, evaluation)
    
    return {
        "status": "success",
        "company_id": req.company_id,
        "risk_evaluation": updated_risk,
        "fit_scores": updated_fit
    }

@app.post("/api/fit-scorer/recalculate")
def recalculate_fit(req: RecalculateFitRequest):
    """Module 4: Recalculate partnership fit score with dynamically tuned weights"""
    company = DatabaseAdapter.get_company(req.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")
    
    evaluation = DatabaseAdapter.get_evaluation(req.company_id) or {}
    risk_eval = evaluation.get("risk_evaluation", {})

    updated_scores = PartnershipFitScorer.compute_scores(
        company_profile=company,
        risk_evaluation=risk_eval,
        custom_weights=req.weights
    )

    # Update in database
    evaluation["fit_scores"] = updated_scores
    DatabaseAdapter.save_evaluation(req.company_id, evaluation)

    return updated_scores

@app.post("/api/decision-matrix")
def get_decision_matrix(req: MatrixRequest):
    """
    Module 5: Executive Decision Matrix
    Generates side-by-side comparison across all candidate partners,
    applying dynamic weight simulation across all rows in real time.
    """
    all_companies = DatabaseAdapter.list_companies()
    
    # Filter if specific company IDs requested
    if req.company_ids and len(req.company_ids) > 0:
        companies = [c for c in all_companies if c.get("id") in req.company_ids]
    else:
        companies = all_companies

    evaluations = {e["company_id"]: e for e in DatabaseAdapter.list_evaluations()}
    matrix = ExecutiveDecisionMatrix.generate_comparison_matrix(companies, evaluations, req.weights)
    
    return matrix

@app.get("/api/decision-matrix/memo/{company_id}")
def get_executive_memo(company_id: str):
    """Generate formal C-Suite Due Diligence Memo for export and decision-making"""
    company = DatabaseAdapter.get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found.")
    
    evaluation = DatabaseAdapter.get_evaluation(company_id) or {}
    memo = ExecutiveDecisionMatrix.generate_executive_dossier_memo(company_id, company, evaluation)
    return memo


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
