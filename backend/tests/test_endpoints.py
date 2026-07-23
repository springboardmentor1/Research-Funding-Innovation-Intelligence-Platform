import pytest


def test_root_endpoint(client):
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert "endpoints" in data


def test_funding_endpoint_no_query(client):
    """Test funding endpoint without query."""
    response = client.get("/funding/")
    assert response.status_code == 200


def test_patents_endpoint_no_query(client):
    """Test patents endpoint without query."""
    response = client.get("/patents/")
    assert response.status_code == 200


def test_research_papers_endpoint(client):
    """Test research papers endpoint."""
    response = client.get("/research/saved")
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "papers" in data
    assert isinstance(data["papers"], list)
