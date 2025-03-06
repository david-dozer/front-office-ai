import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# === 1. Read the Data ===
team_df = pd.read_csv('../backend/processed_data/team_seasonal_stats.csv')
rb_df = pd.read_csv('../backend/processed_data/fa_rbs.csv')  # Free agent RB data

# === 2. Preprocess RB Data ===
def safe_ypc(row):
    return row['rushing_yards'] / row['carries'] if row['carries'] > 0 else 0

rb_df['yards_per_carry'] = rb_df.apply(safe_ypc, axis=1)

# Define columns used in production and efficiency calculations.
production_cols_rb = [
    'rushing_yards', 'rushing_tds',
    'yards_per_carry', 'receiving_yards', 'receiving_tds'
]
efficiency_cols_rb = [
    'rushing_epa', 'receiving_epa',
    'ngs_efficiency', 'ngs_avg_time_to_los', 'ngs_rush_yards_over_expected'
]
# fumbles are not used in ranking, but are part of raw fit functions.
fumble_cols = ['rushing_fumbles', 'receiving_fumbles']
additional_cols = ['receiving_yards_after_catch']

all_rb_cols = list(set(production_cols_rb + efficiency_cols_rb + fumble_cols + additional_cols + ['carries']))

imputer = SimpleImputer(strategy='median')
rb_imputed = rb_df.copy()
rb_imputed[all_rb_cols] = imputer.fit_transform(rb_imputed[all_rb_cols])

scaler = MinMaxScaler(feature_range=(0.2, 1))
rb_imputed_scaled = rb_imputed.copy()
scaled_cols_rb = ["scaled_" + col for col in all_rb_cols]
rb_imputed_scaled[scaled_cols_rb] = scaler.fit_transform(rb_imputed[all_rb_cols])

# === 3. Bonus Functions ===
def compute_volume_bonus_rb(rb_row):
    bonus = 0
    if rb_row['carries'] >= 250:
        bonus += 0.02
    if rb_row['games'] > 0:
        carries_per_game = rb_row['carries'] / rb_row['games']
        if carries_per_game >= 15:
            bonus += 0.03
    return bonus

def compute_ypc_bonus_rb(rb_row):
    bonus = 0
    if rb_row['yards_per_carry'] > 4.2:
        bonus += 0.1
    return bonus

def compute_receiving_bonus_rb(rb_row):
    bonus = 0
    # Example thresholds: if receptions >= 30 and receiving_yards >= 300, add bonus.
    if rb_row.get('receptions', 0) >= 30:
        bonus += 0.0375
    if rb_row.get('receiving_yards', 0) >= 300:
        bonus += 0.0375
    return bonus

# === 4. Production Score & Raw Fit Functions ===
def compute_production_score_rb(rb_row):
    # 80% from rushing production, 20% from receiving production.
    rushing_score = (
        0.4 * rb_row['scaled_rushing_yards'] +
        0.3 * rb_row['scaled_rushing_tds'] +
        0.3 * rb_row['scaled_yards_per_carry']
    )
    receiving_score = (
        0.5 * rb_row['scaled_receiving_yards'] +
        0.5 * rb_row['scaled_receiving_tds']
    )
    return 0.8 * rushing_score + 0.2 * receiving_score

def compute_raw_fit_air_raid_rb(rb_row):
    prod = compute_production_score_rb(rb_row)
    eff = (
        0.25 * rb_row['scaled_receiving_epa'] +
        0.35 * rb_row['scaled_rushing_epa'] +
        0.20 * rb_row['scaled_ngs_efficiency'] +
        0.10 * (1 - rb_row['scaled_ngs_avg_time_to_los']) -
        0.10 * rb_row.get('scaled_receiving_fumbles', 0) -
        0.05 * rb_row.get('scaled_rushing_fumbles', 0)
    )
    return 0.40 * prod + 0.60 * eff

def compute_raw_fit_spread_option_rb(rb_row):
    prod = compute_production_score_rb(rb_row)
    eff = (
        0.40 * rb_row['scaled_rushing_epa'] +
        0.20 * rb_row['scaled_receiving_epa'] +
        0.20 * rb_row['scaled_ngs_efficiency'] +
        0.10 * (1 - rb_row['scaled_ngs_avg_time_to_los']) +
        0.10 * rb_row['scaled_ngs_rush_yards_over_expected'] -
        0.05 * (rb_row.get('scaled_rushing_fumbles', 0) + rb_row.get('scaled_receiving_fumbles', 0))
    )
    return 0.40 * prod + 0.60 * eff

