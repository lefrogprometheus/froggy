import requests
import base64

class DataForSEOClient:
    def __init__(self, login, password):
        self.login = login
        self.password = password
        self.base_url = "https://api.dataforseo.com/v3"

    def _get_auth_header(self):
        auth_str = f"{self.login}:{self.password}"
        encoded_auth = base64.b64encode(auth_str.encode()).decode()
        return {"Authorization": f"Basic {encoded_auth}"}

    # --- Keywords Data API ---
    def get_search_volume(self, keywords, location_code=2840, language_code="en"):
        """US is 2840. Returns search volume metrics."""
        payload = [{
            "keywords": keywords if isinstance(keywords, list) else [keywords],
            "location_code": location_code,
            "language_code": language_code
        }]
        response = requests.post(
            f"{self.base_url}/keywords_data/google_ads/search_volume/live",
            headers=self._get_auth_header(),
            json=payload
        )
        return response.json()

    def get_keyword_suggestions(self, keyword, location_code=2840, language_code="en"):
        """Returns keyword ideas based on a seed keyword."""
        payload = [{
            "keywords": [keyword],
            "location_code": location_code,
            "language_code": language_code,
            "include_seed": True,
            "limit": 10
        }]
        response = requests.post(
            f"{self.base_url}/keywords_data/google_ads/keywords_for_keywords/live",
            headers=self._get_auth_header(),
            json=payload
        )
        return response.json()

    # --- On-Page API (Technical Audit) ---
    def post_on_page_task(self, target_url, max_crawl_pages=10):
        """Starts a technical audit crawl."""
        payload = [{
            "target": target_url,
            "max_crawl_pages": max_crawl_pages,
            "load_resources": True,
            "enable_javascript": True
        }]
        response = requests.post(
            f"{self.base_url}/on_page/task_post",
            headers=self._get_auth_header(),
            json=payload
        )
        return response.json()

    def get_on_page_summary(self, id):
        """Fetches the result of an On-Page audit task."""
        response = requests.get(
            f"{self.base_url}/on_page/summary/{id}",
            headers=self._get_auth_header()
        )
        return response.json()

    # --- DataForSEO Labs (Competitor Intelligence) ---
    def get_serp_competitors(self, keyword, location_code=2840, language_code="en"):
        payload = [{
            "keyword": keyword,
            "location_code": location_code,
            "language_code": language_code
        }]
        response = requests.post(
            f"{self.base_url}/dataforseo_labs/google/serp_competitors/live",
            headers=self._get_auth_header(),
            json=payload
        )
        return response.json()
