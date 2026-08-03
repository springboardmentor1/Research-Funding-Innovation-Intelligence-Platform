def recommend_funding(research_topic, funding_opportunities):
    """
    Recommend funding opportunities based on the research topic.
    """

    # Convert research topic to lowercase
    research_topic = research_topic.lower().strip()

    # Common words that should not affect matching
    stop_words = {
        "for",
        "and",
        "the",
        "of",
        "in",
        "on",
        "a",
        "an",
        "to",
        "using",
        "with"
    }

    # Extract meaningful keywords
    keywords = [
        word.strip(".,!?")
        for word in research_topic.split()
        if word.strip(".,!?") not in stop_words
    ]

    recommendations = []

    # Check every funding opportunity
    for opportunity in funding_opportunities:

        title = opportunity.get("title", "").lower()
        description = opportunity.get("description", "").lower()

        # Count matches
        title_matches = 0
        description_matches = 0

        for keyword in keywords:

            # Match in title
            if keyword in title:
                title_matches += 1

            # Match in description
            if keyword in description:
                description_matches += 1

        # Calculate score
        if len(keywords) > 0:

            # Title match is given more importance
            title_score = (title_matches / len(keywords)) * 70

            # Description match
            description_score = (description_matches / len(keywords)) * 30

            match_score = title_score + description_score

        else:
            match_score = 0

        # Create a copy so original data is not modified
        opportunity_copy = opportunity.copy()

        # Add matching information
        opportunity_copy["match_score"] = round(match_score, 2)

        opportunity_copy["matched_keywords"] = [
            keyword
            for keyword in keywords
            if keyword in title or keyword in description
        ]

        recommendations.append(opportunity_copy)

    # Sort by highest match score
    recommendations.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return recommendations