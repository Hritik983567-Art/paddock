import os
import json
import time
import re
from typing import Dict, Any, List, Optional
import requests
from .config import CACHE_DIR, JOLPICA_BASE_URL, JOLPICA_RATE_LIMIT_DELAY, MAX_RETRIES, REQUEST_TIMEOUT

JOLPICA_CACHE_DIR = os.path.join(CACHE_DIR, 'jolpica')
os.makedirs(JOLPICA_CACHE_DIR, exist_ok=True)

def parse_lap_time_str(time_str: Optional[str]) -> Optional[float]:
    """Parses an F1 lap time string (e.g. '1:29.179' or '89.179') to seconds as float."""
    if not time_str or not isinstance(time_str, str):
        return None
    time_str = time_str.strip()
    match = re.match(r'^(\d+):(\d+(?:\.\d+)?)$', time_str)
    if match:
        minutes = int(match.group(1))
        seconds = float(match.group(2))
        return round(minutes * 60 + seconds, 3)
    try:
        val = float(time_str)
        return round(val, 3) if val > 0 else None
    except ValueError:
        return None

class JolpicaExtractor:
    def __init__(self, base_url: str = JOLPICA_BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'PaddockTelemetry/1.0 (Race Predictor Historical Data Pipeline; github.com/Hritik983567-Art/paddock)'
        })

    def _get_json_cached(self, endpoint: str, cache_filename: str) -> Optional[Dict[str, Any]]:
        """Fetches JSON with disk caching and rate-limiting retry handling."""
        cache_path = os.path.join(JOLPICA_CACHE_DIR, cache_filename)
        if os.path.exists(cache_path):
            try:
                with open(cache_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                pass # Re-fetch if cache corrupted

        url = f"{self.base_url}/{endpoint}"
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                time.sleep(JOLPICA_RATE_LIMIT_DELAY)
                response = self.session.get(url, timeout=REQUEST_TIMEOUT)
                if response.status_code == 429:
                    sleep_time = attempt * 2.0
                    time.sleep(sleep_time)
                    continue
                if response.status_code == 404:
                    return None
                response.raise_for_status()
                data = response.json()
                with open(cache_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False)
                return data
            except (requests.RequestException, ValueError) as err:
                if attempt == MAX_RETRIES:
                    print(f"[JolpicaExtractor] Warning: Failed to fetch {url} after {MAX_RETRIES} attempts: {err}")
                    return None
                time.sleep(attempt * 1.0)
        return None

    def get_season_calendar(self, season: int) -> List[Dict[str, Any]]:
        """Returns ordered calendar of Grand Prix rounds for the season."""
        filename = f"season_{season}_calendar.json"
        data = self._get_json_cached(f"{season}.json?limit=100", filename)
        if not data:
            return []
        try:
            return data['MRData']['RaceTable']['Races']
        except (KeyError, TypeError):
            return []

    def get_qualifying_results(self, season: int, round_num: int) -> List[Dict[str, Any]]:
        """Returns Saturday qualifying classification and lap times."""
        filename = f"{season}_round_{round_num}_qualifying.json"
        data = self._get_json_cached(f"{season}/{round_num}/qualifying.json?limit=100", filename)
        if not data:
            return []
        try:
            races = data['MRData']['RaceTable'].get('Races', [])
            if races and 'QualifyingResults' in races[0]:
                return races[0]['QualifyingResults']
            return []
        except (KeyError, TypeError):
            return []

    def get_race_results(self, season: int, round_num: int) -> List[Dict[str, Any]]:
        """Returns final Sunday race classification, starting grid, status and points."""
        filename = f"{season}_round_{round_num}_results.json"
        data = self._get_json_cached(f"{season}/{round_num}/results.json?limit=100", filename)
        if not data:
            return []
        try:
            races = data['MRData']['RaceTable'].get('Races', [])
            if races and 'Results' in races[0]:
                return races[0]['Results']
            return []
        except (KeyError, TypeError):
            return []
