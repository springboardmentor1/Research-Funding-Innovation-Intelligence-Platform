from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class Question(BaseModel):
    question: str


@router.post("/assistant")
def assistant(data: Question):

    q = data.question.lower()

    if "artificial intelligence" in q or "ai" in q:
        answer = (
            "Suggested AI research topics:\n"
            "- Explainable AI\n"
            "- Medical AI\n"
            "- Edge AI\n"
            "- Federated Learning\n"
            "- Generative AI"
        )

    elif "machine learning" in q:
        answer = (
            "Machine Learning research areas:\n"
            "- Deep Learning\n"
            "- Reinforcement Learning\n"
            "- Transfer Learning\n"
            "- TinyML"
        )

    elif "cyber" in q:
        answer = (
            "Cybersecurity topics:\n"
            "- Zero Trust\n"
            "- Cloud Security\n"
            "- AI Threat Detection\n"
            "- IoT Security"
        )

    elif "blockchain" in q:
        answer = (
            "Blockchain topics:\n"
            "- Smart Contracts\n"
            "- Web3\n"
            "- DeFi\n"
            "- Supply Chain"
        )

    elif "funding" in q:
        answer = (
            "Funding Agencies:\n"
            "- NSF\n"
            "- Horizon Europe\n"
            "- NIH\n"
            "- DST India\n"
            "- AICTE"
        )

    elif "patent" in q:
        answer = (
            "Patent advice:\n"
            "Search existing patents before publishing and ensure your work is novel."
        )

    else:
        answer = (
            "I can help with:\n"
            "- Research Topics\n"
            "- Funding Opportunities\n"
            "- Patents\n"
            "- Innovation Ideas"
        )

    return {
        "answer": answer
    }