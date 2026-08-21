"""
Platform Intelligence Data Simulator — Unified Master Simulator
===============================================================
Consolidates all database seeding, publication analytics simulation, 
patent landscape simulation, funding opportunity generation, and 
analytics dataset exports into a SINGLE executable Python file.

Usage:
    python platform_simulator.py               # Run complete simulation stack
    python platform_simulator.py --seed-db      # Seed database tables only
    python platform_simulator.py --analytics    # Export JSON analytics datasets only
    python platform_simulator.py --verify       # Run E2E simulation verification
"""

import os
import sys
import json
import uuid
import time
import random
import argparse
from datetime import datetime, date, timedelta

# Ensure backend root is on Python sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import engine, SessionLocal, Base
from app.models.user import User
from app.models.profile import ResearchProfile
from app.models.publication import Publication
from app.models.patent import Patent
from app.utils.security import get_password_hash

# ==============================================================================
# 1. CONSTANTS & PREDEFINED DATA DOMAINS
# ==============================================================================

RESEARCH_DOMAINS = [
    "Artificial Intelligence & Machine Learning",
    "Synthetic Biology & Gene Editing",
    "Quantum Computing & Microelectronics",
    "Clean Energy & Next-Gen Battery Storage",
    "Autonomous Robotics & Cybernetics",
    "Biomedical Devices & Nanomedicine",
    "Cybersecurity & Zero-Trust Protocols",
    "Advanced Materials & Nanotechnology"
]

USERS_SEED_DATA = [
    {
        "full_name": "Dr. Sarah Connor",
        "email": "sarah.connor@cyberdyne.org",
        "role": "Researcher",
        "domain": "Artificial Intelligence & Machine Learning",
        "subdomain": "Deep Reinforcement Learning & Computer Vision",
        "keywords": "AI, deep learning, neural networks, robotics, computer vision",
        "organization": "Cyberdyne AI Research Institute",
        "designation": "Principal AI Scientist"
    },
    {
        "full_name": "Dr. Durairam Scholar",
        "email": "durairam.researcher@cyberdyne.org",
        "role": "Researcher",
        "domain": "Synthetic Biology & Gene Editing",
        "subdomain": "CRISPR-Cas9 & Genomic Engineering",
        "keywords": "CRISPR, gene editing, synthetic biology, genomics, therapeutics",
        "organization": "BioGenetics Advanced Labs",
        "designation": "Lead Genomic Researcher"
    },
    {
        "full_name": "Alex Chen",
        "email": "alex.chen@mit.edu",
        "role": "Researcher",
        "domain": "Quantum Computing & Microelectronics",
        "subdomain": "Superconducting Qubits & Quantum Algorithms",
        "keywords": "quantum computing, qubits, semiconductors, photonics",
        "organization": "MIT Quantum Microelectronics Lab",
        "designation": "Senior Research Fellow"
    },
    {
        "full_name": "Elena Rostova",
        "email": "elena.rostova@oxford.ac.uk",
        "role": "Startup Founder",
        "domain": "Clean Energy & Next-Gen Battery Storage",
        "subdomain": "Solid-State Batteries & Hydrogen Fuel Cells",
        "keywords": "solid-state batteries, clean energy, lithium-sulfur, hydrogen",
        "organization": "Aether Energy Technologies Inc.",
        "designation": "Founder & CTO"
    },
    {
        "full_name": "Vikram Patel",
        "email": "founder@cyberdyne.tech",
        "role": "Startup Founder",
        "domain": "Autonomous Robotics & Cybernetics",
        "subdomain": "Humanoid Robotics & Sensor Fusion",
        "keywords": "robotics, autonomous systems, sensor fusion, LiDAR, control",
        "organization": "Cyberdyne Robotics Systems",
        "designation": "CEO & Founder"
    },
    {
        "full_name": "Miles Dyson",
        "email": "manager@tto.edu",
        "role": "Innovation Manager",
        "domain": "Technology Transfer & IP Monetization",
        "subdomain": "Patent Licensing & Commercialization",
        "keywords": "technology transfer, IP strategy, licensing, commercialization",
        "organization": "Global University TTO Network",
        "designation": "Director of Technology Transfer"
    },
    {
        "full_name": "David Miller",
        "email": "david.miller@stanford.edu",
        "role": "Innovation Manager",
        "domain": "Biomedical Devices & Nanomedicine",
        "subdomain": "Targeted Drug Delivery & Bio-MEMS",
        "keywords": "nanomedicine, bio-mems, drug delivery, medical devices",
        "organization": "Stanford Commercialization Office",
        "designation": "VP of Commercial Strategy"
    },
    {
        "full_name": "Admin System User",
        "email": "admin@platform.org",
        "role": "Administrator",
        "domain": "Platform Administration & System Security",
        "subdomain": "Enterprise Cloud Architecture",
        "keywords": "admin, security, infrastructure, telemetry",
        "organization": "Platform Headquarters",
        "designation": "Chief System Administrator"
    }
]

