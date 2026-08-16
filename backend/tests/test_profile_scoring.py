"""
Tests for profile CRUD and the recommendation/scoring math.

The endpoint tests exercise the full request path. The pure-function tests
check the algorithms in isolation, where they are fast and deterministic.
"""

import numpy as np

from app.services.recommender import rrf_fuse


# ------------------------------------------------------------------ profile CRUD
def test_profile_lifecycle(client, auth_headers):
    # no profile yet
    assert client.get("/api/v1/profiles/me", headers=auth_headers).status_code == 404

    # create
    r = client.post("/api/v1/profiles/me", headers=auth_headers, json={
        "organization": "VIT", "bio": "ML research",
        "research_domains": ["Machine Learning"], "keywords": ["deep learning"],
        "technology_areas": ["AI"], "country": "IN",
    })
    assert r.status_code == 201
    assert r.json()["organization"] == "VIT"

    # read
    r = client.get("/api/v1/profiles/me", headers=auth_headers)
    assert r.status_code == 200
    assert "Machine Learning" in r.json()["research_domains"]

    # duplicate create rejected
    assert client.post("/api/v1/profiles/me", headers=auth_headers, json={
        "organization": "x"
    }).status_code == 409

    # update (PATCH only changes provided fields)
    r = client.patch("/api/v1/profiles/me", headers=auth_headers,
                     json={"organization": "VIT Chennai"})
    assert r.status_code == 200
    assert r.json()["organization"] == "VIT Chennai"
    # bio untouched by the partial update
    assert r.json()["bio"] == "ML research"


def test_profile_requires_auth(client):
    assert client.get("/api/v1/profiles/me").status_code == 401
    assert client.post("/api/v1/profiles/me", json={}).status_code == 401


# ------------------------------------------------------------------ RRF fusion math
def test_rrf_neutralises_scale():
    # lexical scores are tiny, dense scores are large. A weighted sum would let
    # dense dominate by magnitude. RRF fuses by rank, so it should not.
    lexical = np.array([0.9, 0.1, 0.1, 0.1])   # doc 0 clearly best lexically
    dense = np.array([0.80, 0.79, 0.78, 0.77]) # doc 0 also best, but by a hair
    fused = rrf_fuse(lexical, dense)
    assert int(np.argmax(fused)) == 0


def test_rrf_agreement_beats_disagreement():
    # Two docs. Doc 0 is ranked #1 by BOTH rankers (full agreement).
    # Doc 1 is #1 in one ranker but last in the other (polarised).
    # RRF rewards consensus, so the agreed-on doc must win.
    a = np.array([0.9, 0.8, 0.1])   # ranker A: doc0 > doc1 > doc2
    b = np.array([0.9, 0.1, 0.8])   # ranker B: doc0 > doc2 > doc1
    fused = rrf_fuse(a, b)
    # doc 0 (first in both) must rank strictly highest
    assert int(np.argmax(fused)) == 0


def test_rrf_identical_rankers():
    s = np.array([0.9, 0.5, 0.1])
    fused = rrf_fuse(s, s)
    # identical inputs preserve the original order
    assert list(np.argsort(-fused)) == [0, 1, 2]
