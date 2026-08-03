def get_hotspot_trends() -> dict:
    """
    Returns simulated yet realistic historical trend data (2021-2026) for major technology hotspots.
    Used to drive the Research Trend Intelligence dashboards.
    """
    return {
        "hotspots": [
            {"name": "Generative AI", "growth": "+142%", "publications": 45000, "status": "Hotspot"},
            {"name": "Quantum Computing", "growth": "+38%", "publications": 8200, "status": "Emerging"},
            {"name": "Solid-State Batteries", "growth": "+65%", "publications": 12400, "status": "Hotspot"},
            {"name": "6G Telecom Protocols", "growth": "+90%", "publications": 6300, "status": "Emerging"},
            {"name": "CRISPR Gene Therapies", "growth": "+22%", "publications": 18500, "status": "Stable"}
        ],
        "historical_data": [
            {"year": "2021", "Generative AI": 2500, "Quantum Computing": 2100, "Solid-State Batteries": 3200, "6G Telecom": 450},
            {"year": "2022", "Generative AI": 6800, "Quantum Computing": 3400, "Solid-State Batteries": 4900, "6G Telecom": 1200},
            {"year": "2023", "Generative AI": 15400, "Quantum Computing": 4800, "Solid-State Batteries": 6800, "6G Telecom": 2300},
            {"year": "2024", "Generative AI": 28000, "Quantum Computing": 6100, "Solid-State Batteries": 8900, "6G Telecom": 4100},
            {"year": "2025", "Generative AI": 45000, "Quantum Computing": 8200, "Solid-State Batteries": 12400, "6G Telecom": 6300}
        ]
    }
