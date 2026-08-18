"""Generate a synthetic patents.csv dataset with ~500 records for Milestone 3."""
import csv
import random
import os

random.seed(42)

TECHNOLOGIES = [
    "Healthcare AI", "Machine Learning", "Computer Vision", "Robotics",
    "NLP", "LLM", "Quantum Computing", "IoT", "Blockchain",
    "Cybersecurity", "Energy AI", "Bioinformatics", "Autonomous Vehicles",
    "Edge Computing", "Generative AI", "Data Science"
]

# Year weights — more patents in recent years
YEAR_WEIGHTS = {
    2018: 30, 2019: 45, 2020: 55, 2021: 65, 2022: 75, 2023: 95, 2024: 135
}

COUNTRIES = ["USA", "China", "India", "Germany", "Japan", "South Korea", "UK", "Canada", "Israel", "France", "Australia", "Singapore"]
COUNTRY_WEIGHTS = [120, 100, 60, 35, 30, 25, 20, 15, 12, 10, 8, 5]

ASSIGNEES = {
    "Healthcare AI": ["Google Health", "IBM Watson Health", "Philips Healthcare", "Siemens Healthineers", "GE Healthcare", "Medtronic AI", "PathAI", "Tempus Labs", "Butterfly Network", "Zebra Medical"],
    "Machine Learning": ["Google DeepMind", "Meta AI", "Microsoft Research", "Amazon AI", "Apple ML", "NVIDIA Research", "Baidu Research", "Samsung AI", "Huawei Noah", "OpenAI"],
    "Computer Vision": ["Tesla Vision", "NVIDIA", "Intel Labs", "Qualcomm AI", "SenseTime", "Megvii", "Hikvision AI", "Cognex", "Mobileye", "Snap Research"],
    "Robotics": ["Boston Dynamics", "ABB Robotics", "Fanuc", "KUKA", "Universal Robots", "Agility Robotics", "Intuitive Surgical", "iRobot", "DJI", "Toyota Research"],
    "NLP": ["Google AI", "OpenAI", "Anthropic", "Cohere", "AI21 Labs", "Hugging Face", "Microsoft NLP", "Amazon Alexa", "Baidu NLP", "Samsung Bixby"],
    "LLM": ["OpenAI", "Google DeepMind", "Anthropic", "Meta AI", "Microsoft Research", "Cohere", "AI21 Labs", "Mistral AI", "Stability AI", "xAI"],
    "Quantum Computing": ["IBM Quantum", "Google Quantum AI", "Intel Quantum", "Rigetti Computing", "IonQ", "D-Wave Systems", "Xanadu", "Honeywell Quantum", "PsiQuantum", "Quantinuum"],
    "IoT": ["Cisco IoT", "Siemens IoT", "Bosch IoT", "Intel IoT", "Samsung SmartThings", "AWS IoT", "Azure IoT", "Particle", "Tuya Smart", "ARM IoT"],
    "Blockchain": ["Ethereum Foundation", "Ripple Labs", "Chainlink", "ConsenSys", "Circle", "Alchemy", "Polygon Labs", "Solana Labs", "Avalanche", "Hyperledger"],
    "Cybersecurity": ["CrowdStrike", "Palo Alto Networks", "Fortinet", "SentinelOne", "Darktrace", "Mandiant", "Recorded Future", "Tenable", "Snyk", "Rapid7"],
    "Energy AI": ["Siemens Energy", "GE Renewable", "Tesla Energy", "Vestas", "Schneider Electric", "Enphase Energy", "NextEra AI", "Shell AI", "TotalEnergies AI", "BP Digital"],
    "Bioinformatics": ["Illumina", "23andMe", "Genentech AI", "Recursion", "Insilico Medicine", "BenevolentAI", "Exscientia", "Relay Therapeutics", "AbCellera", "Schrödinger"],
    "Autonomous Vehicles": ["Waymo", "Tesla Autopilot", "Cruise", "Aurora Innovation", "Argo AI", "Mobileye", "Aptiv", "Motional", "Zoox", "TuSimple"],
    "Edge Computing": ["NVIDIA Edge", "Qualcomm Edge", "Intel Edge", "Google Edge TPU", "AWS Wavelength", "Azure Edge", "Arm Edge", "Xilinx", "Lattice Semi", "SiFive"],
    "Generative AI": ["OpenAI", "Stability AI", "Midjourney", "Adobe Firefly", "Google DeepMind", "Runway ML", "Jasper AI", "Anthropic", "Cohere", "Inflection AI"],
    "Data Science": ["Databricks", "Snowflake AI", "Palantir", "DataRobot", "H2O.ai", "Alteryx", "Dataiku", "Domino Data Lab", "Weights & Biases", "MLflow"],
}

