from urllib.parse import urlparse

def is_valid_url(url: str | None) -> bool:
    """
    Validate if a string is a valid HTTP/HTTPS URL.
    Returns False if it is a markdown URL (contains '[' or ']')
    or if it has an invalid scheme/netloc.
    """
    if not url:
        return False
        
    # Reject Markdown URLs
    if "[" in url or "]" in url or "(" in url or ")" in url:
        # A bit strict, but we want to avoid [url](url) formats.
        # Markdown URLs are usually something like `[text](link)`
        if url.startswith("[") and "](" in url and url.endswith(")"):
            return False
            
    try:
        parsed = urlparse(url)
        return bool(parsed.scheme in ("http", "https") and parsed.netloc)
    except Exception:
        return False

def clean_markdown_url(url: str | None) -> str | None:
    """
    Extract the plain URL from a Markdown URL like [url](url).
    """
    if not url:
        return None
    url = str(url).strip()
    if url.startswith("[") and "](" in url and url.endswith(")"):
        # extract what is inside ()
        start_idx = url.find("](") + 2
        end_idx = url.rfind(")")
        if start_idx < end_idx:
            return url[start_idx:end_idx].strip()
    return url
