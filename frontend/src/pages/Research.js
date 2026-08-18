import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const ALL_PAPERS = [
    {
        id: 1,
        Title: "Quantum Computing Applications in Cryptographic Security",
        "Fields of science": "Quantum Computing",
        "Project start date": "2026-03-15",
        Teaser:
            "An in-depth analysis of post-quantum cryptography algorithms designed to withstand attacks from next-generation quantum processing units.",
        URL: "#",
        "Project acronym": "QUANT-SEC"
    },
    {
        id: 2,
        Title: "CRISPR-Cas12 Targeted Gene Editing in Agricultural Resilience",
        "Fields of science": "Biotechnology",
        "Project start date": "2026-01-28",
        Teaser:
            "Evaluating drought-resistant crop modifications using CRISPR-Cas12 sequence targeted insertions in arid soil conditions.",
        URL: "#",
        "Project acronym": "CRISPR-AG"
    },
    {
        id: 3,
        Title: "Autonomous Drone Swarm Logistics for Emergency Response",
        "Fields of science": "Robotics",
        "Project start date": "2025-11-10",
        Teaser:
            "Framework for decentralizing decision-making across disaster-relief drone swarms operating without active GPS links.",
        URL: "#",
        "Project acronym": "DRONE-AI"
    },
    {
        id: 4,
        Title: "Deep Reinforcement Learning for Humanoid Balance Control",
        "Fields of science": "Robotics",
        "Project start date": "2026-02-04",
        Teaser:
            "Neural network architectures trained in simulation environments to maintain dynamic bipedal stability over uneven terrain.",
        URL: "#",
        "Project acronym": "ROBO-BAL"
    },
    {
        id: 5,
        Title: "Large Language Models in Automated Medical Diagnostics",
        "Fields of science": "Artificial Intelligence",
        "Project start date": "2026-04-12",
        Teaser:
            "Fine-tuning transformer models on clinical trial data to assist radiologists with early tumor detection.",
        URL: "#",
        "Project acronym": "MED-AI"
    }
];

const POPULAR_DOMAINS = [
    "Robotics",
    "Artificial Intelligence",
    "Biotechnology",
    "Quantum Computing"
];