PUBLICATIONS_SEED_DATA = [
    ("Scalable Deep Reinforcement Learning for Autonomous Robotic Navigation", "IEEE Transactions on Neural Networks", "Artificial Intelligence & Machine Learning", 2024, 342, True),
    ("CRISPR-Cas13 Targeted RNA Editing for Neurodegenerative Disease Mitigation", "Nature Biotechnology", "Synthetic Biology & Gene Editing", 2023, 512, True),
    ("Room-Temperature Superconducting Qubits using Diamond NV Centers", "Physical Review Letters", "Quantum Computing & Microelectronics", 2025, 189, False),
    ("High-Energy Density Solid-State Electrolytes for Next-Gen Electric Aircraft", "ACS Energy Letters", "Clean Energy & Next-Gen Battery Storage", 2022, 275, True),
    ("Sub-Nanometer Lithography and Gate-All-Around Transistor Architectures", "IEEE Electron Device Letters", "Quantum Computing & Microelectronics", 2021, 198, False),
    ("Generative Transformer Models for De Novo Protein Structure Design", "Science Machine Intelligence", "Artificial Intelligence & Machine Learning", 2025, 410, True),
    ("In Vivo Delivery of Lipid Nanoparticles for Precision Immunotherapy", "Cell Biomaterials", "Biomedical Devices & Nanomedicine", 2024, 320, True),
    ("Adaptive Sensor Fusion for Bipedal Locomotion in Dynamic Terrains", "Journal of Robotics & Automation", "Autonomous Robotics & Cybernetics", 2022, 145, False),
    ("Zero-Knowledge Proof Protocols for Decentralized Medical Data Sharing", "ACM Transactions on Privacy & Security", "Cybersecurity & Zero-Trust Protocols", 2023, 115, True),
    ("High-Efficiency Perovskite-Silicon Tandem Solar Cells with 33.5% Efficiency", "Nature Energy", "Clean Energy & Next-Gen Battery Storage", 2026, 85, True),
    ("Multiplexed Single-Cell Transcriptomics in Human Brain Organoids", "Nature Neuroscience", "Synthetic Biology & Gene Editing", 2021, 620, True),
    ("Quantum Key Distribution in Low-Earth-Orbit Satellite Constellations", "Optica Quantum", "Quantum Computing & Microelectronics", 2024, 210, False),
    ("Autonomous Vision-Guided Micro-Robots for Endovascular Surgery", "Science Robotics", "Biomedical Devices & Nanomedicine", 2025, 175, True),
    ("Self-Healing Polymer Coatings for Aerospace Micro-Cracks", "Advanced Materials", "Advanced Materials & Nanotechnology", 2020, 390, False),
    ("Federated Learning Frameworks for Multi-Hospital Clinical Diagnostics", "The Lancet Digital Health", "Artificial Intelligence & Machine Learning", 2024, 290, True)
]

