import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# === 1. Read the Data ===
team_df = pd.read_csv('backend/processed_data/team_seasonal_stats.csv')
rb_df = pd.read_csv('backend/processed_data/rb_data.csv')  # Your RB data file

# === 2. Preprocess RB Data: Imputation, Derived Metrics, and Scaling ===
# Compute derived yards per carry safely.
def safe_ypc(row):
    return row['rushing_yards'] / row['carries'] if row['carries'] > 0 else 0

rb_df['yards_per_carry'] = rb_df.apply(safe_ypc, axis=1)

# Define key columns.
# Production now includes only rushing metrics.
production_cols_rb = [
    'rushing_yards', 'rushing_tds',
    'yards_per_carry', 'receiving_yards', 'receiving_tds'
]

# Efficiency columns include both rushing and receiving components.
efficiency_cols_rb = [
    'rushing_epa', 'receiving_epa',
    'ngs_efficiency', 'ngs_avg_time_to_los', 'ngs_rush_yards_over_expected'
]
# Receiving stats will be used in the scheme-specific functions.
fumble_cols = ['rushing_fumbles', 'receiving_fumbles']
additional_cols = ['receiving_yards_after_catch']

all_rb_cols = list(set(production_cols_rb + efficiency_cols_rb + fumble_cols + additional_cols + ['carries']))

# Impute missing values using median.
imputer = SimpleImputer(strategy='median')
rb_imputed = rb_df.copy()
rb_imputed[all_rb_cols] = imputer.fit_transform(rb_imputed[all_rb_cols])

# Scale the columns to 0–1.
scaler = MinMaxScaler(feature_range=(0.2, 1))  # Ensures no score falls below 0.2
rb_imputed_scaled = rb_imputed.copy()
scaled_cols_rb = ["scaled_" + col for col in all_rb_cols]
rb_imputed_scaled[scaled_cols_rb] = scaler.fit_transform(rb_imputed[all_rb_cols])

# === 3. Define Functions to Compute Raw Fit Scores for Each Scheme ===
def compute_production_score_rb(rb_row):
    """
    Computes a production score for an RB.
    - 80% of the score comes from rushing production:
          * 40% from scaled rushing yards
          * 30% from scaled rushing TDs
          * 30% from scaled yards per carry
    - 20% of the score comes from receiving production:
          * 50% from scaled receiving yards
          * 50% from scaled receiving TDs
    This approach rewards pure runners while still reflecting the value of dual-threat backs.
    """
    rushing_score = (
        0.4 * rb_row['scaled_rushing_yards'] +
        0.3 * rb_row['scaled_rushing_tds'] +
        0.3 * rb_row['scaled_yards_per_carry']
    )
    receiving_score = (
        0.5 * rb_row['scaled_receiving_yards'] +
        0.5 * rb_row['scaled_receiving_tds']
    )
    production_score = 0.8 * rushing_score + 0.2 * receiving_score
    return production_score


# 1. Air Raid: Even though it's a pass-favored scheme, we still add more weight to rushing.
def compute_raw_fit_air_raid_rb(rb_row):
    prod = compute_production_score_rb(rb_row)
    eff = (
        0.25 * rb_row['scaled_receiving_epa'] +
        0.35 * rb_row['scaled_rushing_epa'] +  # Increased rushing weight
        0.20 * rb_row['scaled_ngs_efficiency'] +
        0.10 * (1 - rb_row['scaled_ngs_avg_time_to_los']) -
        0.10 * rb_row.get('scaled_receiving_fumbles', 0) -
        0.05 * rb_row.get('scaled_rushing_fumbles', 0)
    )
    return 0.40 * prod + 0.60 * eff

# 2. Spread Option: Versatile RB with an emphasis on running.
def compute_raw_fit_spread_option_rb(rb_row):
    prod = compute_production_score_rb(rb_row)
    eff = (
        0.40 * rb_row['scaled_rushing_epa'] +  # Bumped up rushing emphasis
        0.20 * rb_row['scaled_receiving_epa'] +
        0.20 * rb_row['scaled_ngs_efficiency'] +
        0.10 * (1 - rb_row['scaled_ngs_avg_time_to_los']) +
        0.10 * rb_row['scaled_ngs_rush_yards_over_expected'] -
        0.05 * (rb_row.get('scaled_rushing_fumbles', 0) + rb_row.get('scaled_receiving_fumbles', 0))
    )
    return 0.40 * prod + 0.60 * eff

# 3. West Coast: Traditionally a receiving scheme, but now still values rushing.
def compute_raw_fit_west_coast_rb(rb_row):
    prod = compute_production_score_rb(rb_row)
    eff = (
        0.30 * rb_row['scaled_receiving_epa'] +
        0.30 * rb_row['scaled_rushing_epa'] +  # Increased rushing emphasis
        0.20 * rb_row['scaled_ngs_efficiency'] +
        0.10 * (1 - rb_row['scaled_ngs_avg_time_to_los']) +
        0.10 * rb_row.get('scaled_receiving_yards_after_catch', 0) -
        0.10 * (rb_row.get('scaled_receiving_fumbles', 0) + rb_row.get('scaled_rushing_fumbles', 0))
    )
    return 0.40 * prod + 0.60 * eff