const Research = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedDomain = searchParams.get("domain") || "";

    const [inputQuery, setInputQuery] = useState(selectedDomain);
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(
        Boolean(selectedDomain)
    );

    const [selectedPaper, setSelectedPaper] = useState(null);

    const [bookmarkedPapers, setBookmarkedPapers] = useState(() => {
        try {
            const saved = localStorage.getItem("researchBookmarks");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(
            "researchBookmarks",
            JSON.stringify(bookmarkedPapers)
        );
    }, [bookmarkedPapers]);

    const filterPapers = (query) => {
        if (!query) {
            return [];
        }

        const searchKey = query.toLowerCase();

        return ALL_PAPERS.filter((paper) => {
            const title = paper["Title"] || "";
            const domain = paper["Fields of science"] || "";
            const teaser = paper["Teaser"] || "";
            const acronym = paper["Project acronym"] || "";

            return (
                title.toLowerCase().includes(searchKey) ||
                domain.toLowerCase().includes(searchKey) ||
                teaser.toLowerCase().includes(searchKey) ||
                acronym.toLowerCase().includes(searchKey)
            );
        });
    };

    useEffect(() => {
        if (!selectedDomain) {
            setPapers([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);
        setInputQuery(selectedDomain);

        const timer = setTimeout(() => {
            const results = filterPapers(selectedDomain);
            setPapers(results);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedDomain]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        if (inputQuery.trim()) {
            setSearchParams({
                domain: inputQuery.trim()
            });
        }
    };

    const handleDomainSelect = (domain) => {
        setInputQuery(domain);

        setSearchParams({
            domain
        });
    };

    const handleClearSearch = () => {
        setInputQuery("");
        setPapers([]);
        setHasSearched(false);
        setSearchParams({});
    };

    const handleBookmark = (paper) => {
        const alreadyBookmarked = bookmarkedPapers.some(
            (item) => item.id === paper.id
        );

        if (alreadyBookmarked) {
            setBookmarkedPapers(
                bookmarkedPapers.filter(
                    (item) => item.id !== paper.id
                )
            );
        } else {
            setBookmarkedPapers([
                ...bookmarkedPapers,
                paper
            ]);
        }
    };

    const isBookmarked = (paperId) => {
        return bookmarkedPapers.some(
            (item) => item.id === paperId
        );
    };

    return (
        <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "32px 16px",
                minHeight: "70vh"
            }}
        >
            <div
                style={{
                    textAlign: "center",
                    marginBottom: "28px"
                }}
            >
                <h1
                    style={{
                        fontSize: "2.25rem",
                        fontWeight: "bold",
                        color: "#0f172a"
                    }}
                >
                    Explore Research Papers
                </h1>

                <p
                    style={{
                        color: "#64748b",
                        marginTop: "8px",
                        fontSize: "1rem"
                    }}
                >
                    Explore academic studies and research papers across
                    different scientific and technological domains.
                </p>
            </div>

            <form
                onSubmit={handleSearchSubmit}
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                    marginBottom: "20px",
                    flexWrap: "wrap"
                }}
            >
                <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="e.g. Robotics, Artificial Intelligence..."
                    style={{
                        width: "100%",
                        maxWidth: "500px",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "1rem",
                        outline: "none",
                        boxSizing: "border-box"
                    }}
                />

                <button
                    type="submit"
                    style={{
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "0.2s"
                    }}
                    onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#1d4ed8")
                    }
                    onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "#2563eb")
                    }
                >
                    Search
                </button>

                {hasSearched && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        style={{
                            backgroundColor: "#f1f5f9",
                            color: "#334155",
                            padding: "12px 20px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        Clear
                    </button>
                )}
            </form>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "40px"
                }}
            >
                <span
                    style={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        fontWeight: "500"
                    }}
                >
                    Quick Select:
                </span>

                {POPULAR_DOMAINS.map((domain) => (
                    <button
                        key={domain}
                        type="button"
                        onClick={() => handleDomainSelect(domain)}
                        style={{
                            border:
                                selectedDomain.toLowerCase() ===
                                domain.toLowerCase()
                                    ? "1px solid #2563eb"
                                    : "1px solid #e2e8f0",

                            backgroundColor:
                                selectedDomain.toLowerCase() ===
                                domain.toLowerCase()
                                    ? "#eff6ff"
                                    : "#f8fafc",

                            color:
                                selectedDomain.toLowerCase() ===
                                domain.toLowerCase()
                                    ? "#2563eb"
                                    : "#334155",

                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            cursor: "pointer"
                        }}
                    >
                        {domain}
                    </button>
                ))}
            </div>

            {!hasSearched && (
                <div
                    style={{
                        textAlign: "center",
                        padding: "48px 16px",
                        border: "2px dashed #e2e8f0",
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc"
                    }}
                >
                    <h3
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#334155",
                            marginBottom: "8px"
                        }}
                    >
                        Explore Research Papers
                    </h3>

                    <p
                        style={{
                            color: "#64748b"
                        }}
                    >
                        Enter a keyword or select a research domain to
                        explore relevant academic studies.
                    </p>
                </div>
            )}

            {loading && (
                <p
                    style={{
                        textAlign: "center",
                        color: "#64748b",
                        padding: "32px"
                    }}
                >
                    Searching for research papers in{" "}
                    <strong>{selectedDomain}</strong>...
                </p>
            )}

            {hasSearched && !loading && papers.length === 0 && (
                <div
                    style={{
                        textAlign: "center",
                        padding: "48px 16px",
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px"
                    }}
                >
                    <h3
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#0f172a"
                        }}
                    >
                        No research papers found for "{selectedDomain}"
                    </h3>

                    <p
                        style={{
                            color: "#64748b",
                            marginTop: "8px"
                        }}
                    >
                        Try another keyword or select a different research
                        domain.
                    </p>
                </div>
            )}

            {hasSearched && !loading && papers.length > 0 && (
                <div>
                    <h2
                        style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#334155",
                            marginBottom: "20px"
                        }}
                    >
                        Research Papers for{" "}
                        <span style={{ color: "#2563eb" }}>
                            "{selectedDomain}"
                        </span>{" "}
                        ({papers.length})
                    </h2>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(320px, 1fr))",
                            gap: "24px"
                        }}
                    >
                        {papers.map((paper) => {
                            const title = paper["Title"];
                            const domain = paper["Fields of science"];
                            const acronym = paper["Project acronym"];
                            const date = paper["Project start date"];
                            const teaser = paper["Teaser"];
                            const url = paper["URL"];

                            return (
                                <div
                                    key={paper.id}
                                    style={{
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "12px",
                                        padding: "20px",
                                        backgroundColor: "#ffffff",
                                        boxShadow:
                                            "0 4px 10px rgba(15,23,42,0.06)",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        transition:
                                            "transform 0.2s, box-shadow 0.2s"
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform =
                                            "translateY(-3px)";
                                        e.currentTarget.style.boxShadow =
                                            "0 8px 18px rgba(15,23,42,0.10)";
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform =
                                            "translateY(0)";
                                        e.currentTarget.style.boxShadow =
                                            "0 4px 10px rgba(15,23,42,0.06)";
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems: "center",
                                                marginBottom: "12px",
                                                gap: "10px"
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "0.75rem",
                                                    fontWeight: "600",
                                                    color: "#2563eb",
                                                    backgroundColor:
                                                        "#eff6ff",
                                                    padding: "4px 8px",
                                                    borderRadius: "4px"
                                                }}
                                            >
                                                {domain}
                                            </span>

                                            <span
                                                style={{
                                                    fontSize: "0.75rem",
                                                    fontWeight: "bold",
                                                    color: "#64748b"
                                                }}
                                            >
                                                {acronym}
                                            </span>
                                        </div>

                                        <h3
                                            style={{
                                                fontSize: "1.25rem",
                                                fontWeight: "bold",
                                                color: "#0f172a",
                                                marginBottom: "8px",
                                                lineHeight: "1.4"
                                            }}
                                        >
                                            {title}
                                        </h3>

                                        <p
                                            style={{
                                                fontSize: "0.875rem",
                                                color: "#94a3b8",
                                                marginBottom: "12px",
                                                fontWeight: "500"
                                            }}
                                        >
                                            Research Date: {date}
                                        </p>

                                        <p
                                            style={{
                                                fontSize: "0.9rem",
                                                color: "#334155",
                                                lineHeight: "1.5"
                                            }}
                                        >
                                            {teaser}
                                        </p>
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "20px",
                                            display: "flex",
                                            gap: "10px",
                                            flexWrap: "wrap"
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    url &&
                                                    url !== "#"
                                                ) {
                                                    window.open(
                                                        url,
                                                        "_blank",
                                                        "noopener,noreferrer"
                                                    );
                                                } else {
                                                    setSelectedPaper(paper);
                                                }
                                            }}
                                            style={{
                                                backgroundColor: "#2563eb",
                                                color: "#ffffff",
                                                padding: "10px 16px",
                                                borderRadius: "7px",
                                                border: "none",
                                                fontSize: "0.875rem",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                                transition: "0.2s"
                                            }}
                                            onMouseOver={(e) =>
                                                (e.currentTarget.style.backgroundColor =
                                                    "#1d4ed8")
                                            }
                                            onMouseOut={(e) =>
                                                (e.currentTarget.style.backgroundColor =
                                                    "#2563eb")
                                            }
                                        >
                                            Research Details
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleBookmark(paper)
                                            }
                                            style={{
                                                border: isBookmarked(paper.id)
                                                    ? "1px solid #2563eb"
                                                    : "1px solid #cbd5e1",
                                                backgroundColor:
                                                    isBookmarked(paper.id)
                                                        ? "#eff6ff"
                                                        : "#ffffff",
                                                color: isBookmarked(paper.id)
                                                    ? "#2563eb"
                                                    : "#334155",
                                                padding: "10px 16px",
                                                borderRadius: "7px",
                                                cursor: "pointer",
                                                fontSize: "0.875rem",
                                                fontWeight: "600",
                                                transition: "0.2s"
                                            }}
                                        >
                                            {isBookmarked(paper.id)
                                                ? "Bookmarked ✓"
                                                : "Bookmark"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {selectedPaper && (
                <div
                    onClick={() => setSelectedPaper(null)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(15,23,42,0.55)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "20px",
                        zIndex: 1000
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "14px",
                            width: "100%",
                            maxWidth: "650px",
                            maxHeight: "85vh",
                            overflowY: "auto",
                            padding: "28px",
                            boxShadow:
                                "0 20px 50px rgba(0,0,0,0.2)"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: "20px",
                                marginBottom: "20px"
                            }}
                        >
                            <h2
                                style={{
                                    color: "#0f172a",
                                    fontSize: "1.5rem",
                                    lineHeight: "1.4",
                                    margin: 0
                                }}
                            >
                                Research Details
                            </h2>

                            <button
                                type="button"
                                onClick={() => setSelectedPaper(null)}
                                style={{
                                    border: "none",
                                    backgroundColor: "#f1f5f9",
                                    color: "#334155",
                                    width: "34px",
                                    height: "34px",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    flexShrink: 0
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div
                            style={{
                                backgroundColor: "#eff6ff",
                                color: "#2563eb",
                                display: "inline-block",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                                fontWeight: "600",
                                marginBottom: "14px"
                            }}
                        >
                            {selectedPaper["Fields of science"]}
                        </div>

                        <h3
                            style={{
                                color: "#0f172a",
                                fontSize: "1.35rem",
                                lineHeight: "1.5",
                                marginBottom: "16px"
                            }}
                        >
                            {selectedPaper["Title"]}
                        </h3>

                        <div
                            style={{
                                display: "grid",
                                gap: "12px",
                                marginBottom: "20px"
                            }}
                        >
                            <p style={{ margin: 0, color: "#334155" }}>
                                <strong>Project Acronym:</strong>{" "}
                                {selectedPaper["Project acronym"]}
                            </p>

                            <p style={{ margin: 0, color: "#334155" }}>
                                <strong>Research Date:</strong>{" "}
                                {selectedPaper["Project start date"]}
                            </p>
                        </div>

                        <div
                            style={{
                                borderTop: "1px solid #e2e8f0",
                                paddingTop: "18px"
                            }}
                        >
                            <h4
                                style={{
                                    color: "#0f172a",
                                    marginBottom: "8px"
                                }}
                            >
                                Description
                            </h4>

                            <p
                                style={{
                                    color: "#475569",
                                    lineHeight: "1.7",
                                    margin: 0
                                }}
                            >
                                {selectedPaper["Teaser"]}
                            </p>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginTop: "24px",
                                flexWrap: "wrap"
                            }}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    handleBookmark(selectedPaper)
                                }
                                style={{
                                    backgroundColor: isBookmarked(
                                        selectedPaper.id
                                    )
                                        ? "#eff6ff"
                                        : "#2563eb",
                                    color: isBookmarked(
                                        selectedPaper.id
                                    )
                                        ? "#2563eb"
                                        : "#ffffff",
                                    border: isBookmarked(
                                        selectedPaper.id
                                    )
                                        ? "1px solid #2563eb"
                                        : "1px solid #2563eb",
                                    padding: "10px 18px",
                                    borderRadius: "7px",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                }}
                            >
                                {isBookmarked(selectedPaper.id)
                                    ? "Bookmarked ✓"
                                    : "Bookmark Paper"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedPaper(null)}
                                style={{
                                    backgroundColor: "#f1f5f9",
                                    color: "#334155",
                                    border: "1px solid #cbd5e1",
                                    padding: "10px 18px",
                                    borderRadius: "7px",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Research;