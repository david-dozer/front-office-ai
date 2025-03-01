import nfl_data_py as nfl
import pandas as pd
from playerscrape import scrape_free_agents, off_url

# qb = nfl.import_qbr([2022, 2023, 2024])
# combine = nfl.import_combine_data([2022, 2023, 2024])
season = nfl.import_seasonal_data([2022, 2023, 2024])

# print(nfl.import_qbr([2022, 2024]))

# Show all available columns
print("Seasonal columns: ", season.columns.tolist())
print(len(season.columns.tolist()))

# Print the target share for player_id '00-0033921' in 2024
target_share = season[(season['player_id'] == '00-0033921') & (season['season'] == 2024)]['target_share']
print("Target share for player_id '00-0033921' in 2024: ", target_share)

rosters = nfl.import_seasonal_rosters([2024])

print(rosters.columns.to_list())

merged_df = pd.merge(rosters, season, on='player_id')
qb_players = merged_df[merged_df['position'] == 'QB'].drop_duplicates(subset='player_id')
print(qb_players)

# Save the QB players DataFrame to a CSV file
qb_players.to_csv('qb_players.csv', index=False)

# Run the scrape_free_agents function
free_agents_df = scrape_free_agents(off_url)
qb_players = qb_players.merge(free_agents_df, left_on='player_name', right_on='Name', how='inner')
qb_players.to_csv('qb_players.csv', index=False)

print(rosters[(rosters['team'] == 'DEN') & (rosters['player_name'] == 'Zach Wilson')]['player_id'])

# # Filter and print the roster for the Denver Broncos
# den_roster = rosters[rosters['team_abbr'] == 'DEN']
# print(den_roster)

# teams = nfl.import_team_desc()
# print(teams.columns.to_list())

# # Get the row from season where player_id == '00-0037013'
# player_row = season[season['player_id'] == '00-0037013']
# print(player_row)

