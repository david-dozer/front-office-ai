import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# === 1. Read the Data ===
team_df = pd.read_csv('processed_data/team_seasonal_stats.csv')
qb_df = pd.read_csv('qb_data.csv')

# Only take the first 15 QBs from the QB CSV.
# qb_df = qb_df.head(15)

# === 2. Preprocess QB Data: Imputation and Scaling ===
# Define key columns for production and efficiency/advanced metrics.
production_cols = ['passing_yards', 'passing_tds']
efficiency_cols = [
    'passing_epa',
    'ngs_avg_intended_air_yards',
    'ngs_completion_percentage_above_expectation',
    'interceptions',
    'rushing_epa',
    'sacks',
    'ngs_completion_percentage',
    'ngs_avg_completed_air_yards',
    'ngs_avg_time_to_throw',
    'dakota'
]
all_qb_cols = list(set(production_cols + efficiency_cols))

# Create an imputer for missing values and impute using median.
imputer = SimpleImputer(strategy='median')
qb_imputed = qb_df.copy()
qb_imputed[all_qb_cols] = imputer.fit_transform(qb_imputed[all_qb_cols])

# Scale values to 0-1 using MinMaxScaler.
scaler = MinMaxScaler()
qb_imputed_scaled = qb_imputed.copy()
scaled_cols = ["scaled_" + col for col in all_qb_cols]
qb_imputed_scaled[scaled_cols] = scaler.fit_transform(qb_imputed[all_qb_cols])

# === 3. Define Functions to Compute Raw Fit Scores for Each Scheme ===

# Production score: average of scaled passing yards and passing TDs.
def compute_production_score(qb_row):
    return 0.5 * qb_row['scaled_passing_yards'] + 0.5 * qb_row['scaled_passing_tds']

# Air Raid: Emphasizes passing efficiency, intended air yards, and accuracy; penalizes interceptions.
def compute_raw_fit_air_raid(qb_row):
    prod = compute_production_score(qb_row)
    eff = (0.40 * qb_row['scaled_passing_epa'] +
           0.30 * qb_row['scaled_ngs_avg_intended_air_yards'] +
           0.20 * qb_row['scaled_ngs_completion_percentage_above_expectation'] -
           0.10 * qb_row['scaled_interceptions'])
    return 0.60 * prod + 0.40 * eff

# Spread Option: Balances passing and rushing with quick decision-making.
def compute_raw_fit_spread_option(qb_row):
    prod = compute_production_score(qb_row)
    eff = (0.30 * qb_row['scaled_passing_epa'] +
           0.30 * qb_row['scaled_rushing_epa'] +
           0.20 * qb_row['scaled_ngs_completion_percentage_above_expectation'] -
           0.10 * qb_row['scaled_sacks'] -
           0.10 * qb_row['scaled_interceptions'])
    return 0.60 * prod + 0.40 * eff

# West Coast: Focuses on short, high-percentage passes and yards after catch.
def compute_raw_fit_west_coast(qb_row):
    prod = compute_production_score(qb_row)
    eff = (0.35 * qb_row['scaled_passing_epa'] +
           0.35 * qb_row['scaled_ngs_completion_percentage'] +
           0.20 * qb_row['scaled_ngs_avg_completed_air_yards'] -
           0.10 * qb_row['scaled_interceptions'])
    return 0.60 * prod + 0.40 * eff

# McVay System: Emphasizes quick decision-making and play-action.
def compute_raw_fit_mcvay(qb_row):
    prod = compute_production_score(qb_row)
    eff = (0.30 * qb_row['scaled_passing_epa'] +
           0.20 * qb_row['scaled_ngs_completion_percentage_above_expectation'] +
           0.20 * qb_row['scaled_dakota'] +
           0.10 * qb_row['scaled_rushing_epa'] -
           0.10 * qb_row['scaled_sacks'] -
           0.10 * qb_row['scaled_interceptions'])
    return 0.60 * prod + 0.40 * eff

# Shanahan Wide Zone: Run-favored but requires efficient passing.
def compute_raw_fit_shanahan(qb_row):
    prod = compute_production_score(qb_row)
    eff = (0.30 * qb_row['scaled_passing_epa'] +
           0.30 * qb_row['scaled_rushing_epa'] +
           0.20 * qb_row['scaled_ngs_completion_percentage'] -
           0.10 * qb_row['scaled_sacks'] -
           0.10 * qb_row['scaled_interceptions'])
    return 0.60 * prod + 0.40 * eff

# Run Power: Emphasizes a strong rushing game with controlled passing.
def compute_raw_fit_run_power(qb_row):
    prod = compute_production_score(qb_row)
    eff = (0.25 * qb_row['scaled_passing_epa'] +
           0.35 * qb_row['scaled_rushing_epa'] +
           0.20 * qb_row['scaled_ngs_completion_percentage'] -
           0.10 * qb_row['scaled_sacks'] -
           0.10 * qb_row['scaled_interceptions'])
    return 0.60 * prod + 0.40 * eff

