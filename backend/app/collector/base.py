import time
import logging
import httpx
from typing import Optional, Dict, Any
from ..core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


class BaseCollector:
    """
    Base class for all API collectors.
    Provides robust HTTP requests, automatic retries, rate-limiting, and error handling.
    """

    def __init__(
        self,
        name: str,
        base_url: str,
        rate_limit_delay: float = 0.5,  # Delay in seconds between requests
        max_retries: int = 3,
        backoff_factor: float = 2.0,
    ):
        self.name = name
        self.base_url = base_url.rstrip("/")
        self.rate_limit_delay = rate_limit_delay
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor
        self.logger = logging.getLogger(f"collector.{name}")
        self.client = httpx.Client(timeout=30.0, follow_redirects=True)  # Follow redirects
        self.last_request_time = 0.0

    def _apply_rate_limit(self):
        """Enforces rate-limiting delay between consecutive API calls."""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.rate_limit_delay:
            sleep_time = self.rate_limit_delay - elapsed
            self.logger.debug(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        self.last_request_time = time.time()

    def _get_headers(self) -> Dict[str, str]:
        """Provides default headers, including User-Agent with contact email for the OpenAlex polite pool."""
        headers = {
            "User-Agent": f"ResearchFundingIntelligencePlatform/1.0 (mailto:{settings.OPENALEX_MAILTO})"
        }
        return headers

    def request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        require_auth: bool = False
    ) -> httpx.Response:
        """
        Performs an HTTP request with rate-limiting, retries, and exponential backoff.
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        # Merge custom headers with default headers
        req_headers = self._get_headers()
        if headers:
            req_headers.update(headers)

        retries = 0
        current_delay = 1.0

        while retries <= self.max_retries:
            self._apply_rate_limit()
            try:
                self.logger.debug(f"Requesting: {method} {url} with params {params}")
                if method.upper() == "GET":
                    response = self.client.get(url, params=params, headers=req_headers)
                elif method.upper() == "POST":
                    response = self.client.post(url, json=json_data, params=params, headers=req_headers)
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")

                # Handle transient error codes that merit retry
                if response.status_code in [429, 500, 502, 503, 504]:
                    self.logger.warning(
                        f"Transient error {response.status_code} on attempt {retries + 1}. Retrying..."
                    )
                    retries += 1
                    if retries > self.max_retries:
                        response.raise_for_status()
                    time.sleep(current_delay)
                    current_delay *= self.backoff_factor
                    continue

                response.raise_for_status()
                return response

            except (httpx.HTTPError, httpx.RequestError) as exc:
                self.logger.warning(
                    f"HTTP/Request error {exc} on attempt {retries + 1}. Retrying..."
                )
                retries += 1
                if retries > self.max_retries:
                    self.logger.error(f"Max retries exceeded for request {url}")
                    raise exc
                time.sleep(current_delay)
                current_delay *= self.backoff_factor

        raise httpx.HTTPStatusError("Max retries exceeded", request=None, response=None)

    def close(self):
        """Closes the underlying HTTP client session."""
        self.client.close()
