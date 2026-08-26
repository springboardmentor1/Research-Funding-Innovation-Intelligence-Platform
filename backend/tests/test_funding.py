import pytest
from app.utils.validators import is_valid_url, clean_markdown_url

def test_valid_url():
    assert is_valid_url("https://example.gov/opportunity/123") == True
    assert is_valid_url("http://example.com") == True
    assert is_valid_url("https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=505085") == True

def test_invalid_url():
    assert is_valid_url("not_a_url") == False
    assert is_valid_url(None) == False
    assert is_valid_url("") == False

def test_markdown_url_invalid():
    assert is_valid_url("[https://example.gov/opportunity/123](https://example.gov/opportunity/123)") == False

def test_clean_markdown_url():
    cleaned = clean_markdown_url("[https://example.gov/opportunity/123](https://example.gov/opportunity/123)")
    assert cleaned == "https://example.gov/opportunity/123"
    assert is_valid_url(cleaned) == True
    
    assert clean_markdown_url("https://example.gov") == "https://example.gov"
    assert clean_markdown_url(None) == None