# 4. McVay: Modern West Coast with play-action—leaning more on the run.
def compute_raw_fit_mcvay_rb(rb_row):
    prod = compute_production_score_rb(rb_row)
    eff = (
        0.40 * rb_row['scaled_rushing_epa'] +  # Increased rushing emphasis
        0.15 * rb_row['scaled_receiving_epa'] +
        0.20 * rb_row['scaled_ngs_efficiency'] +
        0.15 * (1 - rb_row['scaled_ngs_avg_time_to_los']) +
        0.10 * rb_row['scaled_ngs_rush_yards_over_expected'] -
        0.05 * (rb_row.get('scaled_rushing_fumbles', 0) + rb_row.get('scaled_receiving_fumbles', 0))
    )
    return 0.40 * prod + 0.60 * eff

# 5. Shanahan Wide Zone: Highly run-focused.
def compute_raw_fit_shanahan_rb(rb_row):
    """
    Shanahan Wide Zone backs need to be efficient runners. 
    Receiving is NOT as important, so it is removed.
    """
    prod = compute_production_score_rb(rb_row)  # Already scaled between 0-1
    eff = (
        0.6 * rb_row['scaled_rushing_epa'] +  # Increase emphasis on rushing EPA
        0.2 * rb_row['scaled_ngs_efficiency'] +
        0.2 * rb_row['scaled_ngs_rush_yards_over_expected'] -
        0.05 * rb_row.get('scaled_rushing_fumbles', 0)  # Penalize fumbles
    )
    return 0.6 * prod + 0.4 * eff  # Increase production weight to inflate scores


# 6. Run Power: Power running scheme with rushing metrics paramount.
def compute_raw_fit_run_power_rb(rb_row):
    """
    Run Power schemes need strong, high-volume runners.
    - Prioritizes rushing production (yards, TDs, YPC)
    - Gives a bonus for total carries and carries per game
    - Receiving stats are not relevant in a power running scheme
    """
    prod = compute_production_score_rb(rb_row)
    eff = (
        0.6 * rb_row['scaled_rushing_epa'] +  # Heavy emphasis on rushing efficiency
        0.2 * rb_row['scaled_ngs_efficiency'] +
        0.15 * rb_row['scaled_ngs_rush_yards_over_expected'] -
        0.05 * rb_row.get('scaled_rushing_fumbles', 0)  # Penalize fumbles
    )

    # Compute carries per game (total carries / games played)
    carries_per_game = rb_row['carries'] / rb_row['games'] if rb_row['games'] > 0 else 0

    # Workhorse Bonus:
    carry_bonus = 0.05 if rb_row['carries'] >= 250 else 0  # Bonus for high carry backs
    per_game_bonus = 0.05 if carries_per_game >= 15 else 0  # Bonus for RBs with 15+ carries/game

    return 0.6 * prod + 0.4 * eff + carry_bonus + per_game_bonus

# 7. Pistol Power Spread: Balanced approach with a tilt toward rushing.
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

# Map scheme names to their corresponding functions.
raw_fit_functions_rb = {
    'air_raid': compute_raw_fit_air_raid_rb,
    'spread_option': compute_raw_fit_spread_option_rb,
    'west_coast': compute_raw_fit_west_coast_rb,
    'mcvay': compute_raw_fit_mcvay_rb,
    'shanahan': compute_raw_fit_shanahan_rb,
    'run_power': compute_raw_fit_run_power_rb,
    'pistol_power_spread': compute_raw_fit_pistol_power_spread_rb
}

# === 4. Compute Team’s Top 3 Scheme Weights for RBs ===
def get_top3_scheme_weights_rb(team_row):
    # Map team tendency columns to our RB schemes.
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

# === 5. Build the (Team, RB) Fit Dataset ===
records_rb = []
for _, team_row in team_df.iterrows():
    team_name = team_row['team_name']
    scheme_weights = get_top3_scheme_weights_rb(team_row)
    for _, rb_row in rb_imputed_scaled.iterrows():
        rb_name = rb_row['player_name']
        fit_components = {}
        for scheme, weight in scheme_weights.items():
            if scheme in raw_fit_functions_rb:
                raw_fit = raw_fit_functions_rb[scheme](rb_row)
                fit_components[scheme] = raw_fit
            else:
                fit_components[scheme] = np.nan
        final_fit = sum(scheme_weights[scheme] * fit_components[scheme] for scheme in scheme_weights)

        # Bonus for high-volume rushers (workhorses)
        if rb_row['carries'] >= 150:
            # print('bonus added')
            final_fit += 0.05  # Slight boost to workhorse backs

        # Bonus for players with high raw yards per carry (ypc > 4.2)
        if rb_row['yards_per_carry'] > 4.2:
            final_fit += 0.05  # Additional bonus for efficient rushers

        records_rb.append({
            'team_name': team_name,
            'rb_name': rb_name,
            'final_fit': final_fit,
            'production_score': compute_production_score_rb(rb_row),
            'air_raid_fit': fit_components.get('air_raid', np.nan),
            'spread_option_fit': fit_components.get('spread_option', np.nan),
            'west_coast_fit': fit_components.get('west_coast', np.nan),
            'mcvay_fit': fit_components.get('mcvay', np.nan),
            'shanahan_fit': fit_components.get('shanahan', np.nan),
            'run_power_fit': fit_components.get('run_power', np.nan),
            'pistol_power_spread_fit': fit_components.get('pistol_power_spread', np.nan)
        })

fit_rb_df = pd.DataFrame(records_rb)
print("Sample computed (team, RB) fit scores:")
print(fit_rb_df[['rb_name', 'final_fit']].head())

fit_rb_df = fit_rb_df.dropna(subset=['final_fit'])
print("Number of rows after dropping NaN final_fit:", len(fit_rb_df))

# === 6. Train a Simple Linear Regression Model Using a Pipeline ===
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
