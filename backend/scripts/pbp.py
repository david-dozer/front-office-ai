import nfl_data_py as nfl
import pandas as pd

# qb = nfl.import_qbr([2022, 2023, 2024])
# combine = nfl.import_combine_data([2022, 2023, 2024])
season = nfl.import_seasonal_data([2024])
# print(nfl.import_qbr([2022, 2024]))

# Show all available columns
print("Seasonal columns: ", season.columns.tolist())
print(len(season.columns.tolist()))

rosters = nfl.import_seasonal_rosters([2024])
print(rosters.columns.to_list())

teams = nfl.import_team_desc()
print(teams.columns.to_list())