PATENTS_SEED_DATA = [
    ("Neural Network Accelerator Architecture with Dynamic Quantization", "GRANTED", "US11895412B2", "Cyberdyne Systems", "Artificial Intelligence & Machine Learning", "G06N 3/063", 2021, 2023, 42),
    ("Synthetic Guide RNA Constructs for High-Fidelity Gene Transduction", "GRANTED", "US11654321B1", "BioGenetics Inc", "Synthetic Biology & Gene Editing", "C12N 15/11", 2020, 2022, 68),
    ("Cryogenic Superconducting Quantum Bit Readout Circuitry", "PENDING", "US2024018901A1", "MIT Tech Transfer", "Quantum Computing & Microelectronics", "H01L 39/22", 2023, 2024, 19),
    ("Solid-State Lithium Anode Battery with Ceramic Interlayer", "GRANTED", "US11987654B2", "Aether Energy", "Clean Energy & Next-Gen Battery Storage", "H01M 10/0525", 2022, 2024, 35),
    ("Autonomous Bipedal Robot Balancing Actuator System", "FILED", "US2025001234A1", "Cyberdyne Robotics", "Autonomous Robotics & Cybernetics", "B25J 9/16", 2024, 2025, 8),
    ("Targeted Micro-Bubble Drug Delivery Nanoparticle Assembly", "APPLICATION_PUBLISHED", "EP4123987A1", "Stanford TTO", "Biomedical Devices & Nanomedicine", "A61K 9/51", 2023, 2024, 27),
    ("High-Power Gallium Nitride Inverter for Electric Vehicles", "GRANTED", "JP6987452B2", "Global Innovation Hub", "Clean Energy & Next-Gen Battery Storage", "H02M 7/538", 2019, 2021, 84),
    ("Multi-Agent Swarm Drone Communication and Collision Avoidance", "GRANTED", "US11765432B2", "Cyberdyne Systems", "Autonomous Robotics & Cybernetics", "G05D 1/02", 2021, 2023, 51),
    ("Photonic Crystal Quantum Switch for Fiber-Optic Networks", "EXPIRED", "US9876543B1", "Quantum Dynamics", "Quantum Computing & Microelectronics", "G02F 1/35", 2014, 2016, 120),
    ("Genetically Engineered Thermal-Stable Polymerase Enzyme", "GRANTED", "US11432109B2", "BioGenetics Inc", "Synthetic Biology & Gene Editing", "C12N 9/12", 2021, 2023, 44)
]

# ==============================================================================
# 2. DATABASE SIMULATOR MODULE
# ==============================================================================

