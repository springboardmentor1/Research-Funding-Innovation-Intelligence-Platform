from app.database.database import SessionLocal
from app.models.funding import FundingOpportunity
from app.models.user_funding import UserFunding
from datetime import datetime, timedelta

def seed_funding_opportunities():
    db = SessionLocal()
    
    try:
        # Check if funding data already exists
        existing_funding = db.query(FundingOpportunity).first()
        if existing_funding:
            print("Funding opportunities already exist. Re-seeding...")
            # Clear user_funding references first
            db.query(UserFunding).delete()
            db.commit()
            # Then clear funding opportunities
            db.query(FundingOpportunity).delete()
            db.commit()
            print("Cleared existing funding data for re-seeding")
        
        # Sample funding opportunities
        funding_opportunities = [
            {
                "title": "NSF CAREER Award: Machine Learning for Healthcare",
                "agency": "National Science Foundation",
                "description": "Supports early-career faculty in machine learning applications for healthcare improvement and patient outcomes.",
                "research_area": "Artificial Intelligence",
                "keywords": "machine learning, healthcare, AI, medical imaging",
                "eligibility": "Early-career faculty, US citizens",
                "amount": 500000,
                "deadline": datetime.now() + timedelta(days=90),
                "country": "United States",
                "application_url": "https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=503237"
            },
            {
                "title": "NIH R01: Cancer Research and Drug Discovery",
                "agency": "National Institutes of Health",
                "description": "Supports innovative cancer research projects focusing on novel drug discovery mechanisms and therapeutic approaches.",
                "research_area": "Biomedical Research",
                "keywords": "cancer research, drug discovery, oncology, therapeutics",
                "eligibility": "Researchers at accredited institutions",
                "amount": 2500000,
                "deadline": datetime.now() + timedelta(days=60),
                "country": "United States",
                "application_url": "https://grants.nih.gov/grants/guide/rfa-files/RFA-CA-23-001.html"
            },
            {
                "title": "DOE Quantum Information Science Research",
                "agency": "Department of Energy",
                "description": "Advances quantum information science research including quantum computing, communication, and sensing technologies.",
                "research_area": "Quantum Computing",
                "keywords": "quantum computing, quantum information, physics, cryptography",
                "eligibility": "US academic institutions, national labs",
                "amount": 1500000,
                "deadline": datetime.now() + timedelta(days=45),
                "country": "United States",
                "application_url": "https://science.osti.gov/np/Quantum-Information-Science"
            },
            {
                "title": "NASA Space Technology Research Grants",
                "agency": "National Aeronautics and Space Administration",
                "description": "Supports innovative space technology research in propulsion, materials, and communication systems.",
                "research_area": "Space Technology",
                "keywords": "space technology, propulsion, aerospace, materials science",
                "eligibility": "US researchers, academic institutions",
                "amount": 750000,
                "deadline": datetime.now() + timedelta(days=120),
                "country": "United States",
                "application_url": "https://nasa.gov/directorates/spacetech/home/"
            },
            {
                "title": "DARPA AI Next Campaign",
                "agency": "Defense Advanced Research Projects Agency",
                "description": "Invests in cutting-edge AI research including machine learning, robotics, and human-AI collaboration.",
                "research_area": "Artificial Intelligence",
                "keywords": "AI, machine learning, robotics, defense technology",
                "eligibility": "US organizations, researchers",
                "amount": 2000000,
                "deadline": datetime.now() + timedelta(days=30),
                "country": "United States",
                "application_url": "https://www.darpa.mil/program/artificial-intelligence"
            },
            {
                "title": "USDA Climate Smart Agriculture",
                "agency": "Department of Agriculture",
                "description": "Supports research in climate-smart agriculture practices, sustainable farming, and food security.",
                "research_area": "Agricultural Science",
                "keywords": "agriculture, climate change, sustainability, food security",
                "eligibility": "Agricultural researchers, institutions",
                "amount": 600000,
                "deadline": datetime.now() + timedelta(days=75),
                "country": "United States",
                "application_url": "https://www.usda.gov/climate-solutions"
            },
            {
                "title": "EPA Environmental Justice Research",
                "agency": "Environmental Protection Agency",
                "description": "Funds research addressing environmental justice issues in disadvantaged communities.",
                "research_area": "Environmental Science",
                "keywords": "environmental justice, pollution, community health, sustainability",
                "eligibility": "Academic institutions, NGOs",
                "amount": 400000,
                "deadline": datetime.now() + timedelta(days=100),
                "country": "United States",
                "application_url": "https://www.epa.gov/environmental-justice"
            },
            {
                "title": "Smithsonian Conservation Research",
                "agency": "Smithsonian Institution",
                "description": "Supports conservation science research, biodiversity studies, and cultural heritage preservation.",
                "research_area": "Conservation Science",
                "keywords": "conservation, biodiversity, cultural heritage, museums",
                "eligibility": "Conservation researchers, scientists",
                "amount": 350000,
                "deadline": datetime.now() + timedelta(days=150),
                "country": "United States",
                "application_url": "https://www.si.edu/conservation"
            },
            {
                "title": "IEEE Humanitarian Technology Research",
                "agency": "IEEE Foundation",
                "description": "Supports technology research addressing humanitarian challenges and disaster response.",
                "research_area": "Humanitarian Technology",
                "keywords": "humanitarian, disaster response, technology for good, social impact",
                "eligibility": "IEEE members, researchers worldwide",
                "amount": 250000,
                "deadline": datetime.now() + timedelta(days=180),
                "country": "International",
                "application_url": "https://ieee.org/humanitarian-technology"
            },
            {
                "title": "Gates Foundation Global Health Innovation",
                "agency": "Bill & Melinda Gates Foundation",
                "description": "Funds innovative global health solutions, medical technologies, and disease eradication programs.",
                "research_area": "Global Health",
                "keywords": "global health, medical technology, disease eradication, public health",
                "eligibility": "Global researchers, institutions",
                "amount": 3000000,
                "deadline": datetime.now() + timedelta(days=200),
                "country": "International",
                "application_url": "https://www.gatesfoundation.org"
            },
            {
                "title": "Google AI Research Awards",
                "agency": "Google LLC",
                "description": "Supports cutting-edge AI research in machine learning, natural language processing, and computer vision.",
                "research_area": "Artificial Intelligence",
                "keywords": "AI, machine learning, NLP, computer vision, deep learning",
                "eligibility": "Faculty researchers worldwide",
                "amount": 150000,
                "deadline": datetime.now() + timedelta(days=60),
                "country": "International",
                "application_url": "https://ai.google/research/awards"
            },
            {
                "title": "Microsoft Research PhD Fellowship",
                "agency": "Microsoft Corporation",
                "description": "Supports exceptional PhD students in computing research fields including AI, systems, and security.",
                "research_area": "Computer Science",
                "keywords": "PhD fellowship, computer science, AI, systems, security",
                "eligibility": "PhD students worldwide",
                "amount": 50000,
                "deadline": datetime.now() + timedelta(days=30),
                "country": "International",
                "application_url": "https://www.microsoft.com/research/academic-program/phd-fellowship"
            },
            {
                "title": "OpenAI Research Grant: Large Language Model Safety",
                "agency": "OpenAI",
                "description": "Supports research on alignment, safety, and robustness of large language models and AI systems.",
                "research_area": "Artificial Intelligence",
                "keywords": "LLM, AI safety, alignment, large language models, GPT",
                "eligibility": "Researchers worldwide",
                "amount": 100000,
                "deadline": datetime.now() + timedelta(days=45),
                "country": "International",
                "application_url": "https://openai.com/research-grants"
            },
            {
                "title": "Meta AI Research: Computer Vision and Perception",
                "agency": "Meta (Facebook)",
                "description": "Funds research in computer vision, visual perception, and multimodal AI systems.",
                "research_area": "Computer Vision",
                "keywords": "computer vision, perception, multimodal AI, visual recognition",
                "eligibility": "Academic researchers and industry partners",
                "amount": 200000,
                "deadline": datetime.now() + timedelta(days=60),
                "country": "International",
                "application_url": "https://ai.facebook.com/research"
            },
            {
                "title": "Anthropic AI Safety Research Awards",
                "agency": "Anthropic",
                "description": "Supports research on AI safety, interpretability, and beneficial AI systems.",
                "research_area": "AI Safety",
                "keywords": "AI safety, interpretability, beneficial AI, constitutional AI",
                "eligibility": "Researchers and institutions",
                "amount": 150000,
                "deadline": datetime.now() + timedelta(days=90),
                "country": "International",
                "application_url": "https://anthropic.com/research"
            },
            {
                "title": "DeepMind Research Scholar Program",
                "agency": "DeepMind",
                "description": "Supports outstanding researchers in machine learning, neuroscience, and AI for social good.",
                "research_area": "Machine Learning",
                "keywords": "machine learning, neuroscience, AI for social good, deep learning",
                "eligibility": "Graduate students and postdocs",
                "amount": 75000,
                "deadline": datetime.now() + timedelta(days=120),
                "country": "International",
                "application_url": "https://deepmind.com/research"
            },
            {
                "title": "Amazon Research Awards: Machine Learning",
                "agency": "Amazon",
                "description": "Funds academic research in machine learning, natural language understanding, and AI applications.",
                "research_area": "Machine Learning",
                "keywords": "machine learning, NLU, AI applications, AWS",
                "eligibility": "Faculty researchers worldwide",
                "amount": 80000,
                "deadline": datetime.now() + timedelta(days=75),
                "country": "International",
                "application_url": "https://www.amazon.science/research-programs"
            },
            {
                "title": "IBM Research AI for Science",
                "agency": "IBM",
                "description": "Supports AI applications in scientific discovery, materials science, and computational biology.",
                "research_area": "AI for Science",
                "keywords": "AI for science, materials science, computational biology, discovery",
                "eligibility": "Researchers at academic institutions",
                "amount": 175000,
                "deadline": datetime.now() + timedelta(days=100),
                "country": "International",
                "application_url": "https://research.ibm.com/artificial-intelligence"
            },
            {
                "title": "NVIDIA AI Research Grant Program",
                "agency": "NVIDIA",
                "description": "Provides hardware grants and funding for research in AI, deep learning, and accelerated computing.",
                "research_area": "Deep Learning",
                "keywords": "deep learning, GPU computing, accelerated AI, neural networks",
                "eligibility": "Academic researchers and students",
                "amount": 50000,
                "deadline": datetime.now() + timedelta(days=50),
                "country": "International",
                "application_url": "https://developer.nvidia.com/research"
            },
            {
                "title": "Allen Institute for AI Research Grants",
                "agency": "Allen Institute for AI",
                "description": "Supports research in natural language processing, commonsense reasoning, and AI systems.",
                "research_area": "Natural Language Processing",
                "keywords": "NLP, commonsense reasoning, AI systems, semantic understanding",
                "eligibility": "Researchers worldwide",
                "amount": 125000,
                "deadline": datetime.now() + timedelta(days=85),
                "country": "International",
                "application_url": "https://allenai.org/research"
            },
            {
                "title": "Stanford Human-Centered AI Research Grants",
                "agency": "Stanford University",
                "description": "Funds research on human-centered AI, AI ethics, and socially responsible AI development.",
                "research_area": "AI Ethics",
                "keywords": "human-centered AI, AI ethics, responsible AI, social impact",
                "eligibility": "Academic researchers and graduate students",
                "amount": 100000,
                "deadline": datetime.now() + timedelta(days=110),
                "country": "United States",
                "application_url": "https://hai.stanford.edu/research"
            },
            {
                "title": "MIT AI Research Initiative: Autonomous Systems",
                "agency": "Massachusetts Institute of Technology",
                "description": "Supports research in autonomous systems, robotics, and intelligent decision-making.",
                "research_area": "Robotics",
                "keywords": "autonomous systems, robotics, intelligent systems, decision-making",
                "eligibility": "MIT researchers and collaborators",
                "amount": 250000,
                "deadline": datetime.now() + timedelta(days=70),
                "country": "United States",
                "application_url": "https://mit.edu/ai"
            },
            {
                "title": "Carnegie Mellon AI Research: Reinforcement Learning",
                "agency": "Carnegie Mellon University",
                "description": "Funds research in reinforcement learning, sequential decision-making, and AI control systems.",
                "research_area": "Reinforcement Learning",
                "keywords": "reinforcement learning, sequential decision-making, AI control, robotics",
                "eligibility": "Academic researchers",
                "amount": 180000,
                "deadline": datetime.now() + timedelta(days=95),
                "country": "United States",
                "application_url": "https://cmu.edu/ai"
            },
            {
                "title": "Berkeley AI Research: Computer Vision",
                "agency": "UC Berkeley",
                "description": "Supports research in computer vision, visual recognition, and deep learning for visual understanding.",
                "research_area": "Computer Vision",
                "keywords": "computer vision, visual recognition, deep learning, image understanding",
                "eligibility": "Berkeley researchers and affiliates",
                "amount": 150000,
                "deadline": datetime.now() + timedelta(days=80),
                "country": "United States",
                "application_url": "https://baair.berkeley.edu"
            },
            {
                "title": "Google Brain Research: Generative Models",
                "agency": "Google",
                "description": "Funds research on generative models, diffusion models, and creative AI applications.",
                "research_area": "Generative AI",
                "keywords": "generative models, diffusion models, creative AI, image generation",
                "eligibility": "Researchers and engineers",
                "amount": 200000,
                "deadline": datetime.now() + timedelta(days=65),
                "country": "International",
                "application_url": "https://ai.google/research/brain"
            },
            {
                "title": "Microsoft Azure AI Research: Conversational AI",
                "agency": "Microsoft",
                "description": "Supports research in conversational AI, dialogue systems, and natural language understanding.",
                "research_area": "Conversational AI",
                "keywords": "conversational AI, dialogue systems, NLU, chatbots",
                "eligibility": "Academic and industry researchers",
                "amount": 120000,
                "deadline": datetime.now() + timedelta(days=55),
                "country": "International",
                "application_url": "https://azure.microsoft.com/en-us/research"
            },
            {
                "title": "Hugging Face AI Research Grant",
                "agency": "Hugging Face",
                "description": "Supports open-source AI research, transformer models, and democratization of AI technologies.",
                "research_area": "Open Source AI",
                "keywords": "open source AI, transformers, democratization, NLP",
                "eligibility": "Open-source contributors and researchers",
                "amount": 75000,
                "deadline": datetime.now() + timedelta(days=105),
                "country": "International",
                "application_url": "https://huggingface.co/research"
            },
            {
                "title": "Stability AI Research Grant: Creative AI",
                "agency": "Stability AI",
                "description": "Funds research in generative AI, creative applications, and open-source AI models.",
                "research_area": "Creative AI",
                "keywords": "generative AI, creative applications, open source, Stable Diffusion",
                "eligibility": "Artists and researchers",
                "amount": 100000,
                "deadline": datetime.now() + timedelta(days=90),
                "country": "International",
                "application_url": "https://stability.ai/research"
            },
            {
                "title": "Cohere Research: Large Language Models",
                "agency": "Cohere",
                "description": "Supports research on large language models, NLP applications, and enterprise AI solutions.",
                "research_area": "Natural Language Processing",
                "keywords": "large language models, NLP, enterprise AI, text generation",
                "eligibility": "Researchers and developers",
                "amount": 90000,
                "deadline": datetime.now() + timedelta(days=75),
                "country": "International",
                "application_url": "https://cohere.com/research"
            },
            {
                "title": "Adept AI Research: Agentic Systems",
                "agency": "Adept AI",
                "description": "Funds research on agentic AI systems, AI agents, and autonomous task execution.",
                "research_area": "Agentic AI",
                "keywords": "agentic AI, AI agents, autonomous systems, task execution",
                "eligibility": "AI researchers and engineers",
                "amount": 130000,
                "deadline": datetime.now() + timedelta(days=85),
                "country": "International",
                "application_url": "https://adept.ai/research"
            },
            {
                "title": "Inflection AI Research: Personal AI",
                "agency": "Inflection AI",
                "description": "Supports research on personal AI assistants, human-AI interaction, and empathetic AI systems.",
                "research_area": "Personal AI",
                "keywords": "personal AI, human-AI interaction, empathetic AI, conversational agents",
                "eligibility": "Researchers in HCI and AI",
                "amount": 110000,
                "deadline": datetime.now() + timedelta(days=95),
                "country": "International",
                "application_url": "https://inflection.ai/research"
            },
            {
                "title": "Character.AI Research: Dialogue Systems",
                "agency": "Character.AI",
                "description": "Funds research on advanced dialogue systems, character AI, and interactive conversational agents.",
                "research_area": "Dialogue Systems",
                "keywords": "dialogue systems, character AI, conversational agents, interactive AI",
                "eligibility": "NLP and AI researchers",
                "amount": 85000,
                "deadline": datetime.now() + timedelta(days=70),
                "country": "International",
                "application_url": "https://character.ai/research"
            },
            {
                "title": "NSF AI Institute for Artificial Intelligence",
                "agency": "National Science Foundation",
                "description": "Supports interdisciplinary AI research institutes focusing on fundamental AI advances and applications.",
                "research_area": "Artificial Intelligence",
                "keywords": "AI institutes, interdisciplinary AI, fundamental AI, AI applications",
                "eligibility": "US academic institutions",
                "amount": 5000000,
                "deadline": datetime.now() + timedelta(days=120),
                "country": "United States",
                "application_url": "https://www.nsf.gov/ai/institutes"
            },
            {
                "title": "DARPA Machine Common Sense Program",
                "agency": "Defense Advanced Research Projects Agency",
                "description": "Develops AI systems with common sense reasoning capabilities for complex real-world tasks.",
                "research_area": "Common Sense AI",
                "keywords": "common sense reasoning, cognitive AI, human-like reasoning, machine understanding",
                "eligibility": "US research organizations",
                "amount": 2500000,
                "deadline": datetime.now() + timedelta(days=60),
                "country": "United States",
                "application_url": "https://www.darpa.mil/program/machine-common-sense"
            },
            {
                "title": "IARPA AI Research: Machine Intelligence",
                "agency": "Intelligence Advanced Research Projects Activity",
                "description": "Funds research in machine intelligence, data analytics, and AI for intelligence applications.",
                "research_area": "Machine Intelligence",
                "keywords": "machine intelligence, data analytics, AI for intelligence, pattern recognition",
                "eligibility": "US researchers and contractors",
                "amount": 1800000,
                "deadline": datetime.now() + timedelta(days=90),
                "country": "United States",
                "application_url": "https://www.iarpa.gov"
            },
            {
                "title": "European Research Council: AI and Machine Learning",
                "agency": "European Research Council",
                "description": "Supports frontier research in artificial intelligence, machine learning, and computational intelligence.",
                "research_area": "Artificial Intelligence",
                "keywords": "frontier research, machine learning, computational intelligence, European AI",
                "eligibility": "European researchers",
                "amount": 2500000,
                "deadline": datetime.now() + timedelta(days=150),
                "country": "European Union",
                "application_url": "https://erc.europa.eu"
            },
            {
                "title": "UKRI AI for Healthcare Research",
                "agency": "UK Research and Innovation",
                "description": "Funds AI applications in healthcare, medical imaging, and clinical decision support systems.",
                "research_area": "AI for Healthcare",
                "keywords": "AI healthcare, medical imaging, clinical decision support, medical AI",
                "eligibility": "UK researchers and institutions",
                "amount": 1200000,
                "deadline": datetime.now() + timedelta(days=100),
                "country": "United Kingdom",
                "application_url": "https://ukri.org/research"
            },
            {
                "title": "German Research Foundation: Machine Learning",
                "agency": "Deutsche Forschungsgemeinschaft (DFG)",
                "description": "Supports basic research in machine learning, pattern recognition, and intelligent data analysis.",
                "research_area": "Machine Learning",
                "keywords": "machine learning, pattern recognition, data analysis, German research",
                "eligibility": "German researchers",
                "amount": 800000,
                "deadline": datetime.now() + timedelta(days=130),
                "country": "Germany",
                "application_url": "https://dfg.de"
            },
            {
                "title": "France AI Research: ANR AI Program",
                "agency": "French National Research Agency",
                "description": "Funds research in artificial intelligence, deep learning, and AI applications across domains.",
                "research_area": "Artificial Intelligence",
                "keywords": "French AI, deep learning, AI applications, European AI research",
                "eligibility": "French researchers and institutions",
                "amount": 950000,
                "deadline": datetime.now() + timedelta(days=110),
                "country": "France",
                "application_url": "https://anr.fr"
            },
            {
                "title": "Japan AI Research: JST Moonshot",
                "agency": "Japan Science and Technology Agency",
                "description": "Supports ambitious AI research including robotics, human-AI collaboration, and social AI.",
                "research_area": "AI and Robotics",
                "keywords": "Japanese AI, robotics, human-AI collaboration, social AI",
                "eligibility": "Japanese researchers",
                "amount": 1500000,
                "deadline": datetime.now() + timedelta(days=140),
                "country": "Japan",
                "application_url": "https://jst.go.jp"
            },
            {
                "title": "Canada AI Research: CIFAR AI Chairs",
                "agency": "Canadian Institute for Advanced Research",
                "description": "Supports world-leading AI researchers in machine learning, deep learning, and AI ethics.",
                "research_area": "Artificial Intelligence",
                "keywords": "Canadian AI, machine learning, deep learning, AI ethics",
                "eligibility": "Canadian researchers",
                "amount": 1000000,
                "deadline": datetime.now() + timedelta(days=115),
                "country": "Canada",
                "application_url": "https://cifar.ca/ai"
            },
            {
                "title": "Australia AI Research: AI for Science",
                "agency": "Australian Research Council",
                "description": "Funds AI applications in scientific research, climate modeling, and environmental monitoring.",
                "research_area": "AI for Science",
                "keywords": "Australian AI, AI for science, climate modeling, environmental AI",
                "eligibility": "Australian researchers",
                "amount": 700000,
                "deadline": datetime.now() + timedelta(days=125),
                "country": "Australia",
                "application_url": "https://arc.gov.au"
            },
            {
                "title": "Singapore AI Research: AI Singapore",
                "agency": "National Research Foundation Singapore",
                "description": "Supports AI research in healthcare, finance, smart cities, and industry applications.",
                "research_area": "Applied AI",
                "keywords": "Singapore AI, applied AI, smart cities, industry AI",
                "eligibility": "Singapore-based researchers",
                "amount": 850000,
                "deadline": datetime.now() + timedelta(days=95),
                "country": "Singapore",
                "application_url": "https://aisingapore.org"
            },
            {
                "title": "China AI Research: NSFC AI Projects",
                "agency": "National Natural Science Foundation of China",
                "description": "Funds fundamental research in artificial intelligence, pattern recognition, and cognitive computing.",
                "research_area": "Artificial Intelligence",
                "keywords": "Chinese AI, pattern recognition, cognitive computing, fundamental AI",
                "eligibility": "Chinese researchers",
                "amount": 1200000,
                "deadline": datetime.now() + timedelta(days=135),
                "country": "China",
                "application_url": "https://nsfc.gov.cn"
            },
            {
                "title": "India AI Research: Digital India AI",
                "agency": "Ministry of Electronics and IT",
                "description": "Supports AI research for healthcare, agriculture, education, and smart city initiatives.",
                "research_area": "Applied AI",
                "keywords": "Indian AI, healthcare AI, agricultural AI, smart cities",
                "eligibility": "Indian researchers and institutions",
                "amount": 600000,
                "deadline": datetime.now() + timedelta(days=105),
                "country": "India",
                "application_url": "https://meity.gov.in"
            }
        ]
        
        # Add funding opportunities to database
        for funding_data in funding_opportunities:
            funding = FundingOpportunity(**funding_data)
            db.add(funding)
        
        db.commit()
        print(f"Created {len(funding_opportunities)} funding opportunities")
        
        print("\n" + "="*50)
        print("FUNDING OPPORTUNITIES SEEDED SUCCESSFULLY!")
        print("="*50)
        print(f"Total funding opportunities: {len(funding_opportunities)}")
        print("\nSample searches:")
        print("- 'machine learning' - will return multiple results")
        print("- 'AI' - will return multiple results")
        print("- 'NLP' - will return multiple results")
        print("- 'robotics' - will return multiple results")
        print("- 'GPT' - will return relevant results")
        print("- 'agentic AI' - will return relevant results")
        
    except Exception as e:
        print(f"Error seeding funding opportunities: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_funding_opportunities()
