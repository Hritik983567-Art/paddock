/**
 * Paddock Race Predictor — Historical Dataset & Feature Schema
 *
 * This file provides TypeScript definitions, column categorizations,
 * and leakage rules mirroring scripts/predictor_pipeline/schemas.py.
 * Strictly guarantees post-qualifying, pre-race prediction contract.
 */

export interface PredictorFeatureRecord {
  // 1. Identifiers & Metadata
  race_id: string;
  season: number;
  round: number;
  circuit_id: string;
  circuit_name: string;
  country: string;
  race_date: string;
  race_timestamp_utc: string;
  driver_id: string;
  driver_code: string;
  driver_number: string;
  constructor_id: string;
  constructor_name: string;

  // 2. Qualifying & Starting Grid Features
  grid_position: number;
  quali_position: number;
  grid_penalty_delta: number;
  quali_time_sec: number | null;
  pole_time_sec: number | null;
  quali_time_delta_to_pole: number | null;
  quali_time_ratio_to_pole: number | null;
  reached_q3: number;
  front_row: number;

  // 3. Driver Historical Form (Strictly Prior Races t < Current Race)
  driver_prev_race_position: number | null;
  driver_prev_race_points: number;
  driver_rolling_3_avg_finish: number | null;
  driver_rolling_5_avg_finish: number | null;
  driver_rolling_5_win_rate: number;
  driver_rolling_5_podium_rate: number;
  driver_rolling_5_pts_per_race: number;
  driver_rolling_5_dnf_rate: number;
  driver_rolling_10_avg_finish: number | null;
  driver_rolling_10_win_rate: number;
  driver_season_points_before_gp: number;
  driver_season_standing_before_gp: number;

  // 4. Constructor Historical Form (Strictly Prior Races t < Current Race)
  constructor_prev_race_points: number;
  constructor_rolling_3_avg_points: number;
  constructor_rolling_5_win_rate: number;
  constructor_rolling_5_podium_rate: number;
  constructor_rolling_3_avg_grid: number | null;
  constructor_season_points_before_gp: number;
  constructor_season_standing_before_gp: number;
  constructor_best_quali_delta_to_pole: number | null;

  // 5. Teammate Head-to-Head & Intra-Team Dynamics
  outqualified_teammate: number;
  teammate_rolling_5_quali_h2h: number;

  // 6. Circuit Demands & Venue Heritage
  driver_circuit_starts: number;
  driver_circuit_wins: number;
  driver_circuit_win_rate: number;
  driver_circuit_podiums: number;
  driver_circuit_avg_finish: number | null;
  constructor_circuit_wins: number;
  circuit_historical_pole_win_rate: number;

  // 7. Session, Environmental & Regulatory Context
  is_sprint_weekend: number;
  regulation_era: string;
  quali_air_temp_c: number | null;
  quali_track_temp_c: number | null;
  quali_humidity_pct: number | null;
  quali_rainfall: number | null;

  // 8. Provenance & Execution Auditing
  data_provenance: string;
  feature_timestamp_utc: string;

  // 9. Supervised Binary Target
  won_race: number;
}

export const PREDICTOR_IDENTIFIER_COLUMNS: (keyof PredictorFeatureRecord)[] = [
  'race_id',
  'season',
  'round',
  'circuit_id',
  'circuit_name',
  'country',
  'race_date',
  'race_timestamp_utc',
  'driver_id',
  'driver_code',
  'driver_number',
  'constructor_id',
  'constructor_name'
];

export const PREDICTOR_QUALI_GRID_COLUMNS: (keyof PredictorFeatureRecord)[] = [
  'grid_position',
  'quali_position',
  'grid_penalty_delta',
  'quali_time_sec',
  'pole_time_sec',
  'quali_time_delta_to_pole',
  'quali_time_ratio_to_pole',
  'reached_q3',
  'front_row'
];

export const PREDICTOR_DRIVER_FORM_COLUMNS: (keyof PredictorFeatureRecord)[] = [
  'driver_prev_race_position',
  'driver_prev_race_points',
  'driver_rolling_3_avg_finish',
  'driver_rolling_5_avg_finish',
  'driver_rolling_5_win_rate',
  'driver_rolling_5_podium_rate',
  'driver_rolling_5_pts_per_race',
  'driver_rolling_5_dnf_rate',
  'driver_rolling_10_avg_finish',
  'driver_rolling_10_win_rate',
  'driver_season_points_before_gp',
  'driver_season_standing_before_gp'
];

export const PREDICTOR_CONSTRUCTOR_FORM_COLUMNS: (keyof PredictorFeatureRecord)[] = [
  'constructor_prev_race_points',
  'constructor_rolling_3_avg_points',
  'constructor_rolling_5_win_rate',
  'constructor_rolling_5_podium_rate',
  'constructor_rolling_3_avg_grid',
  'constructor_season_points_before_gp',
  'constructor_season_standing_before_gp',
  'constructor_best_quali_delta_to_pole'
];

export const PREDICTOR_TEAMMATE_COLUMNS: (keyof PredictorFeatureRecord)[] = [
  'outqualified_teammate',
  'teammate_rolling_5_quali_h2h'
];

export const PREDICTOR_CIRCUIT_COLUMNS: (keyof PredictorFeatureRecord)[] = [
  'driver_circuit_starts',
  'driver_circuit_wins',
  'driver_circuit_win_rate',
  'driver_circuit_podiums',
  'driver_circuit_avg_finish',
  'constructor_circuit_wins',
  'circuit_historical_pole_win_rate'
];

export const PREDICTOR_ENVIRONMENT_COLUMNS: (keyof PredictorFeatureRecord)[] = [
  'is_sprint_weekend',
  'regulation_era',
  'quali_air_temp_c',
  'quali_track_temp_c',
  'quali_humidity_pct',
  'quali_rainfall'
];

export const PREDICTOR_AUDIT_COLUMNS: (keyof PredictorFeatureRecord)[] = [
  'data_provenance',
  'feature_timestamp_utc'
];

export const PREDICTOR_TARGET_COLUMN: keyof PredictorFeatureRecord = 'won_race';

export const ALL_PREDICTOR_FEATURE_COLUMNS: (keyof PredictorFeatureRecord)[] = [
  ...PREDICTOR_IDENTIFIER_COLUMNS,
  ...PREDICTOR_QUALI_GRID_COLUMNS,
  ...PREDICTOR_DRIVER_FORM_COLUMNS,
  ...PREDICTOR_CONSTRUCTOR_FORM_COLUMNS,
  ...PREDICTOR_TEAMMATE_COLUMNS,
  ...PREDICTOR_CIRCUIT_COLUMNS,
  ...PREDICTOR_ENVIRONMENT_COLUMNS,
  ...PREDICTOR_AUDIT_COLUMNS,
  PREDICTOR_TARGET_COLUMN
];
