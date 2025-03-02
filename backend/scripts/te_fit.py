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
# Free agent TEs for computing fits
fa_te_df = pd.read_csv('../backend/processed_data/fa_tes.csv')
# Full TE dataset for ranking advanced metrics
full_te_df = pd.read_csv('../backend/processed_data/te_data.csv')

# === 2. Preprocess TE Data for Both Datasets ===
def preprocess_te_data(df):
    # Replace 0 games with NaN to avoid division by zero
    df['games'] = df['games'].replace(0, np.nan)
    df['receiving_yards_per_game'] = df['receiving_yards'] / df['games']
    df['receiving_tds_per_game'] = df['receiving_tds'] / df['games']
    df['receptions_per_game'] = df['receptions'] / df['games']
    df['receiving_first_downs_per_game'] = df['receiving_first_downs'] / df['games']
    return df

fa_te_df = preprocess_te_data(fa_te_df)
full_te_df = preprocess_te_data(full_te_df)

# === 3. Define Columns ===
# Production columns (lower emphasis)
production_cols_te = [
    'receiving_yards_per_game', 'receiving_tds_per_game', 'receptions_per_game'
]
# Advanced/next gen metrics for TEs (with more next gen stats)
advanced_cols_te = [
    'receiving_epa', 'receiving_first_downs_per_game', 'ngs_catch_percentage', 
    'ngs_avg_yac', 'ngs_avg_separation'
]
all_te_cols = list(set(production_cols_te + advanced_cols_te))

# === 4. Imputation & Scaling ===
imputer = SimpleImputer(strategy='median')
scaler = MinMaxScaler(feature_range=(0.2, 1))

# Process free agent TE dataset (fa_tes)
fa_te_imputed = fa_te_df.copy()
fa_te_imputed[all_te_cols] = imputer.fit_transform(fa_te_imputed[all_te_cols])
fa_te_imputed_scaled = fa_te_imputed.copy()
scaled_cols_te = ["scaled_" + col for col in all_te_cols]
fa_te_imputed_scaled[scaled_cols_te] = scaler.fit_transform(fa_te_imputed[all_te_cols])

# Process full TE dataset (te_data) for rankings
full_te_imputed = full_te_df.copy()
full_te_imputed[all_te_cols] = imputer.fit_transform(full_te_imputed[all_te_cols])
full_te_imputed_scaled = full_te_imputed.copy()
full_te_imputed_scaled[scaled_cols_te] = scaler.fit_transform(full_te_imputed[all_te_cols])

# === 5. Compute an Adjusted Production Score for TEs ===
def compute_production_score_te(te_row):
    """
    Production score for TEs using lower weights on production stats.
    Weighted sum:
      - 30% scaled receiving yards per game
      - 30% scaled receptions per game
      - 40% scaled receiving TDs per game
    """
    return (
        0.3 * te_row['scaled_receiving_yards_per_game'] +
        0.3 * te_row['scaled_receptions_per_game'] +
        0.4 * te_row['scaled_receiving_tds_per_game']
    )

# === 6. Define Raw Fit Functions for Each Scheme for TEs ===
# Each function uses 30% weight on production and 70% on advanced metrics.
# The advanced portion distributes weights among:
# - receiving_epa (EPA)
# - ngs_avg_yac (YAC) [where applicable]
# - receiving_first_downs_per_game (1st downs)
# - ngs_catch_percentage (Catch %)
# - ngs_avg_separation (only for West Coast)

def compute_raw_fit_air_raid_te(te_row):
    prod = compute_production_score_te(te_row)
    eff = (
        0.3 * te_row['scaled_receiving_epa'] +
        0.2 * te_row['scaled_ngs_avg_yac'] +
        0.2 * te_row['scaled_ngs_catch_percentage'] +
        0.3 * te_row['scaled_receiving_first_downs_per_game']
    )
    return 0.3 * prod + 0.7 * eff

def compute_raw_fit_spread_option_te(te_row):
    prod = compute_production_score_te(te_row)
    eff = (
        0.3 * te_row['scaled_receiving_epa'] +
        0.25 * te_row['scaled_ngs_avg_yac'] +
        0.25 * te_row['scaled_receiving_first_downs_per_game'] +
        0.2 * te_row['scaled_ngs_catch_percentage']
    )
    return 0.3 * prod + 0.7 * eff

