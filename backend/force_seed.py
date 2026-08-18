from app.database.database import SessionLocal, engine, Base
from app.models import User, Role, Organization, ResearchProfile, Patent, Publication, FundingOpportunity, UserFunding
from app.auth.hashing import hash_password
from datetime import datetime

def force_seed_database():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Drop and recreate tables to ensure schema matches models
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("Recreated database tables")
        
        # Clear any existing data in correct order to avoid foreign key constraints
        db.query(UserFunding).delete()
        db.query(ResearchProfile).delete()
        db.query(Patent).delete()
        db.query(Publication).delete()
        db.query(FundingOpportunity).delete()
        db.query(User).delete()
        db.query(Role).delete()
        db.query(Organization).delete()
        db.commit()
        print("Cleared existing data")
        
        # Create Roles
        admin_role = Role(role_name="Admin")
        researcher_role = Role(role_name="Researcher")
        org_admin_role = Role(role_name="Organization Admin")
        
        db.add_all([admin_role, researcher_role, org_admin_role])
        db.commit()
        db.refresh(admin_role)
        db.refresh(researcher_role)
        db.refresh(org_admin_role)
        
        print("Created roles")
        
        # Create Organization
        demo_org = Organization(
            organization_name="Demo University",
            organization_type="University",
            country="USA",
            website="https://demo.edu"
        )
        
        db.add(demo_org)
        db.commit()
        db.refresh(demo_org)
        
        print("Created organization")
        
        # Create Test Users
        test_users = [
            {
                "full_name": "Admin User",
                "email": "admin@demo.edu",
                "password": "admin123",
                "role_id": admin_role.id,
                "organization_id": demo_org.id
            },
            {
                "full_name": "John Researcher",
                "email": "researcher@demo.edu", 
                "password": "research123",
                "role_id": researcher_role.id,
                "organization_id": demo_org.id
            },
            {
                "full_name": "Jane Scientist",
                "email": "jane@demo.edu",
                "password": "science123",
                "role_id": researcher_role.id,
                "organization_id": demo_org.id
            }
        ]
        
        for user_data in test_users:
            new_user = User(
                full_name=user_data["full_name"],
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                role_id=user_data["role_id"],
                organization_id=user_data["organization_id"]
            )
            db.add(new_user)
        
        db.commit()
        print("Created test users")
        
        # Create Sample Research Profiles
        for user in db.query(User).all():
            research_profile = ResearchProfile(
                user_id=user.id,
                research_domain="Artificial Intelligence, Machine Learning, Data Science",
                technology_area="Deep Learning, Natural Language Processing, Computer Vision",
                keywords="AI, ML, neural networks, deep learning, NLP, computer vision",
                biography=f"Dr. {user.full_name} is a researcher specializing in AI and machine learning with expertise in deep learning applications.",
                experience_years=5,
                publication_count=12,
                patent_count=2
            )
            db.add(research_profile)
        
        db.commit()
        print("Created research profiles")
        
        # Create Sample Funding Opportunities
        sample_funding = [
            {
                "title": "NSF AI Research Initiative",
                "agency": "National Science Foundation",
                "description": "Support for fundamental research in artificial intelligence and machine learning.",
                "research_area": "Artificial Intelligence",
                "keywords": "AI, machine learning, neural networks, deep learning",
                "eligibility": "US academic institutions and researchers",
                "amount": 500000.0,
                "deadline": datetime.strptime("2025-12-31", "%Y-%m-%d").date(),
                "country": "USA",
                "application_url": "https://www.nsf.gov/funding/"
            },
            {
                "title": "NIH Biomedical Data Science Grant",
                "agency": "National Institutes of Health",
                "description": "Funding for data science applications in biomedical research.",
                "research_area": "Biomedical Informatics",
                "keywords": "data science, biomedical, healthcare, bioinformatics",
                "eligibility": "US and international researchers",
                "amount": 750000.0,
                "deadline": datetime.strptime("2025-06-30", "%Y-%m-%d").date(),
                "country": "USA",
                "application_url": "https://grants.nih.gov/"
            },
            {
                "title": "DARPA Machine Common Sense",
                "agency": "Defense Advanced Research Projects Agency",
                "description": "Develop AI systems with common sense reasoning capabilities.",
                "research_area": "Cognitive Computing",
                "keywords": "common sense, reasoning, cognitive AI, human-like understanding",
                "eligibility": "US researchers and organizations",
                "amount": 2000000.0,
                "deadline": datetime.strptime("2025-09-15", "%Y-%m-%d").date(),
                "country": "USA",
                "application_url": "https://www.darpa.mil/"
            },
            {
                "title": "EU Horizon Europe AI Innovation",
                "agency": "European Commission",
                "description": "Funding for AI innovation and deployment in Europe.",
                "research_area": "Artificial Intelligence",
                "keywords": "AI, innovation, Europe, deployment, ethics",
                "eligibility": "EU member states and associated countries",
                "amount": 1000000.0,
                "deadline": datetime.strptime("2025-08-01", "%Y-%m-%d").date(),
                "country": "EU",
                "application_url": "https://ec.europa.eu/info/horizon-europe"
            },
            {
                "title": "DOE Quantum Computing Research",
                "agency": "Department of Energy",
                "description": "Advancing quantum computing technologies and applications.",
                "research_area": "Quantum Computing",
                "keywords": "quantum, computing, algorithms, hardware",
                "eligibility": "US national laboratories and universities",
                "amount": 1500000.0,
                "deadline": datetime.strptime("2025-10-31", "%Y-%m-%d").date(),
                "country": "USA",
                "application_url": "https://www.energy.gov/"
            },
            {
                "title": "Google AI Research Awards",
                "agency": "Google",
                "description": "Support for AI research across various disciplines.",
                "research_area": "Artificial Intelligence",
                "keywords": "AI, machine learning, research, innovation",
                "eligibility": "Global academic researchers",
                "amount": 150000.0,
                "deadline": datetime.strptime("2025-04-15", "%Y-%m-%d").date(),
                "country": "Global",
                "application_url": "https://research.google.com/"
            },
            {
                "title": "Microsoft Azure AI Grant",
                "agency": "Microsoft",
                "description": "Azure credits and funding for AI research projects.",
                "research_area": "Cloud Computing",
                "keywords": "cloud, Azure, AI, distributed computing",
                "eligibility": "Academic researchers worldwide",
                "amount": 200000.0,
                "deadline": datetime.strptime("2025-07-01", "%Y-%m-%d").date(),
                "country": "Global",
                "application_url": "https://azure.microsoft.com/"
            },
            {
                "title": "AI for Climate Change Solutions",
                "agency": "United Nations",
                "description": "AI applications for climate change mitigation and adaptation.",
                "research_area": "Climate Science",
                "keywords": "climate, AI, sustainability, environment",
                "eligibility": "Global researchers and organizations",
                "amount": 300000.0,
                "deadline": datetime.strptime("2025-11-30", "%Y-%m-%d").date(),
                "country": "Global",
                "application_url": "https://un.org/"
            }
        ]
        
        for funding_data in sample_funding:
            funding = FundingOpportunity(**funding_data)
            db.add(funding)
        
        db.commit()
        print("Created sample funding opportunities")
        
        # Create Sample Publications
        sample_publications = [
            {
                "user_id": 2, # John Researcher
                "title": "Deep Learning for Medical Image Analysis",
                "journal": "Nature Medicine",
                "publication_year": 2024,
                "citation_count": 45,
                "research_area": "Medical Imaging"
            },
            {
                "user_id": 3, # Jane Scientist
                "title": "Natural Language Processing for Clinical Text",
                "journal": "JAMIA",
                "publication_year": 2024,
                "citation_count": 32,
                "research_area": "NLP"
            },
            {
                "user_id": 2, # John Researcher
                "title": "Graph Neural Networks for Drug Discovery",
                "journal": "Science",
                "publication_year": 2024,
                "citation_count": 67,
                "research_area": "Drug Discovery"
            },
            {
                "user_id": 2, # John Researcher
                "title": "Transformer Models for Protein Structure Prediction",
                "journal": "Nature Biotechnology",
                "publication_year": 2025,
                "citation_count": 89,
                "research_area": "Bioinformatics"
            },
            {
                "user_id": 3, # Jane Scientist
                "title": "Multi-modal AI in Healthcare",
                "journal": "Lancet Digital Health",
                "publication_year": 2025,
                "citation_count": 54,
                "research_area": "Healthcare AI"
            },
            {
                "user_id": 2, # John Researcher
                "title": "Federated Learning for Privacy-Preserving Medical Research",
                "journal": "IEEE Transactions on Medical Imaging",
                "publication_year": 2025,
                "citation_count": 41,
                "research_area": "Privacy-Preserving AI"
            },
            {
                "user_id": 3, # Jane Scientist
                "title": "Large Language Models for Clinical Decision Support",
                "journal": "NEJM AI",
                "publication_year": 2026,
                "citation_count": 23,
                "research_area": "Clinical AI"
            },
            {
                "user_id": 2, # John Researcher
                "title": "AI-Driven Drug Repurposing for Rare Diseases",
                "journal": "Cell Reports Medicine",
                "publication_year": 2026,
                "citation_count": 18,
                "research_area": "Drug Discovery"
            },
            {
                "user_id": 3, # Jane Scientist
                "title": "Explainable AI in Medical Imaging",
                "journal": "Radiology: AI",
                "publication_year": 2026,
                "citation_count": 15,
                "research_area": "Explainable AI"
            }
        ]
        
        for pub_data in sample_publications:
            publication = Publication(**pub_data)
            db.add(publication)
        
        db.commit()
        print("Created sample publications")
        
        # Create Sample Patents
        sample_patents = [
            {
                "user_id": 2, # John Researcher
                "title": "Method for Automated Medical Diagnosis",
                "filing_date": datetime.strptime("2023-06-15", "%Y-%m-%d").date(),
                "publication_date": datetime.strptime("2024-01-20", "%Y-%m-%d").date(),
                "inventors": "Dr. John Smith, Dr. Jane Doe",
                "assignee": "Demo University",
                "abstract": "A novel method for automated medical diagnosis using machine learning...",
                "technology_area": "Medical AI",
                "country": "USA",
                "status": "Granted"
            },
            {
                "user_id": 3, # Jane Scientist
                "title": "Natural Language Processing System for Clinical Notes",
                "filing_date": datetime.strptime("2023-08-20", "%Y-%m-%d").date(),
                "publication_date": None,
                "inventors": "Dr. Jane Scientist",
                "assignee": "Demo University",
                "abstract": "Advanced NLP system for processing clinical notes and extracting information...",
                "technology_area": "Clinical NLP",
                "country": "USA",
                "status": "Pending"
            }
        ]
        
        for patent_data in sample_patents:
            patent = Patent(**patent_data)
            db.add(patent)
        
        db.commit()
        print("Created sample patents")
        
        # Create Sample User-Funding Relationships (Saved and Applied)
        funding_opportunities = db.query(FundingOpportunity).all()
        users = db.query(User).all()
        
        if funding_opportunities and users:
            # Save some funding opportunities for users
            user_funding_saved = [
                UserFunding(
                    user_id=users[1].id,  # John Researcher
                    funding_id=funding_opportunities[0].id,  # NSF AI Research Initiative
                    status="saved"
                ),
                UserFunding(
                    user_id=users[1].id,  # John Researcher
                    funding_id=funding_opportunities[1].id,  # NIH Biomedical Data Science Grant
                    status="applied"
                ),
                UserFunding(
                    user_id=users[2].id,  # Jane Scientist
                    funding_id=funding_opportunities[2].id,  # DARPA Machine Common Sense
                    status="saved"
                ),
                UserFunding(
                    user_id=users[2].id,  # Jane Scientist
                    funding_id=funding_opportunities[3].id,  # EU Horizon Europe AI Innovation
                    status="applied"
                )
            ]
            
            for user_funding in user_funding_saved:
                db.add(user_funding)
            
            db.commit()
            print("Created sample user-funding relationships")
        
        print("\n" + "="*50)
        print("DATABASE SEEDED SUCCESSFULLY!")
        print("="*50)
        print("\nCreated:")
        print("- 3 Roles (Admin, Researcher, Organization Admin)")
        print("- 1 Organization (Demo University)")
        print("- 3 Test Users with Research Profiles")
        print("- 8 Sample Funding Opportunities")
        print("- 9 Sample Publications (spanning 2024-2026)")
        print("- 2 Sample Patents")
        print("- 4 Sample User-Funding Relationships")
        print("\nTest Accounts:")
        print("-" * 30)
        for user_data in test_users:
            print(f"Email: {user_data['email']}")
            print(f"Password: {user_data['password']}")
            print(f"Role: {user_data['role_id']}")
            print("-" * 30)
        
        print("\nYou can now:")
        print("1. Login with these test accounts")
        print("2. Register new accounts via the frontend")
        print("3. Role ID 1 = Admin, 2 = Researcher, 3 = Organization Admin")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    force_seed_database()