CPC_CLASSES = {
    "Healthcare AI": "G16H", "Machine Learning": "G06N", "Computer Vision": "G06V",
    "Robotics": "B25J", "NLP": "G06F40", "LLM": "G06N3", "Quantum Computing": "G06N10",
    "IoT": "H04L67", "Blockchain": "H04L9", "Cybersecurity": "G06F21",
    "Energy AI": "H02J", "Bioinformatics": "G16B", "Autonomous Vehicles": "G05D1",
    "Edge Computing": "G06F9", "Generative AI": "G06N3", "Data Science": "G06F16"
}

INVENTORS_FIRST = ["James", "Sarah", "Wei", "Priya", "Carlos", "Emily", "Raj", "Lisa", "Tom", "Anita",
                   "Michael", "Neha", "Alex", "Maria", "David", "Yuki", "Chen", "Fatima", "John", "Aisha",
                   "Robert", "Min", "Arjun", "Elena", "Hassan", "Sophie", "Kenji", "Deepa", "Oliver", "Mei"]
INVENTORS_LAST = ["Smith", "Chen", "Patel", "Garcia", "Johnson", "Watson", "Kumar", "Park", "Wilson", "Desai",
                  "Brown", "Lee", "Rodriguez", "Kim", "Müller", "Tanaka", "Sharma", "Williams", "Zhang", "Gupta",
                  "Anderson", "Singh", "Martinez", "Nakamura", "Ali", "Taylor", "Suzuki", "Reddy", "Thompson", "Wang"]