def compute_raw_fit_west_coast_te(te_row):
    prod = compute_production_score_te(te_row)
    # Incorporate separation in the West Coast scheme
    eff = (
        0.25 * te_row['scaled_receiving_epa'] +
        0.2 * te_row['scaled_ngs_avg_yac'] +
        0.2 * te_row['scaled_receiving_first_downs_per_game'] +
        0.2 * te_row['scaled_ngs_catch_percentage'] +
        0.15 * te_row['scaled_ngs_avg_separation']
    )
    return 0.3 * prod + 0.7 * eff

def compute_raw_fit_mcvay_te(te_row):
    prod = compute_production_score_te(te_row)
    eff = (
        0.35 * te_row['scaled_receiving_epa'] +
        0.2 * te_row['scaled_ngs_avg_yac'] +
        0.25 * te_row['scaled_receiving_first_downs_per_game'] +
        0.2 * te_row['scaled_ngs_catch_percentage']
    )
    return 0.3 * prod + 0.7 * eff

def compute_raw_fit_shanahan_te(te_row):
    prod = compute_production_score_te(te_row)
    # Shanahan relies less on YAC, focusing on EPA, 1st downs, and catch percentage
    eff = (
        0.3 * te_row['scaled_receiving_epa'] +
        0.4 * te_row['scaled_receiving_first_downs_per_game'] +
        0.3 * te_row['scaled_ngs_catch_percentage']
    )
    return 0.3 * prod + 0.7 * eff

def compute_raw_fit_run_power_te(te_row):
    prod = compute_production_score_te(te_row)
    # Run Power focuses on EPA and 1st downs; YAC is not used here.
    eff = (
        0.25 * te_row['scaled_receiving_epa'] +
        0.5 * te_row['scaled_receiving_first_downs_per_game'] +
        0.25 * te_row['scaled_ngs_catch_percentage']
    )
    return 0.3 * prod + 0.7 * eff

def compute_raw_fit_pistol_power_spread_te(te_row):
    prod = compute_production_score_te(te_row)
    eff = (
        0.3 * te_row['scaled_receiving_epa'] +
        0.2 * te_row['scaled_ngs_avg_yac'] +
        0.3 * te_row['scaled_receiving_first_downs_per_game'] +
        0.2 * te_row['scaled_ngs_catch_percentage']
    )
    return 0.3 * prod + 0.7 * eff

raw_fit_functions_te = {
    'air_raid': compute_raw_fit_air_raid_te,
    'spread_option': compute_raw_fit_spread_option_te,
    'west_coast': compute_raw_fit_west_coast_te,
    'mcvay': compute_raw_fit_mcvay_te,
    'shanahan': compute_raw_fit_shanahan_te,
    'run_power': compute_raw_fit_run_power_te,
    'pistol_power_spread': compute_raw_fit_pistol_power_spread_te
}

# === 7. Define Function to Get Top 3 Scheme Weights for TEs ===
def get_top3_scheme_weights_te(team_row):
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

