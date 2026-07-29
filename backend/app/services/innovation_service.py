from datetime import date


def calculate_innovation_score(patent):
    score = 0

    if patent.status and patent.status.lower() == "granted":
        score += 30

    if patent.filing_date:
        years = date.today().year - patent.filing_date.year
        if years <= 5:
            score += 30

    if patent.technology_area:
        score += 20

    if patent.country:
        score += 20

    return score