TITLES = {
    "Healthcare AI": [
        "AI-Powered Diagnostic Imaging System for {}", "Deep Learning Framework for {} Disease Detection",
        "Automated {} Screening Using Neural Networks", "Predictive Analytics for {} Patient Outcomes",
        "Real-Time {} Monitoring with AI Assistance", "Computer-Aided {} Diagnosis Platform",
        "Federated Learning for {} Data Privacy", "AI-Enhanced {} Treatment Planning System",
        "Natural Language Processing for {} Records", "Multi-Modal AI for {} Pathology Analysis",
    ],
    "Machine Learning": [
        "Self-Supervised Learning Framework for {}", "Efficient {} Training with Sparse Networks",
        "Automated {} Selection and Hyperparameter Tuning", "Distributed {} Learning at Scale",
        "Few-Shot Learning for {} Classification", "Meta-Learning Architecture for {} Tasks",
        "Neural Architecture Search for {} Models", "Continual Learning System for {} Adaptation",
        "Transfer Learning Pipeline for {} Domains", "Ensemble {} Prediction System",
    ],
    "Computer Vision": [
        "Real-Time {} Detection Using Transformer Networks", "3D {} Reconstruction from Monocular Images",
        "Semantic {} Segmentation for Autonomous Systems", "Multi-Scale {} Recognition Framework",
        "Video {} Understanding with Temporal Attention", "Low-Light {} Enhancement Neural Network",
        "Cross-Domain {} Adaptation System", "Efficient {} Processing on Mobile Devices",
        "Panoptic {} Segmentation Architecture", "Self-Supervised {} Representation Learning",
    ],
    "Robotics": [
        "Adaptive {} Control Using Reinforcement Learning", "Multi-Agent {} Coordination System",
        "Haptic Feedback System for {} Manipulation", "Vision-Guided {} Assembly Platform",
        "Soft {} Actuator with Neural Control", "Human-Robot {} Collaboration Framework",
        "Autonomous {} Navigation in Complex Environments", "Dexterous {} Manipulation Controller",
        "Swarm {} Intelligence for Task Allocation", "Digital Twin for {} Process Optimization",
    ],
    "NLP": [
        "Multilingual {} Understanding System", "Context-Aware {} Generation Model",
        "Low-Resource {} Translation Framework", "Sentiment Analysis for {} Reviews",
        "Named Entity Recognition in {} Documents", "Question Answering System for {} Domains",
        "Text Summarization for {} Reports", "Dialog System for {} Customer Service",
        "Information Extraction from {} Publications", "Cross-Lingual {} Embedding Framework",
    ],
    "LLM": [
        "Efficient {} Inference with Model Compression", "Retrieval-Augmented {} Generation System",
        "Constitutional {} Alignment Framework", "Multi-Modal {} Understanding Architecture",
        "Long-Context {} Processing with Sparse Attention", "Fine-Tuning {} for Domain Adaptation",
        "Hallucination Detection in {} Outputs", "Chain-of-Thought {} Reasoning Engine",
        "Parameter-Efficient {} Fine-Tuning Method", "Instruction-Following {} Training Pipeline",
    ],
    "Quantum Computing": [
        "Quantum Error Correction for {} Circuits", "Hybrid Quantum-Classical {} Optimization",
        "Quantum {} Simulation on NISQ Devices", "Topological {} Qubit Architecture",
        "Quantum Machine Learning for {} Problems", "Variational Quantum {} Algorithm",
        "Quantum Key Distribution for {} Security", "Quantum {} Annealing Processor Design",
        "Fault-Tolerant {} Gate Implementation", "Quantum {} Entanglement Network Protocol",
    ],
    "IoT": [
        "Edge-Based {} Data Aggregation Platform", "Low-Power {} Sensor Network Architecture",
        "Real-Time {} Monitoring with IoT Mesh", "Predictive Maintenance for {} Systems",
        "IoT {} Security Framework with AI", "Digital Twin for {} Infrastructure",
        "Fog Computing for {} Data Processing", "Smart {} Management Using IoT Analytics",
        "Wireless {} Sensor Fusion System", "IoT-Enabled {} Quality Assurance",
    ],
    "Blockchain": [
        "Decentralized {} Verification Protocol", "Smart Contract Framework for {} Automation",
        "Cross-Chain {} Interoperability Bridge", "Zero-Knowledge {} Privacy System",
        "Tokenized {} Asset Management Platform", "Blockchain-Based {} Supply Chain Tracker",
        "Consensus Mechanism for {} Scalability", "DeFi {} Lending Protocol",
        "NFT Framework for {} Digital Assets", "Layer-2 {} Transaction Optimization",
    ],
    "Cybersecurity": [
        "AI-Powered {} Threat Detection System", "Zero-Trust {} Architecture Framework",
        "Behavioral {} Anomaly Detection Engine", "Automated {} Incident Response Platform",
        "Advanced {} Malware Analysis Using ML", "Network {} Intrusion Prevention System",
        "Adversarial {} Attack Defense Mechanism", "Privacy-Preserving {} Data Sharing Protocol",
        "Quantum-Resistant {} Encryption Method", "Real-Time {} Forensics Analysis Tool",
    ],
    "Energy AI": [
        "AI-Optimized {} Grid Management System", "Predictive {} Load Forecasting Model",
        "Smart {} Energy Storage Controller", "Renewable {} Integration Optimization",
        "AI-Driven {} Demand Response Platform", "Wind {} Power Prediction Neural Network",
        "Solar {} Panel Defect Detection System", "Battery {} Degradation Prediction Model",
        "Energy {} Trading Optimization Engine", "Carbon {} Footprint Tracking with AI",
    ],
    "Bioinformatics": [
        "Graph Neural Network for {} Prediction", "Protein {} Structure Prediction System",
        "Genomic {} Variant Classification Model", "Drug-Target {} Interaction Predictor",
        "Single-Cell {} Sequencing Analysis Platform", "CRISPR {} Guide RNA Design Tool",
        "Molecular {} Dynamics Simulation Accelerator", "Biomarker {} Discovery Pipeline",
        "Pharmacogenomics {} Recommendation Engine", "Metabolomics {} Pattern Recognition",
    ],
    "Autonomous Vehicles": [
        "Multi-Sensor {} Fusion for Navigation", "Predictive {} Path Planning Algorithm",
        "LiDAR-Camera {} Integration Framework", "V2X {} Communication Protocol",
        "Reinforcement Learning for {} Driving", "Pedestrian {} Behavior Prediction Model",
        "HD {} Map Construction System", "Autonomous {} Parking Controller",
        "Weather-Adaptive {} Perception System", "Fleet {} Management Optimization Engine",
    ],
    "Edge Computing": [
        "Neural Network {} Compression for Edge", "Real-Time {} Inference Accelerator",
        "Federated {} Learning on Edge Devices", "Low-Latency {} Processing Architecture",
        "Edge-Cloud {} Hybrid Orchestration", "TinyML {} Framework for Microcontrollers",
        "On-Device {} Model Adaptation System", "Power-Efficient {} AI Chip Design",
        "Distributed {} Edge Intelligence Platform", "5G-Edge {} Computing Integration",
    ],
    "Generative AI": [
        "Diffusion Model for {} Image Synthesis", "Text-to-{} Generation Architecture",
        "Controllable {} Content Creation System", "Style-Transfer {} Neural Network",
        "Multi-Modal {} Generation Framework", "Video {} Synthesis with Temporal Coherence",
        "3D {} Asset Generation from Text", "Music {} Composition Neural Network",
        "Code {} Generation with Semantic Understanding", "Personalized {} Avatar Creation System",
    ],
    "Data Science": [
        "Automated {} Feature Engineering Pipeline", "Scalable {} Data Processing Framework",
        "Real-Time {} Analytics Dashboard Engine", "AutoML for {} Model Selection",
        "Data {} Quality Monitoring System", "Causal {} Inference Analysis Platform",
        "Time-Series {} Forecasting Architecture", "Graph {} Analytics Processing Engine",
        "MLOps {} Pipeline Orchestration System", "Data {} Lineage Tracking Framework",
    ],
}

