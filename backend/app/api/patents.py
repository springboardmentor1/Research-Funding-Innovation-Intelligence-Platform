from fastapi import APIRouter

router = APIRouter()

patents = [
    {
        "id": 1,
        "title": "AI-based Disease Prediction System",
        "inventor": "John Smith",
        "year": 2024,
        "domain": "Artificial Intelligence",
        "description": "An AI system that predicts diseases using patient health records and deep learning."
    },
    {
        "id": 2,
        "title": "Autonomous Vehicle Navigation",
        "inventor": "Emily Johnson",
        "year": 2023,
        "domain": "Robotics",
        "description": "Navigation system for autonomous vehicles using LiDAR, GPS, and computer vision."
    },
    {
        "id": 3,
        "title": "Blockchain Medical Records",
        "inventor": "Alice Brown",
        "year": 2022,
        "domain": "Blockchain",
        "description": "A secure decentralized healthcare record management platform."
    },
    {
        "id": 4,
        "title": "Quantum Optimization Processor",
        "inventor": "David Wilson",
        "year": 2025,
        "domain": "Quantum Computing",
        "description": "Quantum computing processor optimized for scientific simulations."
    },
    {
        "id": 5,
        "title": "Smart Agricultural Monitoring",
        "inventor": "Sophia Miller",
        "year": 2024,
        "domain": "IoT",
        "description": "IoT-based precision farming system for monitoring soil and crop health."
    }
]


@router.get("/patents")
def get_patents():
    return patents