import os

# Project Roots
PIPELINE_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.dirname(PIPELINE_DIR)
PROJECT_ROOT = os.path.dirname(SCRIPTS_DIR)

# Data & Cache Directories
CACHE_DIR = os.path.join(PROJECT_ROOT, 'cache', 'predictor')
FASTF1_CACHE_DIR = os.path.join(PROJECT_ROOT, 'cache', 'fastf1')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'data', 'predictor')

# Ensure directories exist
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(FASTF1_CACHE_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Seasons to include in historical training dataset
# 2018 is the introduction of Halo and reliable modern session telemetry in FastF1
# 2024 is the latest completed championship
DEFAULT_START_SEASON = 2018
DEFAULT_END_SEASON = 2024

# Jolpica / Ergast F1 API Configuration
JOLPICA_BASE_URL = 'https://api.jolpi.ca/ergast/f1'
JOLPICA_RATE_LIMIT_DELAY = 0.35  # Seconds between API calls to avoid HTTP 429
MAX_RETRIES = 3
REQUEST_TIMEOUT = 15

# Regulation Eras
REGULATION_ERAS = {
    (2014, 2021): 'v6_turbo_hybrid_gen1',
    (2022, 2025): 'ground_effect_gen2',
    (2026, 2030): 'active_aero_sustainable_fuel_gen3'
}

def get_regulation_era(season: int) -> str:
    for (start, end), era_name in REGULATION_ERAS.items():
        if start <= season <= end:
            return era_name
    return 'unknown_era'