def compute_raw_fit_west_coast_rb(rb_row):
    prod = compute_production_score_rb(rb_row)
    eff = (
        0.30 * rb_row['scaled_receiving_epa'] +
        0.30 * rb_row['scaled_rushing_epa'] +
        0.20 * rb_row['scaled_ngs_efficiency'] +
        0.10 * (1 - rb_row['scaled_ngs_avg_time_to_los']) +
        0.10 * rb_row.get('scaled_receiving_yards_after_catch', 0) -
        0.10 * (rb_row.get('scaled_receiving_fumbles', 0) + rb_row.get('scaled_rushing_fumbles', 0))
    )
    return 0.40 * prod + 0.60 * eff

def compute_raw_fit_mcvay_rb(rb_row):
    prod = compute_production_score_rb(rb_row)
    eff = (
        0.40 * rb_row['scaled_rushing_epa'] +
        0.15 * rb_row['scaled_receiving_epa'] +
        0.20 * rb_row['scaled_ngs_efficiency'] +
        0.15 * (1 - rb_row['scaled_ngs_avg_time_to_los']) +
        0.10 * rb_row['scaled_ngs_rush_yards_over_expected'] -
        0.05 * (rb_row.get('scaled_rushing_fumbles', 0) + rb_row.get('scaled_receiving_fumbles', 0))
    )
    return 0.40 * prod + 0.60 * eff

def compute_raw_fit_shanahan_rb(rb_row):
    prod = compute_production_score_rb(rb_row)
    eff = (
        0.6 * rb_row['scaled_rushing_epa'] +
        0.2 * rb_row['scaled_ngs_efficiency'] +
        0.2 * rb_row['scaled_ngs_rush_yards_over_expected'] -
        0.05 * rb_row.get('scaled_rushing_fumbles', 0)
    )
    return 0.6 * prod + 0.4 * eff

def compute_raw_fit_run_power_rb(rb_row):
    prod = compute_production_score_rb(rb_row)
    eff = (
        0.6 * rb_row['scaled_rushing_epa'] +
        0.2 * rb_row['scaled_ngs_efficiency'] +
        0.15 * rb_row['scaled_ngs_rush_yards_over_expected'] -
        0.05 * rb_row.get('scaled_rushing_fumbles', 0)
    )
    carries_per_game = rb_row['carries'] / rb_row['games'] if rb_row['games'] > 0 else 0
    carry_bonus = 0.05 if rb_row['carries'] >= 250 else 0
    per_game_bonus = 0.05 if carries_per_game >= 15 else 0
    return 0.6 * prod + 0.4 * eff + carry_bonus + per_game_bonus

def compute_raw_fit_pistol_power_spread_rb(rb_row):
    prod = compute_production_score_rb(rb_row)
    eff = (
        0.40 * rb_row['scaled_rushing_epa'] +
        0.30 * rb_row['scaled_receiving_epa'] +
        0.20 * rb_row['scaled_ngs_efficiency'] +
        0.05 * (1 - rb_row['scaled_ngs_avg_time_to_los']) +
        0.05 * rb_row['scaled_ngs_rush_yards_over_expected'] -
        0.05 * (rb_row.get('scaled_rushing_fumbles', 0) + rb_row.get('scaled_receiving_fumbles', 0))
    )
    return 0.40 * prod + 0.60 * eff

raw_fit_functions_rb = {
    'air_raid': compute_raw_fit_air_raid_rb,
    'spread_option': compute_raw_fit_spread_option_rb,
    'west_coast': compute_raw_fit_west_coast_rb,
    'mcvay': compute_raw_fit_mcvay_rb,
    'shanahan': compute_raw_fit_shanahan_rb,
    'run_power': compute_raw_fit_run_power_rb,
    'pistol_power_spread': compute_raw_fit_pistol_power_spread_rb
}

# === 5. Scheme Weights ===
def get_top3_scheme_weights_rb(team_row):
    schemes = {
        'air_raid': team_row['score_air_raid'],
        'spread_option': team_row['score_spread_option'],
        'west_coast': team_row['score_west_coast'],
        'mcvay': team_row['score_west_coast_mcvay'],
        'shanahan': team_row['score_shanahan_wide_zone'],
        'run_power': team_row['score_run_power'],
        'pistol_power_spread': team_row['score_pistol_power_spread']
    }
    sorted_schemes = sorted(schemes.items(), key=lambda x: x[1], reverse=True)
    top3 = sorted_schemes[:3]
    total = sum(score for _, score in top3)
    weights = {scheme: score / total for scheme, score in top3}
    return weights