def simulate_database_population(db_session=None):
    """Seed relational database with Users, Profiles, Publications, and Patents."""
    print("\n" + "=" * 80)
    print("  [MODULE 1] RELATIONAL DATABASE SIMULATION ENGINE")
    print("=" * 80)

    Base.metadata.create_all(bind=engine)
    db = db_session or SessionLocal()
    default_hash = get_password_hash("Password123!")

    created_users = []

    try:
        # A. Seed Users & Research Profiles
        print("  1. Simulating User Accounts & Role-Based Profiles...")
        for u_data in USERS_SEED_DATA:
            user = db.query(User).filter(User.email == u_data["email"]).first()
            if not user:
                user = User(
                    full_name=u_data["full_name"],
                    email=u_data["email"],
                    hashed_password=default_hash,
                    role=u_data["role"]
                )
                db.add(user)
                db.flush()
                print(f"     + Created User: {user.full_name} ({user.role})")
            else:
                print(f"     . Existing User Verified: {user.full_name}")

            created_users.append(user)

            profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user.id).first()
            if not profile:
                profile = ResearchProfile(
                    user_id=user.id,
                    research_domain=u_data["domain"],
                    research_subdomain=u_data["subdomain"],
                    keywords=u_data["keywords"],
                    organization=u_data["organization"],
                    designation=u_data["designation"],
                    highest_qualification="Ph.D.",
                    years_of_experience=random.randint(8, 20),
                    research_interests=f"Advanced research in {u_data['subdomain']}.",
                    technology_areas=u_data["keywords"],
                    publications_count=random.randint(15, 60),
                    patents_count=random.randint(4, 25),
                    biography=f"Expert investigator in {u_data['domain']}.",
                    linkedin_url=f"https://linkedin.com/in/{user.full_name.lower().replace(' ', '-').replace('.', '')}",
                    orcid_id=f"0000-0002-{random.randint(1000,9999)}-{random.randint(1000,9999)}"
                )
                db.add(profile)

        db.commit()

        # B. Seed Publications
        print("  2. Simulating Publications Velocity (OpenAlex API format)...")
        pubs_inserted = 0
        for idx, (title, journal, domain, year, citations, is_oa) in enumerate(PUBLICATIONS_SEED_DATA):
            owner = created_users[idx % len(created_users)]
            openalex_id = f"https://openalex.org/W{3000000000 + idx * 12345}"
            existing = db.query(Publication).filter(
                (Publication.user_id == owner.id) & 
                ((Publication.openalex_id == openalex_id) | (Publication.title == title))
            ).first()
            if not existing:
                pub = Publication(
                    openalex_id=openalex_id,
                    user_id=owner.id,
                    title=title,
                    abstract=f"Breakthrough research paper in {domain} published in {journal}.",
                    authors=f"{owner.full_name}, Dr. J. Vance, Dr. M. K. Gupta",
                    publication_year=year,
                    doi=f"10.1038/s41587-024-{1000 + idx}-x",
                    citation_count=citations,
                    journal=journal,
                    keywords=f"{domain.lower()}, innovation, empirical evaluation",
                    open_access=is_oa,
                    source_url=f"https://doi.org/10.1038/s41587-024-{1000 + idx}-x"
                )
                db.add(pub)
                pubs_inserted += 1

        db.commit()
        print(f"     + Synced {pubs_inserted} new Publications into database.")

        # C. Seed Patents
        print("  3. Simulating Patent Landscape & IP Filings (The Lens API format)...")
        patents_inserted = 0
        for idx, (title, status, ext_id, assignee, domain, classif, filing_yr, pub_yr, c_count) in enumerate(PATENTS_SEED_DATA):
            owner = created_users[idx % len(created_users)]
            existing = db.query(Patent).filter(
                (Patent.user_id == owner.id) & 
                ((Patent.external_patent_id == ext_id) | (Patent.title == title))
            ).first()
            if not existing:
                pat = Patent(
                    external_patent_id=ext_id,
                    user_id=owner.id,
                    title=title,
                    abstract=f"Patent specification covering {domain} innovation assigned to {assignee}.",
                    inventors=f"{owner.full_name}, Dr. E. Vance",
                    assignee=assignee,
                    filing_date=date(filing_yr, 3, 15),
                    publication_date=date(pub_yr, 8, 20),
                    status=status,
                    classification=classif,
                    technology_domain=domain,
                    citation_count=c_count,
                    source_url=f"https://lens.org/lens/patent/{ext_id}"
                )
                db.add(pat)
                patents_inserted += 1

        db.commit()

        print(f"     + Synced {patents_inserted} new Patents into database.")

        print("  [SUCCESS] Relational Database Simulation Completed Cleanly.")
        return len(created_users), pubs_inserted, patents_inserted

    finally:
        if db_session is None:
            db.close()

# ==============================================================================
# 3. ANALYTICS DATASET SIMULATOR MODULE
# ==============================================================================

