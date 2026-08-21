import os
import sys
import json
import uuid
from datetime import datetime, date, timedelta
import random

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import engine, SessionLocal, Base
from app.models.user import User
from app.models.profile import ResearchProfile
from app.models.publication import Publication
from app.models.patent import Patent
from app.utils.security import get_password_hash

def seed_database_and_analytics():
    print("=" * 80)
    print("  SEEDING DATABASE & ANALYTICS WITH RICH DYNAMIC VARIATION DATA")
    print("=" * 80)

    # 1. Create all database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Define 8 diverse users across 4 roles
        users_data = [
            {
                "full_name": "Dr. Sarah Connor",
                "email": "sarah.connor@cyberdyne.org",
                "role": "Researcher",
                "domain": "Artificial Intelligence & Neural Networks",
                "subdomain": "Deep Reinforcement Learning & Computer Vision",
                "keywords": "AI, deep learning, neural networks, robotics, computer vision",
                "organization": "Cyberdyne AI Research Institute",
                "designation": "Principal AI Scientist",
                "h_index": 28
            },
            {
                "full_name": "Dr. Durairam Scholar",
                "email": "durairam.researcher@cyberdyne.org",
                "role": "Researcher",
                "domain": "Synthetic Biology & Gene Editing",
                "subdomain": "CRISPR-Cas9 & Genomic Engineering",
                "keywords": "CRISPR, gene editing, synthetic biology, genomics, therapeutics",
                "organization": "BioGenetics Advanced Labs",
                "designation": "Lead Genomic Researcher",
                "h_index": 34
            },
            {
                "full_name": "Alex Chen",
                "email": "alex.chen@mit.edu",
                "role": "Researcher",
                "domain": "Quantum Computing & Microelectronics",
                "subdomain": "Superconducting Qubits & Quantum Algorithms",
                "keywords": "quantum computing, qubits, semiconductors, photonics",
                "organization": "MIT Quantum Microelectronics Lab",
                "designation": "Senior Research Fellow",
                "h_index": 22
            },
            {
                "full_name": "Elena Rostova",
                "email": "elena.rostova@oxford.ac.uk",
                "role": "Startup Founder",
                "domain": "Clean Energy & Next-Gen Battery Storage",
                "subdomain": "Solid-State Batteries & Hydrogen Fuel Cells",
                "keywords": "solid-state batteries, clean energy, lithium-sulfur, hydrogen",
                "organization": "Aether Energy Technologies Inc.",
                "designation": "Founder & CTO",
                "h_index": 19
            },
            {
                "full_name": "Vikram Patel",
                "email": "founder@cyberdyne.tech",
                "role": "Startup Founder",
                "domain": "Autonomous Robotics & Cybernetics",
                "subdomain": "Humanoid Robotics & Sensor Fusion",
                "keywords": "robotics, autonomous systems, sensor fusion, LiDAR, control",
                "organization": "Cyberdyne Robotics Systems",
                "designation": "CEO & Founder",
                "h_index": 16
            },
            {
                "full_name": "Miles Dyson",
                "email": "manager@tto.edu",
                "role": "Innovation Manager",
                "domain": "Technology Transfer & IP Monetization",
                "subdomain": "Patent Licensing & Commercialization",
                "keywords": "technology transfer, IP strategy, licensing, commercialization",
                "organization": "Global University TTO Network",
                "designation": "Director of Technology Transfer",
                "h_index": 14
            },
            {
                "full_name": "David Miller",
                "email": "david.miller@stanford.edu",
                "role": "Innovation Manager",
                "domain": "Biomedical Devices & Nanomedicine",
                "subdomain": "Targeted Drug Delivery & Bio-MEMS",
                "keywords": "nanomedicine, bio-mems, drug delivery, medical devices",
                "organization": "Stanford Commercialization Office",
                "designation": "VP of Commercial Strategy",
                "h_index": 25
            },
            {
                "full_name": "Admin System User",
                "email": "admin@platform.org",
                "role": "Administrator",
                "domain": "Platform Administration & System Security",
                "subdomain": "Enterprise Cloud Architecture",
                "keywords": "admin, security, infrastructure, telemetry",
                "organization": "Platform Headquarters",
                "designation": "Chief System Administrator",
                "h_index": 10
            }
        ]

        created_users = []
        default_hash = get_password_hash("Password123!")

        print("\n[STEP 1] Seeding Users and Research Profiles...")
        for u_data in users_data:
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
                print(f"  + Created User: {user.full_name} ({user.role})")
            else:
                print(f"  . User Exists: {user.full_name} ({user.role})")

            created_users.append((user, u_data))

            # Profile creation / update
            profile = db.query(ResearchProfile).filter(ResearchProfile.user_id == user.id).first()
            if not profile:
                profile = ResearchProfile(
                    user_id=user.id,
                    research_domain=u_data["domain"],
                    research_subdomain=u_data["subdomain"],
                    keywords=u_data["keywords"],
                    organization=u_data["organization"],
                    designation=u_data["designation"],
                    highest_qualification="Ph.D. in Engineering / Science",
                    years_of_experience=random.randint(8, 20),
                    research_interests=f"Deep research in {u_data['subdomain']} and commercial IP deployment.",
                    technology_areas=u_data["keywords"],
                    publications_count=random.randint(15, 60),
                    patents_count=random.randint(4, 25),
                    biography=f"Leading expert in {u_data['domain']} with over a decade of groundbreaking research and industry spin-offs.",
                    linkedin_url=f"https://linkedin.com/in/{user.full_name.lower().replace(' ', '-').replace('.', '')}",
                    orcid_id=f"0000-0002-{random.randint(1000,9999)}-{random.randint(1000,9999)}"
                )
                db.add(profile)
                print(f"    -> Added Research Profile for {user.full_name}")

        db.commit()

        # 2. Seed Publications with high variation across years (2018 - 2026)
        print("\n[STEP 2] Seeding Publications across Years & Citation Spectra...")
        publication_titles = [
            ("Scalable Deep Reinforcement Learning for Autonomous Robotic Navigation", "IEEE Transactions on Neural Networks", "Artificial Intelligence", 2024, 342, True),
            ("CRISPR-Cas13 Targeted RNA Editing for Neurodegenerative Disease Mitigation", "Nature Biotechnology", "Synthetic Biology", 2023, 512, True),
            ("Room-Temperature Superconducting Qubits using Diamond Nitrogen-Vacancy Centers", "Physical Review Letters", "Quantum Computing", 2025, 189, False),
            ("High-Energy Density Solid-State Electrolytes for Next-Gen Electric Aircraft", "ACS Energy Letters", "Clean Energy", 2022, 275, True),
            ("Sub-Nanometer Lithography and Gate-All-Around Transistor Architectures", "IEEE Electron Device Letters", "Microelectronics", 2021, 198, False),
            ("Generative Transformer Models for De Novo Molecular & Protein Structure Design", "Science Machine Intelligence", "Artificial Intelligence", 2025, 410, True),
            ("In Vivo Delivery of Lipid Nanoparticles for Precision Cancer Immunotherapy", "Cell Biomaterials", "Biomedical Devices", 2024, 320, True),
            ("Adaptive Sensor Fusion for Bipedal Locomotion in Dynamic Terrains", "Journal of Robotics & Automation", "Robotics", 2022, 145, False),
            ("Zero-Knowledge Proof Protocols for Decentralized Medical Data Sharing", "ACM Transactions on Privacy & Security", "Cybersecurity", 2023, 115, True),
            ("High-Efficiency Perovskite-Silicon Tandem Solar Cells with 33.5% Efficiency", "Nature Energy", "Clean Energy", 2026, 85, True),
            ("Multiplexed Single-Cell Transcriptomics in Human Brain Organoids", "Nature Neuroscience", "Synthetic Biology", 2021, 620, True),
            ("Quantum Key Distribution in Low-Earth-Orbit Satellite Constellations", "Optica Quantum", "Quantum Computing", 2024, 210, False),
            ("Autonomous Vision-Guided Micro-Robots for Endovascular Surgery", "Science Robotics", "Biomedical Devices", 2025, 175, True),
            ("Self-Healing Polymer Coatings for Aerospace Micro-Cracks", "Advanced Materials", "Materials Science", 2020, 390, False),
            ("Federated Learning Frameworks for Multi-Hospital Clinical Diagnostics", "The Lancet Digital Health", "Artificial Intelligence", 2024, 290, True)
        ]

        total_pubs_inserted = 0
        for idx, (title, journal, domain, year, citations, is_oa) in enumerate(publication_titles):
            # Assign publication to one of our researchers/founders
            owner_user, _ = created_users[idx % len(created_users)]
            
            existing = db.query(Publication).filter(
                Publication.user_id == owner_user.id,
                Publication.title == title
            ).first()

            if not existing:
                openalex_id = f"https://openalex.org/W{3000000000 + idx * 12345}"
                pub = Publication(
                    openalex_id=openalex_id,
                    user_id=owner_user.id,
                    title=title,
                    abstract=f"Abstract highlighting key breakthroughs in {domain}. We demonstrate a novel methodology producing state-of-the-art metrics.",
                    authors=f"{owner_user.full_name}, Dr. J. Vance, Dr. M. K. Gupta",
                    publication_year=year,
                    doi=f"10.1038/s41587-024-{1000 + idx}-x",
                    citation_count=citations,
                    journal=journal,
                    keywords=f"{domain.lower()}, innovation, empirical evaluation",
                    open_access=is_oa,
                    source_url=f"https://doi.org/10.1038/s41587-024-{1000 + idx}-x"
                )
                db.add(pub)
                total_pubs_inserted += 1

        db.commit()
        print(f"  + Synced {total_pubs_inserted} new Publications into DB.")

        # 3. Seed Patents with Legal Status & Assignee Variation
        print("\n[STEP 3] Seeding Patent Records across Statuses & Legal Jurisdictions...")
        patents_list = [
            ("Neural Network Accelerator Architecture with Dynamic Weight Quantization", "GRANTED", "US11895412B2", "Cyberdyne Systems", "Artificial Intelligence", "G06N 3/063", 2021, 2023, 42),
            ("Synthetic Guide RNA Constructs for High-Fidelity Gene Transduction", "GRANTED", "US11654321B1", "BioGenetics Inc", "Synthetic Biology", "C12N 15/11", 2020, 2022, 68),
            ("Cryogenic Superconducting Quantum Bit Readout Circuitry", "PENDING", "US2024018901A1", "MIT Tech Transfer", "Quantum Computing", "H01L 39/22", 2023, 2024, 19),
            ("Solid-State Lithium Anode Battery with Ceramic Ion Conductor Interlayer", "GRANTED", "US11987654B2", "Aether Energy", "Clean Energy", "H01M 10/0525", 2022, 2024, 35),
            ("Autonomous Bipedal Robot Balancing Actuator System", "FILED", "US2025001234A1", "Cyberdyne Robotics", "Robotics", "B25J 9/16", 2024, 2025, 8),
            ("Targeted Micro-Bubble Drug Delivery Nanoparticle Assembly", "APPLICATION_PUBLISHED", "EP4123987A1", "Stanford TTO", "Biomedical Devices", "A61K 9/51", 2023, 2024, 27),
            ("High-Power Gallium Nitride Power Inverter for Electric Vehicles", "GRANTED", "JP6987452B2", "Global Innovation Hub", "Microelectronics", "H02M 7/538", 2019, 2021, 84),
            ("Multi-Agent Swarm Drone Communication and Collision Avoidance", "GRANTED", "US11765432B2", "Cyberdyne Systems", "Robotics", "G05D 1/02", 2021, 2023, 51),
            ("Photonic Crystal Quantum Switch for Fiber-Optic Networks", "EXPIRED", "US9876543B1", "Quantum Dynamics", "Quantum Computing", "G02F 1/35", 2014, 2016, 120),
            ("Genetically Engineered Thermal-Stable Polymerase Enzyme", "GRANTED", "US11432109B2", "BioGenetics Inc", "Synthetic Biology", "C12N 9/12", 2021, 2023, 44)
        ]

        total_patents_inserted = 0
        for idx, (title, status, ext_id, assignee, domain, classif, filing_yr, pub_yr, c_count) in enumerate(patents_list):
            owner_user, _ = created_users[idx % len(created_users)]

            existing = db.query(Patent).filter(
                Patent.user_id == owner_user.id,
                Patent.external_patent_id == ext_id
            ).first()

            if not existing:
                pat = Patent(
                    external_patent_id=ext_id,
                    user_id=owner_user.id,
                    title=title,
                    abstract=f"Patent specification covering {domain} innovation assigned to {assignee}. Features enhanced performance and reduced manufacturing cost.",
                    inventors=f"{owner_user.full_name}, Dr. E. Vance",
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
                total_patents_inserted += 1

        db.commit()
        print(f"  + Synced {total_patents_inserted} new Patents into DB.")

        # 4. Update JSON Analytics Datasets for Global Dashboard Variation
        print("\n[STEP 4] Updating Analytics Datasets (`datasets/analytics/`) for Frontend Charts...")
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        analytics_dir = os.path.join(base_dir, "datasets", "analytics")

        # 4a. Update Publication Dashboard Data
        pub_json_path = os.path.join(analytics_dir, "publication_dashboard_data.json")
        pub_analytics = {
            "summary_metrics": {
                "total_publications": 14280,
                "total_citations": 384500,
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
                {"domain": "Artificial Intelligence & Neural Nets", "count": 3450},
                {"domain": "Synthetic Biology & Genomics", "count": 2890},
                {"domain": "Quantum Computing & Microelectronics", "count": 2410},
                {"domain": "Clean Energy & Storage", "count": 2150},
                {"domain": "Biomedical Devices & Nanomed", "count": 1820},
                {"domain": "Autonomous Robotics & Control", "count": 1560}
            ],
            "open_access_distribution": [
                {"status": "Gold / Green Open Access", "count": 9780},
                {"status": "Subscription / Hybrid", "count": 4500}
            ]
        }
        with open(pub_json_path, "w", encoding="utf-8") as f:
            json.dump(pub_analytics, f, indent=2)
        print("  + Updated `publication_dashboard_data.json` with multi-year velocity data.")

        # 4b. Update Patent Dashboard Data
        pat_json_path = os.path.join(analytics_dir, "patent_dashboard_data.json")
        pat_analytics = {
            "summary_metrics": {
                "total_patents": 4820,
                "granted_patents": 3150,
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
        with open(pat_json_path, "w", encoding="utf-8") as f:
            json.dump(pat_analytics, f, indent=2)
        print("  + Updated `patent_dashboard_data.json` with filing timeline and assignee breakdown.")

        # 4c. Update Funding Dashboard Data
        funding_json_path = os.path.join(analytics_dir, "funding_dashboard_data.json")
        funding_analytics = {
            "summary_metrics": {
                "total_funding_opportunities": 1240,
                "total_capital_pool_usd": 5150000000,
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
        with open(funding_json_path, "w", encoding="utf-8") as f:
            json.dump(funding_analytics, f, indent=2)
        print("  + Updated `funding_dashboard_data.json` with agency capital breakdown.")

        print("\n" + "=" * 80)
        print("  SUCCESSFULLY SEEDED DATABASE & ANALYTICS! FRONTEND NOW HAS FULL VARIATION.")
        print("=" * 80 + "\n")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database_and_analytics()
