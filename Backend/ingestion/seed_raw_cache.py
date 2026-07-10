import os
import json
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_cache():
    os.makedirs("data/raw", exist_ok=True)
    
    # 1. Fetch publications from OpenAlex
    try:
        logger.info("Seeding openalex_works.json...")
        url = "https://api.openalex.org/works"
        params = {"search": "artificial intelligence", "per-page": 120}
        resp = requests.get(url, params=params, timeout=20)
        resp.raise_for_status()
        with open("data/raw/openalex_works.json", "w", encoding="utf-8") as f:
            json.dump(resp.json(), f, indent=2)
        logger.info("Successfully seeded openalex_works.json")
    except Exception as e:
        logger.error(f"Failed to fetch publications from OpenAlex: {e}")
        
    # 2. Fetch grants from OpenAlex
    try:
        logger.info("Seeding openalex_awards.json...")
        url = "https://api.openalex.org/awards"
        params = {"search": "artificial intelligence", "per-page": 120}
        resp = requests.get(url, params=params, timeout=20)
        resp.raise_for_status()
        with open("data/raw/openalex_awards.json", "w", encoding="utf-8") as f:
            json.dump(resp.json(), f, indent=2)
        logger.info("Successfully seeded openalex_awards.json")
    except Exception as e:
        logger.error(f"Failed to fetch grants from OpenAlex: {e}")
        
    # 3. Create patents mock matching USPTO ODP schema
    logger.info("Seeding uspto_patents.json from sample CSV patent list...")
    patents = [
        {
            "patentNumber": "US-11800101-B2",
            "inventionTitle": "System and Method for Automated AI Grant Matching and Scoring",
            "assignees": [{"organizationName": "DeepTech Innovation Labs Inc."}],
            "filingDate": "2023-08-14",
            "cpcClassifications": [{"cpcClassNumber": "G06N20/00"}]
        },
        {
            "patentNumber": "US-11800205-B2",
            "inventionTitle": "Distributed Vector Database System for Real-Time Patent Prior Art Search",
            "assignees": [{"organizationName": "VectorAI Systems LLC"}],
            "filingDate": "2023-09-02",
            "cpcClassifications": [{"cpcClassNumber": "G06F16/33"}]
        },
        {
            "patentNumber": "US-11800319-B2",
            "inventionTitle": "Neural Network Pipeline for Technology Readiness Level Estimation",
            "assignees": [{"organizationName": "University Tech Transfer Inc."}],
            "filingDate": "2023-10-19",
            "cpcClassifications": [{"cpcClassNumber": "G06Q10/06"}]
        },
        {
            "patentNumber": "US-11800441-B2",
            "inventionTitle": "Autonomous Multi-Agent System for Research Trend Discovery",
            "assignees": [{"organizationName": "NextGen AI Ventures Corp"}],
            "filingDate": "2023-11-05",
            "cpcClassifications": [{"cpcClassNumber": "G06N3/00"}]
        },
        {
            "patentNumber": "US-11800550-B2",
            "inventionTitle": "Graph-Based University Enterprise Partnership Engine",
            "assignees": [{"organizationName": "BioTech Research Network LLC"}],
            "filingDate": "2023-12-01",
            "cpcClassifications": [{"cpcClassNumber": "G06Q50/08"}]
        },
        {
            "patentNumber": "US-11800612-B2",
            "inventionTitle": "Quantum-Enhanced Bibliometric Analysis Method",
            "assignees": [{"organizationName": "Quantum Innovation Inc."}],
            "filingDate": "2024-01-11",
            "cpcClassifications": [{"cpcClassNumber": "G06N10/00"}]
        },
        {
            "patentNumber": "US-11800723-B2",
            "inventionTitle": "Explainable Intellectual Property Valuation Engine",
            "assignees": [{"organizationName": "Capital AI Analytics Corp"}],
            "filingDate": "2024-02-14",
            "cpcClassifications": [{"cpcClassNumber": "G06Q40/06"}]
        },
        {
            "patentNumber": "US-11800889-B2",
            "inventionTitle": "Secure Federated Learning Architecture for Inter-University Clinical Data",
            "assignees": [{"organizationName": "MedTech Cloud Solutions Inc."}],
            "filingDate": "2024-03-20",
            "cpcClassifications": [{"cpcClassNumber": "G06F21/62"}]
        },
        {
            "patentNumber": "US-11800990-B2",
            "inventionTitle": "Neural Transformer Model for Patent Claim Expansion",
            "assignees": [{"organizationName": "IntellectTech Solutions Corp"}],
            "filingDate": "2024-04-12",
            "cpcClassifications": [{"cpcClassNumber": "G06F17/00"}]
        },
        {
            "patentNumber": "US-11801001-B2",
            "inventionTitle": "Predictive Patent Infringement Detection via Graph Embeddings",
            "assignees": [{"organizationName": "IP Guard LLC"}],
            "filingDate": "2024-05-25",
            "cpcClassifications": [{"cpcClassNumber": "G06N20/20"}]
        },
        {
            "patentNumber": "US-11801112-B2",
            "inventionTitle": "Autonomous Technology Landscaping and Market Prediction System",
            "assignees": [{"organizationName": "Future Analytics LLC"}],
            "filingDate": "2024-06-18",
            "cpcClassifications": [{"cpcClassNumber": "G06Q10/04"}]
        },
        {
            "patentNumber": "US-11801223-B2",
            "inventionTitle": "Generative Language Model for Automatic Scientific Abstract Synthesis",
            "assignees": [{"organizationName": "OpenSci Labs Inc."}],
            "filingDate": "2024-07-09",
            "cpcClassifications": [{"cpcClassNumber": "G06F40/56"}]
        },
        {
            "patentNumber": "US-11801334-B2",
            "inventionTitle": "Decentralized Blockchain Registry for Academic Peer Review Verification",
            "assignees": [{"organizationName": "TrustAcademic Org"}],
            "filingDate": "2024-08-22",
            "cpcClassifications": [{"cpcClassNumber": "H04L9/32"}]
        },
        {
            "patentNumber": "US-11801445-B2",
            "inventionTitle": "Real-time Scientific Trend Analytics Dashboard",
            "assignees": [{"organizationName": "TrendSpotter AI LLC"}],
            "filingDate": "2024-09-30",
            "cpcClassifications": [{"cpcClassNumber": "G06F16/24"}]
        },
        {
            "patentNumber": "US-11801556-B2",
            "inventionTitle": "Vector-based Semantic Alignment of Scientific Grants",
            "assignees": [{"organizationName": "AcademicMatch Corp"}],
            "filingDate": "2024-10-15",
            "cpcClassifications": [{"cpcClassNumber": "G06N5/02"}]
        }
    ]
    
    with open("data/raw/uspto_patents.json", "w", encoding="utf-8") as f:
        json.dump({"results": patents}, f, indent=2)
    logger.info("Successfully seeded uspto_patents.json")

if __name__ == "__main__":
    seed_cache()