TITLE_FILLERS = {
    "Healthcare AI": ["Cancer", "Cardiac", "Retinal", "Pulmonary", "Neurological", "Dermatological", "Radiology", "Oncology", "Diabetes", "Mental Health"],
    "Machine Learning": ["Feature", "Model", "Algorithm", "Gradient", "Hyperparameter", "Distributed", "Online", "Batch", "Incremental", "Adaptive"],
    "Computer Vision": ["Object", "Scene", "Face", "Gesture", "Action", "Depth", "Surface", "Texture", "Motion", "Pose"],
    "Robotics": ["Robotic", "Gripper", "Arm", "Drone", "Surgical", "Warehouse", "Marine", "Aerial", "Legged", "Industrial"],
    "NLP": ["Clinical", "Legal", "Financial", "Scientific", "Social Media", "Biomedical", "Technical", "Academic", "Conversational", "Multilingual"],
    "LLM": ["Language Model", "Foundation Model", "Transformer", "Conversational AI", "Code LLM", "Vision-Language", "Reasoning", "Knowledge", "Multimodal", "Instruction"],
    "Quantum Computing": ["Superconducting", "Trapped-Ion", "Photonic", "Spin", "Topological", "Gate-Based", "Variational", "Hybrid", "Distributed", "Modular"],
    "IoT": ["Industrial", "Agricultural", "Healthcare", "Smart Home", "Wearable", "Vehicular", "Environmental", "Retail", "Logistics", "Building"],
    "Blockchain": ["Financial", "Healthcare", "Identity", "Supply Chain", "Carbon Credit", "Real Estate", "Insurance", "Voting", "Gaming", "Music"],
    "Cybersecurity": ["Network", "Cloud", "Endpoint", "IoT", "Email", "API", "Container", "Mobile", "DNS", "Web"],
    "Energy AI": ["Solar", "Wind", "Grid", "Battery", "Microgrid", "EV Charging", "HVAC", "Industrial", "Smart Building", "Hydrogen"],
    "Bioinformatics": ["Drug-Protein", "Gene Expression", "RNA", "Protein Folding", "Antibody", "Enzyme", "Pathway", "Cell", "Tissue", "Genome"],
    "Autonomous Vehicles": ["Urban", "Highway", "Intersection", "Parking", "Fleet", "Emergency", "Rural", "Weather", "Night-Vision", "Construction Zone"],
    "Edge Computing": ["Video", "Audio", "Sensor", "Image", "NLP", "Anomaly", "Predictive", "Classification", "Tracking", "Recognition"],
    "Generative AI": ["Image", "Video", "Audio", "3D Model", "Text", "Code", "Design", "Fashion", "Architecture", "Medical Image"],
    "Data Science": ["Streaming", "Batch", "Graph", "Tabular", "Geospatial", "Temporal", "Multi-Source", "Heterogeneous", "High-Dimensional", "Sparse"],
}