# === 6. Unified Final Fit Calculation ===
def compute_final_fit_rb(rb_row, scheme_weights, raw_fit_functions):
    """
    Computes the final fit score for an RB, combining weighted raw fits and bonuses.
    """
    # Compute base weighted fit from each scheme.
    fit_components = {}
    for scheme, weight in scheme_weights.items():
        if scheme in raw_fit_functions:
            fit_components[scheme] = raw_fit_functions[scheme](rb_row)
        else:
            fit_components[scheme] = np.nan
    base_fit = sum(scheme_weights[scheme] * fit_components[scheme] for scheme in scheme_weights if np.isfinite(fit_components[scheme]))
    
    if rb_row['games'] < 9:
        base_fit -= 0.1  # Penalize for insufficient games
    
    # Add bonuses.
    base_fit += compute_volume_bonus_rb(rb_row)
    base_fit += compute_ypc_bonus_rb(rb_row)
    base_fit += compute_receiving_bonus_rb(rb_row)
    
    recency_penalty = (2024- int(rb_row['season'])) * 0.05

    return base_fit - recency_penalty

# === 7. Build (Team, RB) Fit Dataset ===
records_rb = []
for _, team_row in team_df.iterrows():
    team_name = team_row['team_name']
    scheme_weights = get_top3_scheme_weights_rb(team_row)
    for _, rb_row in rb_imputed_scaled.iterrows():
        rb_name = rb_row['player_name']
        rb_id = rb_row['player_id']
        aav = rb_row['AAV']
        prev_team = rb_row['Prev Team']
        age = rb_row['Age']
        games = rb_row['games']
        headshot = rb_row['headshot_url']
        final_fit = compute_final_fit_rb(rb_row, scheme_weights, raw_fit_functions_rb)
        records_rb.append({
            'team_name': team_name,
            'rb_name': rb_name,
            'rb_id': rb_id,
            'aav': aav,
            'prev_team': prev_team,
            'age': age,
            'games': games,
            'headshot': headshot,
            'final_fit': final_fit,
            'production_score': compute_production_score_rb(rb_row),
            'air_raid_fit': raw_fit_functions_rb.get('air_raid', lambda x: np.nan)(rb_row),
            'spread_option_fit': raw_fit_functions_rb.get('spread_option', lambda x: np.nan)(rb_row),
            'west_coast_fit': raw_fit_functions_rb.get('west_coast', lambda x: np.nan)(rb_row),
            'mcvay_fit': raw_fit_functions_rb.get('mcvay', lambda x: np.nan)(rb_row),
            'shanahan_fit': raw_fit_functions_rb.get('shanahan', lambda x: np.nan)(rb_row),
            'run_power_fit': raw_fit_functions_rb.get('run_power', lambda x: np.nan)(rb_row),
            'pistol_power_spread_fit': raw_fit_functions_rb.get('pistol_power_spread', lambda x: np.nan)(rb_row)
        })

fit_rb_df = pd.DataFrame(records_rb)
fit_rb_df = fit_rb_df.dropna(subset=['final_fit'])

# === 8. Train a Model Pipeline (Optional) ===
features_rb = ['production_score', 'air_raid_fit', 'spread_option_fit', 'west_coast_fit', 
               'mcvay_fit', 'shanahan_fit', 'run_power_fit', 'pistol_power_spread_fit']
X_rb = fit_rb_df[features_rb]
y_rb = fit_rb_df['final_fit']
X_train_rb, X_test_rb, y_train_rb, y_test_rb = train_test_split(X_rb, y_rb, test_size=0.2, random_state=42)
pipeline_rb = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('regressor', LinearRegression())
])
pipeline_rb.fit(X_train_rb, y_train_rb)
y_pred_rb = pipeline_rb.predict(X_test_rb)
mse_rb = mean_squared_error(y_test_rb, y_pred_rb)
print("Mean Squared Error for RB model:", mse_rb)

