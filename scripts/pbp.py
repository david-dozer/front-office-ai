import nfl_data_py as nfl
import pandas as pd

# Load play-by-play data
pbp_data = nfl.import_pbp_data([2024])

# qb = nfl.import_qbr([2022, 2023, 2024])
# combine = nfl.import_combine_data([2022, 2023, 2024])
season = nfl.import_seasonal_data([2024])
# print(nfl.import_qbr([2022, 2024]))

# Show all available columns
print("Seasonal columns: ", season.columns.tolist())
print(len(season.columns.tolist()))

rosters = nfl.import_seasonal_rosters([2024])
print(rosters.columns.to_list())
# print(rosters[rosters['football_name'] == 'Josh'][['football_name', 'last_name']])

# # Sort the DataFrame by rushing_first_downs and print it
# sorted_season = season.sort_values(by='rushing_first_downs', ascending=False)  # Sort by rushing_first_downs

# # Merge with rosters to get player details
# sorted_season = sorted_season.merge(rosters[['player_id', 'first_name', 'last_name', 'position']], on='player_id', how='left')

# # # Print the sorted DataFrame with player names and positions
# # print(sorted_season[['first_name', 'last_name', 'position', 'rushing_first_downs']])  # Print relevant columns

# # Get player ID for Josh Allen
# josh_allen_id = pbp_data[pbp_data['passer_player_name'] == 'J.Allen']['passer_player_id'].unique()

# # Filter the seasonal data for Josh Allen's stats
# josh_allen_stats = season[season['player_id'].isin(josh_allen_id)]

# # Merge with rosters to get first name and last name
# josh_allen_stats = josh_allen_stats.merge(rosters[['player_id', 'first_name', 'last_name']], on='player_id', how='left')

# # Create a new column 'name' with first and last name
# josh_allen_stats['name'] = josh_allen_stats['first_name'] + ' ' + josh_allen_stats['last_name']

# # Reorder columns to make 'name' the first column
# josh_allen_stats = josh_allen_stats[['name'] + [col for col in josh_allen_stats.columns if col != 'name']]

# # Print Josh Allen's seasonal stats
# print(josh_allen_stats)

# # Write Josh Allen's seasonal stats to a text file
# josh_allen_stats.to_csv('season.txt', index=False, sep='\t')  # Use tab as a separator

# def get_player_stats(player_name):
#     # Get player IDs for the specified player name from different roles
#     passer_ids = pbp_data[pbp_data['passer_player_name'] == player_name]['passer_player_id'].unique()
#     rusher_ids = pbp_data[pbp_data['rusher_player_name'] == player_name]['rusher_player_id'].unique()
#     receiver_ids = pbp_data[pbp_data['receiver_player_name'] == player_name]['receiver_player_id'].unique()

#     # Combine all player IDs into a single array
#     player_ids = set(passer_ids) | set(rusher_ids) | set(receiver_ids)

#     # Filter the seasonal data for the player's stats
#     player_stats = season[season['player_id'].isin(player_ids)]

#     # Merge with rosters to get first name and last name
#     player_stats = player_stats.merge(rosters[['player_id', 'first_name', 'last_name']], on='player_id', how='left')

#     # Shorten 'Joshua' to 'Josh' in the first name
#     player_stats['first_name'] = player_stats['first_name'].replace({'Joshua': 'Josh'})

#     # Create a new column 'name' with first and last name
#     player_stats['name'] = player_stats['first_name'] + ' ' + player_stats['last_name']

#     # Reorder columns to make 'name' the first column
#     player_stats = player_stats[['name'] + [col for col in player_stats.columns if col != 'name']]

#     # Drop rows with any null values
#     player_stats = player_stats.dropna()

#     return player_stats

# # Example usage
# josh_allen_stats = get_player_stats('J.Allen')
# print(josh_allen_stats)
# with open('qbrbwr.txt', 'w') as file:
#     file.write(josh_allen_stats)