def generate_abstract(tech, title):
    templates = [
        f"A novel {tech.lower()} system that leverages advanced neural architectures to achieve state-of-the-art performance in {title.split(' for ')[-1].lower() if ' for ' in title else 'target applications'}.",
        f"This patent presents an innovative approach to {tech.lower()} combining deep learning with domain-specific optimization for enhanced accuracy and efficiency.",
        f"An end-to-end {tech.lower()} framework designed for scalable deployment, featuring automatic model optimization and real-time inference capabilities.",
        f"A breakthrough {tech.lower()} methodology that significantly improves upon existing approaches through novel architectural innovations and training strategies.",
        f"This invention introduces a {tech.lower()} solution with superior performance metrics, reduced computational requirements, and improved interpretability.",
    ]
    return random.choice(templates)


def main():
    patents = []
    patent_id = 1

    for year, count in YEAR_WEIGHTS.items():
        for _ in range(count):
            tech = random.choice(TECHNOLOGIES)
            country = random.choices(COUNTRIES, weights=COUNTRY_WEIGHTS, k=1)[0]
            assignee = random.choice(ASSIGNEES[tech])
            inventor = f"{random.choice(INVENTORS_FIRST)} {random.choice(INVENTORS_LAST)}"
            cpc = CPC_CLASSES[tech]

            title_template = random.choice(TITLES[tech])
            filler = random.choice(TITLE_FILLERS[tech])
            title = title_template.format(filler)

            # Citations: older patents have more, newer have fewer
            base_citations = max(0, (2025 - year) * random.randint(5, 25))
            citations = base_citations + random.randint(0, 30)

            abstract = generate_abstract(tech, title)

            patents.append({
                "Patent ID": f"P{patent_id:04d}",
                "Title": title,
                "Assignee": assignee,
                "Inventor": inventor,
                "Filing Date": f"{year}-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
                "Country": country,
                "Technology": tech,
                "CPC Class": cpc,
                "Citations": citations,
                "Abstract": abstract,
            })
            patent_id += 1

    # Write CSV
    output_path = os.path.join(os.path.dirname(__file__), "..", "dataset", "patents.csv")
    output_path = os.path.abspath(output_path)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Patent ID", "Title", "Assignee", "Inventor", "Filing Date", "Country", "Technology", "CPC Class", "Citations", "Abstract"])
        writer.writeheader()
        writer.writerows(patents)

    print(f"Generated {len(patents)} patents -> {output_path}")


if __name__ == "__main__":
    main()