def simulate_analytics_datasets(tick_count=0):
    """Export and update JSON analytics dataset files under `datasets/analytics/`."""
    print("\n" + "=" * 80)
    print("  [MODULE 2] ANALYTICS DATASET GENERATOR ENGINE")
    print("=" * 80)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    analytics_dir = os.path.join(base_dir, "datasets", "analytics")
    os.makedirs(analytics_dir, exist_ok=True)

    # A. Publication Analytics
    pub_path = os.path.join(analytics_dir, "publication_dashboard_data.json")
    pub_data = {
        "summary_metrics": {
            "total_publications": 14280 + tick_count,
            "total_citations": 384500 + (tick_count * 15),
            "h_index_avg": 26.4,
            "open_access_percentage": 68.5
        },
        "publications_per_year": [
            {"year": 2018, "count": 850},
            {"year": 2019, "count": 1120},
            {"year": 2020, "count": 1380},
            {"year": 2021, "count": 1690},
            {"year": 2022, "count": 2100},
            {"year": 2023, "count": 2540},
            {"year": 2024, "count": 2980},
            {"year": 2025, "count": 3420},
            {"year": 2026, "count": 1200}
        ],
        "publications_by_domain": [
            {"domain": "Artificial Intelligence & Machine Learning", "count": 3450},
            {"domain": "Synthetic Biology & Gene Editing", "count": 2890},
            {"domain": "Quantum Computing & Microelectronics", "count": 2410},
            {"domain": "Clean Energy & Next-Gen Battery Storage", "count": 2150},
            {"domain": "Biomedical Devices & Nanomedicine", "count": 1820},
            {"domain": "Autonomous Robotics & Cybernetics", "count": 1560}
        ],
        "open_access_distribution": [
            {"status": "Gold / Green Open Access", "count": 9780},
            {"status": "Subscription / Hybrid", "count": 4500}
        ]
    }
    with open(pub_path, "w", encoding="utf-8") as f:
        json.dump(pub_data, f, indent=2)
    print(f"  + Generated: {pub_path}")

    # B. Patent Analytics
    pat_path = os.path.join(analytics_dir, "patent_dashboard_data.json")
    pat_data = {
        "summary_metrics": {
            "total_patents": 4820 + tick_count,
            "granted_patents": 3150 + tick_count,
            "pending_applications": 1420,
            "active_jurisdictions": 38
        },
        "patent_activity_timeline": {
            "timeline": [
                {"year": 2018, "patents": 310},
                {"year": 2019, "patents": 420},
                {"year": 2020, "patents": 510},
                {"year": 2021, "patents": 640},
                {"year": 2022, "patents": 790},
                {"year": 2023, "patents": 930},
                {"year": 2024, "patents": 1080},
                {"year": 2025, "patents": 1250},
                {"year": 2026, "patents": 480}
            ]
        },
        "patents_by_technology_domain": [
            {"domain": "Artificial Intelligence", "count": 1420},
            {"domain": "Clean Energy", "count": 1050},
            {"domain": "Biotechnology", "count": 940},
            {"domain": "Quantum Computing", "count": 780},
            {"domain": "Robotics", "count": 630}
        ],
        "patent_status_distribution": [
            {"status": "GRANTED", "count": 3150},
            {"status": "PENDING", "count": 1120},
            {"status": "APPLICATION_PUBLISHED", "count": 380},
            {"status": "EXPIRED", "count": 170}
        ],
        "top_assignees": [
            {"assignee": "Cyberdyne Systems Corp", "count": 840},
            {"assignee": "BioGenetics International", "count": 620},
            {"assignee": "MIT Tech Transfer Office", "count": 510},
            {"assignee": "Stanford Innovation Hub", "count": 430},
            {"assignee": "Aether Energy Technologies", "count": 390}
        ],
        "country_distribution": [
            {"country": "United States (US)", "count": 2150},
            {"country": "European Patent Office (EP)", "count": 1240},
            {"country": "Japan (JP)", "count": 680},
            {"country": "United Kingdom (GB)", "count": 450},
            {"country": "WIPO (PCT)", "count": 300}
        ]
    }
    with open(pat_path, "w", encoding="utf-8") as f:
        json.dump(pat_data, f, indent=2)
    print(f"  + Generated: {pat_path}")

    # C. Funding Analytics
    funding_path = os.path.join(analytics_dir, "funding_dashboard_data.json")
    funding_data = {
        "summary_metrics": {
            "total_funding_opportunities": 1240 + tick_count,
            "total_capital_pool_usd": 5150000000 + (tick_count * 1000000),
            "unique_funding_agencies": 85
        },
        "funding_opportunities_by_domain": [
            {"domain": "Artificial Intelligence & Autonomy", "count": 380},
            {"domain": "Clean Energy Transition", "count": 310},
            {"domain": "Biomedical & Genomic Medicine", "count": 270},
            {"domain": "Quantum Infrastructure", "count": 160},
            {"domain": "Cybersecurity & Microchips", "count": 120}
        ],
        "top_funding_agencies": [
            {"agency": "National Science Foundation (NSF)", "grant_count": 320, "budget_millions": 1450},
            {"agency": "National Institutes of Health (NIH)", "grant_count": 280, "budget_millions": 1820},
            {"agency": "DARPA Defense Sciences", "grant_count": 190, "budget_millions": 950},
            {"agency": "Horizon Europe Research Council", "grant_count": 240, "budget_millions": 1100},
            {"agency": "Department of Energy (ARPA-E)", "grant_count": 110, "budget_millions": 680}
        ],
        "country_distribution": [
            {"country": "United States", "count": 680},
            {"country": "European Union", "count": 340},
            {"country": "United Kingdom", "count": 140},
            {"country": "Japan", "count": 80}
        ]
    }
    with open(funding_path, "w", encoding="utf-8") as f:
        json.dump(funding_data, f, indent=2)
    print(f"  + Generated: {funding_path}")

    print("  [SUCCESS] Analytics Dataset Generation Completed Cleanly.")

