import logging
from firebase_db import DatabaseAdapter
from modules.discovery import DiscoveryEngine
from modules.extraction import ExtractionEngine
from modules.risk_engine import RiskValidationEngine
from modules.fit_scorer import PartnershipFitScorer

logger = logging.getLogger("PartnerIQ.SeedData")

# Initial candidate partner domains to dynamically discover and analyze if database is empty
BOOTSTRAP_CANDIDATES = [
    {
        "name": "Stripe",
        "domain": "stripe.com",
        "industry": "FinTech / Payment Infrastructure"
    },
    {
        "name": "Datadog",
        "domain": "datadoghq.com",
        "industry": "Cloud Observability & Security"
    },
    {
        "name": "Snowflake",
        "domain": "snowflake.com",
        "industry": "Cloud Data Platform"
    },
    {
        "name": "Supabase",
        "domain": "supabase.com",
        "industry": "Open Source BaaS / Postgres"
    },
    {
        # Entity with explicit evidence of trade sanction and missing compliance to verify dynamic Module 3 Risk Gating
        "name": "OmniShield Security (Legacy Risk Case)",
        "domain": "omnishield-riskfail.io",
        "industry": "Legacy Endpoint Defense",
        "custom_evidence": [
            {
                "id": "ev_risk_01",
                "source_url": "https://trade.gov/enforcement-records/omnishield",
                "source_title": "Commerce Department Sanctions & Export Prohibition Record",
                "category": "risk_audit",
                "snippet": "OmniShield subject to active federal trade sanctions and prohibitive export restriction due to ongoing fraud indictment.",
                "confidence": 0.99,
                "timestamp": "2026-03-01T10:00:00Z"
            },
            {
                "id": "ev_risk_02",
                "source_url": "https://cve.mitre.org/breach-advisories/omnishield",
                "source_title": "CVE MITRE Unmitigated Ransomware & Breach Disclosure",
                "category": "risk_audit",
                "snippet": "Catastrophic unpatched remote code execution vulnerability (CVSS 9.8) exploited in the wild resulting in active customer data leak.",
                "confidence": 0.98,
                "timestamp": "2026-02-15T12:00:00Z"
            }
        ]
    }
]


async def seed_initial_benchmark_partners():
    """Seed initial companies dynamically through the real discovery, extraction, and gating pipeline"""
    existing_companies = DatabaseAdapter.list_companies()
    if len(existing_companies) >= 4:
        logger.info(f"Database already populated with {len(existing_companies)} companies.")
        return

    logger.info("Initializing dynamic discovery & evaluation for bootstrap partners...")

    for item in BOOTSTRAP_CANDIDATES:
        name = item["name"]
        domain = item.get("domain")
        industry = item.get("industry")
        custom_evidence = item.get("custom_evidence", [])

        slug = name.lower().replace(" ", "").replace("-", "").replace("(", "").replace(")", "").replace(".", "")
        comp_id = f"comp_{slug[:14]}"

        if DatabaseAdapter.get_company(comp_id):
            continue

        logger.info(f"Running dynamic pipeline for: {name}...")

        # 1. Dynamic Discovery
        discovery_data = await DiscoveryEngine.discover_and_collect(name, domain, industry)
        if custom_evidence:
            discovery_data["evidence_sources"].extend(custom_evidence)

        # 2. Dynamic Extraction
        profile = await ExtractionEngine.extract_profile(discovery_data)
        profile["id"] = comp_id

        # 3. Dynamic Risk Gating
        risk_evaluation = RiskValidationEngine.evaluate_risks(profile)

        # 4. Dynamic Fit Scoring
        fit_scores = PartnershipFitScorer.compute_scores(profile, risk_evaluation)

        # Persist in Firebase / Firestore Store
        DatabaseAdapter.save_company(comp_id, profile)
        DatabaseAdapter.save_evaluation(comp_id, {
            "company_id": comp_id,
            "company_name": profile["name"],
            "risk_evaluation": risk_evaluation,
            "fit_scores": fit_scores
        })

        logger.info(f"Dynamically Evaluated: {profile['name']} -> Gate: {risk_evaluation['gating_status']}, Score: {fit_scores['weighted_fit_score']}%")

    logger.info("Bootstrap initialization complete.")
