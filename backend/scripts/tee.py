import nfl_data_py as nfl
import pandas as pd

# Load play-by-play data for the 2024 season
# pbp_data = nfl.import_pbp_data([2024])

url = "https://github.com/nflverse/nflverse-data/releases/download/espn_data/qbr_week_level.parquet"
qbr = pd.read_parquet(url).loc[lambda x: x.season == 2024].reset_index(drop=True)

print(qbr.columns.to_list())
# Filter for qualified QBs (assuming 'qualified' column exists)
qualified_qbs = qbr[qbr['qualified'] == True]

# Group by QB and season to calculate seasonal averages
seasonal_averages = qualified_qbs.groupby(['name_display', 'season']).agg({
    'qbr_raw': 'mean',
    'qbr_total': 'mean'
}).reset_index()

# Rename columns for clarity
seasonal_averages.columns = ['QB Name', 'Season', 'Seasonal QBR Raw', 'Seasonal QBR Total']

# Print the seasonal averages for QBR Raw and QBR Total
print(seasonal_averages[['QB Name', 'Season', 'Seasonal QBR Raw', 'Seasonal QBR Total']])

qbr.to_csv('qbr.txt', index=False)

# # Filter for Lamar Jackson’s passing plays
# lamar_passing = pbp_data[(pbp_data['passer_player_name'] == 'C.Williams')]

# # Aggregate necessary stats by game
# lamar_game_stats = lamar_passing.groupby(['game_id', 'week', 'posteam']).agg({
#     'passing_yards': 'sum',
#     'pass_touchdown': 'sum',
#     'interception': 'sum',
#     'pass_attempt': 'sum',
#     'complete_pass': 'sum',
#     'epa': 'sum',
#     'cpoe': 'mean'
# }).reset_index()

# # Rename columns
# lamar_game_stats.columns = ['Game ID', 'Week', 'Team', 'Passing Yards', 'Passing TDs', 
#                             'Interceptions', 'Pass Attempts', 'Completions', 'EPA', 'CPOE']

# # **Calculate Passer Rating**
# def passer_rating(completions, pass_attempts, passing_yards, passing_tds, interceptions):
#     a = ((completions / pass_attempts) - 0.3) * 5
#     b = ((passing_yards / pass_attempts) - 3) * 0.25
#     c = (passing_tds / pass_attempts) * 20
#     d = 2.375 - ((interceptions / pass_attempts) * 25)

#     # Ensure values are within bounds (0-2.375)
#     a, b, c, d = max(0, min(a, 2.375)), max(0, min(b, 2.375)), max(0, min(c, 2.375)), max(0, min(d, 2.375))
    
#     return ((a + b + c + d) / 6) * 100

# # Apply the function to calculate passer rating
# lamar_game_stats['Passer Rating'] = lamar_game_stats.apply(
#     lambda row: passer_rating(row['Completions'], row['Pass Attempts'], 
#                               row['Passing Yards'], row['Passing TDs'], 
#                               row['Interceptions']), axis=1)

# # **Approximate QBR using EPA (not exact, but gives an idea)**
# # This is a rough estimate, actual QBR also includes clutch weighting and expected play value.
# lamar_game_stats['Approx QBR'] = (lamar_game_stats['EPA'] + 5) * 10  # Scales EPA to 0-100 range

# # Display the results
# print(lamar_game_stats[['Game ID', 'Week', 'Team', 'Passing Yards', 'Passing TDs', 
#                         'Interceptions', 'Passer Rating']])
