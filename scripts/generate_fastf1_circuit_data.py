import os
import json
import numpy as np
import fastf1

# Enable FastF1 disk cache
CACHE_DIR = os.path.join(os.path.dirname(__file__), '..', 'cache', 'fastf1')
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(CACHE_DIR)

# Output directory for circuit JSON files
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'circuits')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load rich corner details metadata from paddock_f1_2026_circuit_corners.json
HERITAGE_JSON_PATH = os.path.join(os.path.dirname(__file__), '..', 'paddock_f1_2026_circuit_corners.json')
HERITAGE_MAP = {}
ALL_78_CIRCUITS = []

if os.path.exists(HERITAGE_JSON_PATH):
    try:
        with open(HERITAGE_JSON_PATH, 'r', encoding='utf-8') as hf:
            h_data = json.load(hf)
            for circ in h_data.get('circuits', []):
                c_id = circ.get('id')
                ALL_78_CIRCUITS.append(c_id)
                HERITAGE_MAP[c_id] = {c.get('turnNumber'): c for c in circ.get('corners', []) if c.get('turnNumber') is not None}
        print(f"Loaded rich heritage metadata for {len(HERITAGE_MAP)} circuits.")
    except Exception as e:
        print(f"Could not load heritage JSON: {e}")

# Mapping of circuit ID to FastF1 query names and preferred search years
CIRCUIT_QUERY_MAP = {
    "monaco": {"query": "Monaco", "years": [2024, 2023, 2022, 2021]},
    "monza": {"query": "Monza", "years": [2024, 2023, 2022, 2021]},
    "silverstone": {"query": "Silverstone", "years": [2024, 2023, 2022, 2021]},
    "spa": {"query": "Spa-Francorchamps", "years": [2024, 2023, 2022, 2021]},
    "suzuka": {"query": "Suzuka", "years": [2024, 2023, 2022, 2019]},
    "bahrain": {"query": "Bahrain", "years": [2024, 2023, 2022, 2021]},
    "jeddah": {"query": "Jeddah", "years": [2024, 2023, 2022, 2021]},
    "albert_park": {"query": "Melbourne", "years": [2024, 2023, 2022, 2019]},
    "shanghai": {"query": "Shanghai", "years": [2024, 2019, 2018]},
    "miami": {"query": "Miami", "years": [2024, 2023, 2022]},
    "imola": {"query": "Imola", "years": [2024, 2022, 2021, 2020]},
    "catalunya": {"query": "Barcelona", "years": [2024, 2023, 2022, 2021]},
    "villeneuve": {"query": "Montréal", "years": [2024, 2023, 2022, 2019]},
    "red_bull_ring": {"query": "Spielberg", "years": [2024, 2023, 2022, 2021]},
    "hungaroring": {"query": "Budapest", "years": [2024, 2023, 2022, 2021]},
    "zandvoort": {"query": "Zandvoort", "years": [2024, 2023, 2022, 2021]},
    "baku": {"query": "Baku", "years": [2024, 2023, 2022, 2021]},
    "marina_bay": {"query": "Singapore", "years": [2024, 2023, 2022, 2019]},
    "americas": {"query": "Austin", "years": [2024, 2023, 2022, 2021]},
    "rodriguez": {"query": "Mexico City", "years": [2024, 2023, 2022, 2021]},
    "interlagos": {"query": "São Paulo", "years": [2024, 2023, 2022, 2021]},
    "vegas": {"query": "Las Vegas", "years": [2024, 2023]},
    "las_vegas": {"query": "Las Vegas", "years": [2024, 2023]},
    "losail": {"query": "Lusail", "years": [2023, 2021]},
    "yas_marina": {"query": "Abu Dhabi", "years": [2024, 2023, 2022, 2021]},
    "nurburgring": {"query": "Nürburgring", "years": [2020, 2013, 2011, 2009]},
    "hockenheimring": {"query": "Hockenheim", "years": [2019, 2018, 2016, 2014]},
    "sepang": {"query": "Sepang", "years": [2017, 2016, 2015, 2014]},
    "istanbul": {"query": "Istanbul", "years": [2021, 2020, 2011]},
    "ricard": {"query": "Le Castellet", "years": [2022, 2021, 2019, 2018]},
    "portimao": {"query": "Portimão", "years": [2021, 2020]},
    "mugello": {"query": "Mugello", "years": [2020]},
    "sochi": {"query": "Sochi", "years": [2021, 2020, 2019, 2018]},
    "magny_cours": {"query": "Magny Cours", "years": [2008, 2007]},
    "valencia": {"query": "Valencia", "years": [2012, 2011, 2010]},
    "buddh": {"query": "Buddh", "years": [2013, 2012, 2011]},
    "yeongam": {"query": "Yeongam", "years": [2013, 2012, 2011, 2010]},
    "indianapolis": {"query": "Indianapolis", "years": [2007, 2006, 2005]},
    "fuji": {"query": "Fuji", "years": [2008, 2007]},
    "kyalami": {"query": "Kyalami", "years": [1993, 1992]},
    "brands_hatch": {"query": "Brands Hatch", "years": [1986, 1985]},
    "adelaide": {"query": "Adelaide", "years": [1995, 1994]},
    "estoril": {"query": "Estoril", "years": [1996, 1995]}
}