# === 8. Build the (Team, TE) Fit Dataset Using Free Agent TEs ===
records_te = []
for _, team_row in team_df.iterrows():
    team_name = team_row['team_name']
    scheme_weights = get_top3_scheme_weights_te(team_row)
    for _, te_row in fa_te_imputed_scaled.iterrows():
        te_name = te_row['player_name']
        aav = te_row['AAV'] if 'AAV' in te_row else np.nan
        prev_team = te_row['Prev Team'] if 'Prev Team' in te_row else np.nan
        age = te_row['Age']
        headshot = te_row['headshot_url'] if 'headshot_url' in te_row else ''
        fit_components = {}
        for scheme, weight in scheme_weights.items():
            if scheme in raw_fit_functions_te:
                raw_fit = raw_fit_functions_te[scheme](te_row)
                fit_components[scheme] = raw_fit
            else:
                fit_components[scheme] = np.nan
        final_fit = sum(scheme_weights[scheme] * fit_components[scheme] for scheme in scheme_weights)
        records_te.append({
            'team_name': team_name,
            'te_name': te_name,
            'aav': aav,
            'prev_team': prev_team,
            'age': age,
            'headshot': headshot, 
            'final_fit': final_fit,
            'production_score': compute_production_score_te(te_row),
            'air_raid_fit': fit_components.get('air_raid', np.nan),
            'spread_option_fit': fit_components.get('spread_option', np.nan),
            'west_coast_fit': fit_components.get('west_coast', np.nan),
            'mcvay_fit': fit_components.get('mcvay', np.nan),
            'shanahan_fit': fit_components.get('shanahan', np.nan),
            'run_power_fit': fit_components.get('run_power', np.nan),
            'pistol_power_spread_fit': fit_components.get('pistol_power_spread', np.nan),
            # Save the raw advanced metrics (from free agent TE data)
            'adv_receiving_epa': te_row['scaled_receiving_epa'],
            'adv_receiving_first_downs': te_row['scaled_receiving_first_downs_per_game'],
            'adv_ngs_catch_percentage': te_row['scaled_ngs_catch_percentage'],
            'adv_ngs_avg_yac': te_row['scaled_ngs_avg_yac'],
            'adv_ngs_avg_separation': te_row['scaled_ngs_avg_separation']
        })

fit_te_df = pd.DataFrame(records_te)
print("Sample computed (team, TE) fit scores:")
print(fit_te_df[['te_name', 'final_fit']].head())
fit_te_df = fit_te_df.dropna(subset=['final_fit'])
print("Number of rows after dropping NaN final_fit:", len(fit_te_df))

# === 9. Compute Advanced Metric Rankings from the Full TE Dataset ===
# Group by player_name to ensure each player appears only once.
grouped_full_te = full_te_imputed_scaled.groupby('player_name').agg({
    'scaled_receiving_epa': 'mean',
    'scaled_receiving_first_downs_per_game': 'mean',
    'scaled_ngs_catch_percentage': 'mean',
    'scaled_ngs_avg_yac': 'mean',
    'scaled_ngs_avg_separation': 'mean'
}).reset_index()

# For each metric, create a ranking column (with 1 as the best, i.e., highest value)
for col, rank_name in [
    ('scaled_receiving_epa', 'adv_receiving_epa_rank'),
    ('scaled_receiving_first_downs_per_game', 'adv_receiving_first_downs_rank'),
    ('scaled_ngs_catch_percentage', 'adv_ngs_catch_percentage_rank'),
    ('scaled_ngs_avg_yac', 'adv_ngs_avg_yac_rank'),
    ('scaled_ngs_avg_separation', 'adv_ngs_avg_separation_rank')
]:
    grouped_full_te[rank_name] = grouped_full_te[col].rank(ascending=False, method='min')

# Keep only the necessary ranking columns
ranking_df = grouped_full_te[['player_name', 'adv_receiving_epa_rank', 'adv_receiving_first_downs_rank', 
                              'adv_ngs_catch_percentage_rank', 'adv_ngs_avg_yac_rank', 'adv_ngs_avg_separation_rank']]

# Merge the ranking info into our free agent TE fit dataset based on te_name
fit_te_df = fit_te_df.merge(ranking_df, left_on='te_name', right_on='player_name', how='left').drop(columns=['player_name'])

# === 10. Train a Simple Linear Regression Model Using a Pipeline ===
features_te = ['production_score', 'air_raid_fit', 'spread_option_fit', 'west_coast_fit', 
               'mcvay_fit', 'shanahan_fit', 'run_power_fit', 'pistol_power_spread_fit']
X_te = fit_te_df[features_te]
y_te = fit_te_df['final_fit']
X_train_te, X_test_te, y_train_te, y_test_te = train_test_split(X_te, y_te, test_size=0.2, random_state=42)
pipeline_te = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('regressor', LinearRegression())
])
pipeline_te.fit(X_train_te, y_train_te)
y_pred_te = pipeline_te.predict(X_test_te)
mse_te = mean_squared_error(y_test_te, y_pred_te)
print("Mean Squared Error for TE model:", mse_te)