# === 9. Functionalized Full RB Ranking ===
def compute_full_rb_rankings():
    """
    Loads the full RB dataset (from 'rb_data.csv'), preprocesses it similarly,
    computes an inverted NGS Avg Time to LOS, and returns a DataFrame with ranking columns
    for all the desired RB stats.
    """
    full_rb_df = pd.read_csv('../backend/processed_data/rb_data.csv')
    
    # Calculate yards per carry as before.
    full_rb_df['yards_per_carry'] = full_rb_df.apply(
        lambda row: row['rushing_yards'] / row['carries'] if row['carries'] > 0 else 0, axis=1
    )
    
    # Define base columns already used.
    production_cols_rb = [
        'rushing_yards', 'rushing_tds',
        'yards_per_carry', 'receiving_yards', 'receiving_tds'
    ]
    efficiency_cols_rb = [
        'rushing_epa', 'receiving_epa',
        'ngs_efficiency', 'ngs_avg_time_to_los', 'ngs_rush_yards_over_expected'
    ]
    fumble_cols = ['rushing_fumbles', 'receiving_fumbles']
    additional_cols = ['receiving_yards_after_catch']
    
    # Add the extra stats that you want ranked but were not previously included.
    additional_stats = [
        'receiving_air_yards', 'receiving_first_downs', 'racr',
        'rushing_first_downs', 'rushing_2pt_conversions', 'rushing_fumbles_lost',
        'ngs_avg_rush_yards', 'ngs_expected_rush_yards', 'ngs_rush_yards_over_expected_per_att', 'ngs_rush_pct_over_expected',
        'receptions', 'targets', 'receiving_fumbles_lost'
    ]
    
    # Combine all columns to impute and scale.
    all_rb_cols_local = list(set(production_cols_rb + efficiency_cols_rb + fumble_cols + additional_cols + ['carries'] + additional_stats))
    
    # Impute missing values and scale the data.
    imputer_local = SimpleImputer(strategy='median')
    scaler_local = MinMaxScaler(feature_range=(0.2, 1))
    full_imputed = full_rb_df.copy()
    full_imputed[all_rb_cols_local] = imputer_local.fit_transform(full_imputed[all_rb_cols_local])
    full_imputed_scaled = full_imputed.copy()
    scaled_cols_full = ["scaled_" + col for col in all_rb_cols_local]
    full_imputed_scaled[scaled_cols_full] = scaler_local.fit_transform(full_imputed[all_rb_cols_local])
    
    # Invert NGS Avg Time to LOS so that lower times rank higher.
    if 'scaled_ngs_avg_time_to_los' in full_imputed_scaled.columns:
        full_imputed_scaled['scaled_ngs_avg_time_to_los_inv'] = 1 - full_imputed_scaled['scaled_ngs_avg_time_to_los']
    
    # Define ranking metrics for all your desired stats.
    rb_ranking_columns = {
        # Advanced Stats (Scheme-Specific)
        'rushing_epa': 'scaled_rushing_epa',
        'receiving_air_yards': 'scaled_receiving_air_yards',
        'receiving_yards_after_catch': 'scaled_receiving_yards_after_catch',
        'receiving_first_downs': 'scaled_receiving_first_downs',
        'racr': 'scaled_racr',
        'rushing_first_downs': 'scaled_rushing_first_downs',
        'rushing_2pt_conversions': 'scaled_rushing_2pt_conversions',
        'rushing_fumbles_lost': 'scaled_rushing_fumbles_lost',
        'receiving_epa': 'scaled_receiving_epa',
        # Next Gen Stats (Scheme-Specific)
        'ngs_efficiency': 'scaled_ngs_efficiency',
        'ngs_avg_time_to_los_inv': 'scaled_ngs_avg_time_to_los_inv',
        'ngs_avg_rush_yards': 'scaled_ngs_avg_rush_yards',
        'ngs_expected_rush_yards': 'scaled_ngs_expected_rush_yards',
        'ngs_rush_yards_over_expected': 'scaled_ngs_rush_yards_over_expected',
        'ngs_rush_yards_over_expected_per_att': 'scaled_ngs_rush_yards_over_expected_per_att',
        'ngs_rush_pct_over_expected': 'scaled_ngs_rush_pct_over_expected',
        # Standard Receiving Stats
        'receptions': 'scaled_receptions',
        'targets': 'scaled_targets',
        'receiving_yards': 'scaled_receiving_yards',
        'receiving_tds': 'scaled_receiving_tds',
        'receiving_fumbles': 'scaled_receiving_fumbles',
        'receiving_fumbles_lost': 'scaled_receiving_fumbles_lost'
    }
    
    # Group by player and compute the mean of each scaled metric.
    grouped_full_rb = full_imputed_scaled.groupby('player_name').agg({col: 'mean' for col in rb_ranking_columns.values()}).reset_index()
    
    # For each metric, add a ranking column (with lower rank numbers indicating better performance).
    for metric, scaled_col in rb_ranking_columns.items():
        rank_col = metric + '_rank'
        grouped_full_rb[rank_col] = grouped_full_rb[scaled_col].rank(ascending=False, method='min')
    
    # Select only the player name and the ranking columns to return.
    ranking_cols = ['player_name'] + [metric + '_rank' for metric in rb_ranking_columns.keys()]
    ranking_rb_df = grouped_full_rb[ranking_cols]
    return ranking_rb_df


# End of rb_fit.py
print("RB model updated with unified final fit and bonuses.")