SESSION_FALLBACK_ORDER = ['R', 'Q', 'FP3', 'FP2', 'FP1']

def extract_circuit_data_for_id(circuit_id):
    query_info = CIRCUIT_QUERY_MAP.get(circuit_id)
    if not query_info:
        query_info = {"query": circuit_id.replace('_', ' ').title(), "years": [2024, 2023, 2022, 2021, 2020]}

    query_name = query_info["query"]
    candidate_years = query_info["years"]

    print(f"\n==========================================")
    print(f"Extracting telemetry & corners for: {circuit_id}")
    print(f"==========================================")

    session = None
    successful_session_name = None
    successful_year = None

    for yr in candidate_years:
        for session_type in SESSION_FALLBACK_ORDER:
            try:
                print(f"Attempting year {yr}, session '{session_type}' for {query_name}...")
                candidate = fastf1.get_session(yr, query_name, session_type)
                candidate.load(telemetry=True, weather=False, messages=False)

                if candidate.laps is None or len(candidate.laps) == 0:
                    continue

                fastest = candidate.laps.pick_fastest()
                if fastest is None:
                    continue

                pos_data = fastest.get_pos_data()
                if pos_data is None or pos_data.empty or 'X' not in pos_data or 'Y' not in pos_data:
                    continue

                # Found valid telemetry!
                session = candidate
                successful_session_name = session_type
                successful_year = yr
                print(f"Successfully loaded telemetry from {yr} '{session_type}'!")
                break
            except Exception:
                pass
        if session is not None:
            break

    if session is None:
        print(f"INFO: DATA UNAVAILABLE for circuit {circuit_id} across candidate years.")
        unavailable_res = {
            "circuit": {
                "id": circuit_id,
                "name": query_name,
                "year": candidate_years[0]
            },
            "status": "DATA UNAVAILABLE",
            "reason": f"No valid FastF1 position telemetry cached for circuit '{circuit_id}' across years {candidate_years}."
        }
        # Save unavailable status so API returns 404 cleanly
        year_dir = os.path.join(OUTPUT_DIR, str(candidate_years[0]))
        os.makedirs(year_dir, exist_ok=True)
        with open(os.path.join(year_dir, f"{circuit_id}.json"), 'w', encoding='utf-8') as f:
            json.dump(unavailable_res, f, indent=2)
        return unavailable_res

    # Extract fastest lap telemetry
    fastest_lap = session.laps.pick_fastest()
    driver = str(fastest_lap['Driver'])
    lap_num = int(fastest_lap['LapNumber']) if not np.isnan(fastest_lap['LapNumber']) else 1
    pos = fastest_lap.get_pos_data()[["X", "Y"]].dropna()

    track_points = []
    track_coords_np = pos[["X", "Y"]].to_numpy()

    for row in track_coords_np:
        track_points.append({
            "x": round(float(row[0]), 2),
            "y": round(float(row[1]), 2)
        })

    # Extract circuit info & rotation
    circuit_info = session.get_circuit_info()
    rotation = float(getattr(circuit_info, 'rotation', 0.0))

    # Heritage map for this circuit
    circuit_heritage = HERITAGE_MAP.get(circuit_id, {})

    # Extract corners
    corners_list = []
    if hasattr(circuit_info, 'corners') and circuit_info.corners is not None and not circuit_info.corners.empty:
        raw_corners = circuit_info.corners
        for idx, row in raw_corners.iterrows():
            c_x = float(row['X'])
            c_y = float(row['Y'])

            # Compute distance to nearest telemetry track point
            dists = np.sqrt((track_coords_np[:, 0] - c_x)**2 + (track_coords_np[:, 1] - c_y)**2)
            min_dist = float(np.min(dists)) if len(dists) > 0 else 0.0

            raw_num = int(row['Number']) if 'Number' in row and not np.isnan(row['Number']) else (idx + 1)
            raw_letter = str(row['Letter']) if 'Letter' in row and row['Letter'] and not str(row['Letter']).lower() == 'nan' else ""

            # Lookup rich corner details from heritage dataset
            h_item = circuit_heritage.get(raw_num, {})

            corner_obj = {
                "number": raw_num,
                "letter": raw_letter,
                "name": h_item.get("name") or f"Turn {raw_num}{raw_letter}",
                "turn": h_item.get("turn") or f"Turn {raw_num} (T{raw_num}{raw_letter})",
                "x": round(c_x, 2),
                "y": round(c_y, 2),
                "angle": round(float(row['Angle']), 2) if 'Angle' in row and not np.isnan(row['Angle']) else 0.0,
                "distance": round(float(row['Distance']), 2) if 'Distance' in row and not np.isnan(row['Distance']) else 0.0,
                "nearestTrackDistance": round(min_dist, 2),
                "alignmentValid": bool(min_dist <= 250.0),
                "type": h_item.get("type", "Corner"),
                "direction": h_item.get("direction", ""),
                "gear": h_item.get("gear"),
                "speed_kph": h_item.get("speed_kph"),
                "characteristics": h_item.get("characteristics", ""),
                "history": h_item.get("history", ""),
                "images": h_item.get("images", []),
                "technical": h_item.get("technical"),
                "racing": h_item.get("racing")
            }

            corners_list.append(corner_obj)

    result_json = {
        "circuit": {
            "id": circuit_id,
            "name": str(session.event.get('EventName', query_name)),
            "country": str(session.event.get('Country', '')),
            "location": str(session.event.get('Location', '')),
            "year": successful_year
        },
        "sourceSession": successful_session_name,
        "telemetryDriver": driver,
        "telemetryLap": lap_num,
        "rotation": rotation,
        "layout": {
            "source": "FastF1 telemetry",
            "coordinateSystem": "fastf1_xy",
            "pointCount": len(track_points),
            "points": track_points
        },
        "corners": corners_list
    }

    # Save to disk
    year_dir = os.path.join(OUTPUT_DIR, str(successful_year))
    os.makedirs(year_dir, exist_ok=True)
    out_file = os.path.join(year_dir, f"{circuit_id}.json")

    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(result_json, f, indent=2)

    print(f"Saved {len(track_points)} track points and {len(corners_list)} enriched corners to {out_file}")
    return result_json

def main():
    print(f"Processing all {len(ALL_78_CIRCUITS)} circuits in database...")
    index_list = []
    for c_id in ALL_78_CIRCUITS:
        data = extract_circuit_data_for_id(c_id)
        if data.get("status") != "DATA UNAVAILABLE":
            index_list.append({
                "id": c_id,
                "name": data["circuit"]["name"],
                "country": data["circuit"]["country"],
                "year": data["circuit"]["year"],
                "pointCount": data["layout"]["pointCount"],
                "cornerCount": len(data["corners"]),
                "sourceSession": data["sourceSession"]
            })

    index_path = os.path.join(OUTPUT_DIR, "index.json")
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump({"circuits": index_list}, f, indent=2)
    print(f"\n==========================================")
    print(f"Pipeline complete! Wrote {len(index_list)} active circuits to index file at {index_path}")
    print(f"==========================================")

if __name__ == '__main__':
    main()