# Pistol Power Spread: Hybrid approach with emphasis on QB mobility.
def compute_raw_fit_pistol(qb_row):
    prod = compute_production_score(qb_row)
    # For ngs_avg_time_to_throw, lower is better so we use (1 - value)
    eff = (0.35 * qb_row['scaled_passing_epa'] +
           0.25 * qb_row['scaled_rushing_epa'] +
           0.20 * qb_row['scaled_ngs_completion_percentage_above_expectation'] +
           0.10 * (1 - qb_row['scaled_ngs_avg_time_to_throw']) -
           0.10 * qb_row['scaled_sacks'] -
           0.10 * qb_row['scaled_interceptions'])
    return 0.60 * prod + 0.40 * eff

# Map scheme names to functions.
raw_fit_functions = {
    'air_raid': compute_raw_fit_air_raid,
    'spread_option': compute_raw_fit_spread_option,
    'west_coast': compute_raw_fit_west_coast,
    'mcvay': compute_raw_fit_mcvay,
    'shanahan': compute_raw_fit_shanahan,
    'run_power': compute_raw_fit_run_power,
    'pistol_power_spread': compute_raw_fit_pistol
}

# === 4. Compute Team’s Top 3 Scheme Weights ===
def get_top3_scheme_weights_for_model(team_row):
    # Map internal scheme names to the corresponding team_df score columns.
    schemes = {
        'mcvay': team_row['score_west_coast_mcvay'],
        'air_raid': team_row['score_air_raid'],
        'spread_option': team_row['score_spread_option'],
        'west_coast': team_row['score_west_coast'],
        'run_power': team_row['score_run_power'],
        'pistol_power_spread': team_row['score_pistol_power_spread'],
        'shanahan': team_row['score_shanahan_wide_zone']
    }
    # Sort schemes by score (descending) and take the top 3.
    sorted_schemes = sorted(schemes.items(), key=lambda x: x[1], reverse=True)
    top3 = sorted_schemes[:3]
    total = sum(score for _, score in top3)
    weights = {scheme: score / total for scheme, score in top3}
    return weights

# === 5. Build the (Team, QB) Fit Dataset ===
records = []
# Loop over every team.
for _, team_row in team_df.iterrows():
    team_name = team_row['team_name']
    # Get the team's top 3 scheme weights.
    scheme_weights = get_top3_scheme_weights_for_model(team_row)
    # Loop over each QB in our (first 15) qb data.
    for _, qb_row in qb_imputed_scaled.iterrows():
        qb_name = qb_row['player_name']
        # Compute raw fit for each scheme in the team's top 3.
        fit_components = {}
        for scheme, weight in scheme_weights.items():
            if scheme in raw_fit_functions:
                raw_fit = raw_fit_functions[scheme](qb_row)
                fit_components[scheme] = raw_fit
            else:
                fit_components[scheme] = np.nan
        # Compute the final weighted fit.
        final_fit = sum(scheme_weights[scheme] * fit_components[scheme] for scheme in scheme_weights)
        records.append({
            'team_name': team_name,
            'qb_name': qb_name,
            'final_fit': final_fit,
            'production_score': compute_production_score(qb_row),
            'air_raid_fit': fit_components.get('air_raid', np.nan),
            'spread_option_fit': fit_components.get('spread_option', np.nan),
            'west_coast_fit': fit_components.get('west_coast', np.nan),
            'mcvay_fit': fit_components.get('mcvay', np.nan),
            'shanahan_fit': fit_components.get('shanahan', np.nan),
            'run_power_fit': fit_components.get('run_power', np.nan),
            'pistol_fit': fit_components.get('pistol_power_spread', np.nan)
        })

# Create a DataFrame from our records.
fit_df = pd.DataFrame(records)
print("Sample computed (team, QB) fit scores:")
print(fit_df[['qb_name', 'final_fit']].head())

# Drop any rows where the target (final_fit) is NaN.
fit_df = fit_df.dropna(subset=['final_fit'])
print("Number of rows after dropping NaN final_fit:", len(fit_df))

# === 6. Train a Simple Linear Regression Model Using a Pipeline ===
features = ['production_score', 'air_raid_fit', 'spread_option_fit', 'west_coast_fit',
            'mcvay_fit', 'shanahan_fit', 'run_power_fit', 'pistol_fit']
X = fit_df[features]
y = fit_df['final_fit']

# Split data into training and testing sets.
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Build a pipeline with an imputer (in case of any remaining NaNs) and a linear regression model.
pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('regressor', LinearRegression())
])

# Fit the model.
pipeline.fit(X_train, y_train)

# Predict on the test set and evaluate.
y_pred = pipeline.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
print("Mean Squared Error with imputation pipeline:", mse)
