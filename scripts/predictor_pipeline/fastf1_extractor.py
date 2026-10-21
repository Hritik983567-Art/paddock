import os
import json
import logging
from typing import Dict, Any, Optional
from .config import FASTF1_CACHE_DIR, CACHE_DIR

# Suppress verbose FastF1 logger spam
logging.getLogger('fastf1').setLevel(logging.ERROR)

WEATHER_CACHE_DIR = os.path.join(CACHE_DIR, 'fastf1_weather')
os.makedirs(WEATHER_CACHE_DIR, exist_ok=True)

class FastF1Extractor:
    def __init__(self, cache_dir: str = FASTF1_CACHE_DIR):
        self.cache_dir = cache_dir
        self._enabled = False
        self._init_fastf1()

    def _init_fastf1(self):
        try:
            import fastf1
            os.makedirs(self.cache_dir, exist_ok=True)
            fastf1.Cache.enable_cache(self.cache_dir)
            self._enabled = True
        except Exception as e:
            print(f"[FastF1Extractor] Notice: FastF1 cache setup bypassed ({e}). Weather features will fall back gracefully.")
            self._enabled = False

    def get_qualifying_weather(self, season: int, round_num: int) -> Dict[str, Optional[float]]:
        """
        Extracts qualifying session weather from FastF1 with local JSON caching and defensive fallback.
        Returns dictionary with: air_temp_c, track_temp_c, humidity_pct, rainfall, fastf1_available.
        Never fabricates synthetic data.
        """
        cache_file = os.path.join(WEATHER_CACHE_DIR, f"{season}_{round_num}_weather.json")
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception:
                pass

        default_result = {
            "quali_air_temp_c": None,
            "quali_track_temp_c": None,
            "quali_humidity_pct": None,
            "quali_rainfall": None,
            "fastf1_available": False
        }

        if not self._enabled:
            return default_result

        try:
            import fastf1
            session = fastf1.get_session(season, round_num, 'Qualifying')
            session.load(laps=False, telemetry=False, weather=True, messages=False)

            if session.weather_data is not None and not session.weather_data.empty:
                w_df = session.weather_data
                air_temp = float(w_df['AirTemp'].mean()) if 'AirTemp' in w_df and not w_df['AirTemp'].isna().all() else None
                track_temp = float(w_df['TrackTemp'].mean()) if 'TrackTemp' in w_df and not w_df['TrackTemp'].isna().all() else None
                humidity = float(w_df['Humidity'].mean()) if 'Humidity' in w_df and not w_df['Humidity'].isna().all() else None
                rainfall_any = float(1.0 if bool(w_df['Rainfall'].any()) else 0.0) if 'Rainfall' in w_df else None

                result = {
                    "quali_air_temp_c": round(air_temp, 1) if air_temp is not None else None,
                    "quali_track_temp_c": round(track_temp, 1) if track_temp is not None else None,
                    "quali_humidity_pct": round(humidity, 1) if humidity is not None else None,
                    "quali_rainfall": rainfall_any,
                    "fastf1_available": True
                }
                with open(cache_file, 'w', encoding='utf-8') as f:
                    json.dump(result, f)
                return result
        except Exception:
            # Defensive handling: network timeout, session unavailable, or old season
            pass

        # Save default negative cache so we don't re-timeout repeatedly
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(default_result, f)

        return default_result