# ==============================================================================
# 4. VERIFICATION MODULE
# ==============================================================================

def verify_simulated_platform():
    """Run E2E verification across database models and analytics files."""
    print("\n" + "=" * 80)
    print("  [MODULE 3] INTEGRITY & VERIFICATION CHECKS")
    print("=" * 80)

    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        profile_count = db.query(ResearchProfile).count()
        pub_count = db.query(Publication).count()
        pat_count = db.query(Patent).count()

        print(f"  DB Users Count:        {user_count} (Expected >= 8)")
        print(f"  DB Profiles Count:     {profile_count} (Expected >= 8)")
        print(f"  DB Publications Count: {pub_count} (Expected >= 15)")
        print(f"  DB Patents Count:      {pat_count} (Expected >= 10)")

        assert user_count >= 8, "User count check failed"
        assert profile_count >= 8, "Profile count check failed"
        assert pub_count >= 15, "Publication count check failed"
        assert pat_count >= 10, "Patent count check failed"

        print("  [PASSED] Database Integrity Checks Verified (100% Passed).")
    finally:
        db.close()

# ==============================================================================
# 5. CONTINUOUS SIMULATION LOOP MODULE
# ==============================================================================

def run_continuous_simulation_loop(interval_seconds: int = 10, run_once: bool = False):
    """
    Continuously injects dynamic publications, patents, and dataset variations 
    into the database and JSON analytics datasets every `interval_seconds` (default 10s) 
    until stopped by the user (Ctrl+C).
    """
    print("\n" + "=" * 80)
    print(f"  [CONTINUOUS SIMULATOR ENGINE] Injecting Data Every {interval_seconds} Seconds")
    print("  Press Ctrl+C at any time to gracefully stop the simulator.")
    print("=" * 80 + "\n")

    # Initial seeding & verification
    simulate_database_population()
    simulate_analytics_datasets()
    verify_simulated_platform()

    if run_once:
        print("\n  Single simulation run complete.")
        return

    tick_count = 0
    sample_journals = [
        "Nature Machine Intelligence", "IEEE Transactions on Pattern Analysis", 
        "Cell Reports", "Physical Review X", "ACS Nano", "Lancet Digital Health", "Science Advances"
    ]
    sample_assignees = [
        "Cyberdyne Systems Corp", "BioGenetics Inc", "MIT Tech Transfer", 
        "Stanford TTO", "Aether Energy", "Quantum Dynamics"
    ]
    sample_statuses = ["GRANTED", "PENDING", "FILED", "APPLICATION_PUBLISHED"]

    db = SessionLocal()
    try:
        users = db.query(User).all()
        if not users:
            print("  No users found in database. Initializing users first...")
            simulate_database_population(db)
            users = db.query(User).all()

        print(f"\n🚀 Live Simulator Running! Injecting new variations every {interval_seconds} seconds...\n")

        while True:
            tick_count += 1
            tick_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # Select a random user
            user = random.choice(users)

            # 1. Inject a new simulated publication
            pub_title = f"Breakthrough Discovery #{tick_count}: {random.choice(['Deep Learning Optimization', 'CRISPR Gene Editing', 'Solid-State Battery Anodes', 'Quantum Qubit Error Correction', 'Swarm Robotics Nav'])} in {random.choice(RESEARCH_DOMAINS)}"
            pub_id = f"https://openalex.org/W99{random.randint(100000, 999999)}"
            new_pub = Publication(
                openalex_id=pub_id,
                user_id=user.id,
                title=pub_title,
                abstract=f"Live simulated publication abstract generated at {tick_time} during simulation tick #{tick_count}.",
                authors=f"{user.full_name}, Dr. Simulation Engine",
                publication_year=2026,
                doi=f"10.1038/s41587-2026-{tick_count:04d}",
                citation_count=random.randint(15, 350),
                journal=random.choice(sample_journals),
                keywords="simulation, dynamic data, live stream",
                open_access=random.choice([True, False]),
                source_url=f"https://doi.org/10.1038/s41587-2026-{tick_count:04d}"
            )
            db.add(new_pub)

            # 2. Inject a new simulated patent
            pat_ext_id = f"US20260{random.randint(100000, 999999)}A1"
            pat_title = f"Patent Application #{tick_count}: {random.choice(['Next-Gen Semiconductor Switch', 'Bio-Compatible Nano Carrier', 'High-Density Lithium Anode', 'Autonomous LiDAR System'])}"
            new_pat = Patent(
                external_patent_id=pat_ext_id,
                user_id=user.id,
                title=pat_title,
                abstract=f"Live simulated patent claim specification generated at {tick_time}.",
                inventors=f"{user.full_name}",
                assignee=random.choice(sample_assignees),
                filing_date=date.today(),
                publication_date=date.today(),
                status=random.choice(sample_statuses),
                classification=f"G06N {random.randint(3, 20)}/00",
                technology_domain=random.choice(RESEARCH_DOMAINS),
                citation_count=random.randint(5, 75),
                source_url=f"https://lens.org/lens/patent/{pat_ext_id}"
            )
            db.add(new_pat)
            db.commit()

            # 3. Update dataset JSON analytics files with updated counts
            tot_pubs = db.query(Publication).count()
            tot_pats = db.query(Patent).count()
            simulate_analytics_datasets(tick_count=tick_count)

            print(f"[{tick_time}] [TICK #{tick_count}] Injected +1 Publication & +1 Patent for '{user.full_name}' | Total DB: {tot_pubs} Pubs, {tot_pats} Patents | Next tick in {interval_seconds}s (Press Ctrl+C to stop)")

            time.sleep(interval_seconds)

    except KeyboardInterrupt:
        print("\n\n" + "=" * 80)
        print("  🛑 CONTINUOUS SIMULATOR STOPPED CLEANLY BY USER")
        print(f"  Total Ticks Executed: {tick_count}")
        print("=" * 80 + "\n")
    finally:
        db.close()

# ==============================================================================
# 6. MASTER EXECUTION CLI ENTRY POINT
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(description="Master Platform Data Simulator & Seeder")
    parser.add_argument("--seed-db", action="store_true", help="Seed database tables only")
    parser.add_argument("--analytics", action="store_true", help="Export JSON analytics datasets only")
    parser.add_argument("--verify", action="store_true", help="Run verification check on simulated data")
    parser.add_argument("--once", action="store_true", help="Run single simulation pass without looping")
    parser.add_argument("--interval", type=int, default=10, help="Interval in seconds between ticks (default: 10)")
    args = parser.parse_args()

    print("=" * 80)
    print("    RESEARCH FUNDING & INNOVATION INTELLIGENCE PLATFORM — MASTER SIMULATOR")
    print("=" * 80)

    if args.seed_db:
        simulate_database_population()
    elif args.analytics:
        simulate_analytics_datasets()
    elif args.verify:
        verify_simulated_platform()
    elif args.once:
        run_continuous_simulation_loop(interval_seconds=args.interval, run_once=True)
    else:
        # Default: Run continuous loop every 10s (or --interval) until stopped by Ctrl+C
        run_continuous_simulation_loop(interval_seconds=args.interval, run_once=False)

if __name__ == "__main__":
    main()

