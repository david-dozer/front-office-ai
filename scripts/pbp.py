import nfl_data_py as nfl
import pandas as pd

# Load play-by-play data
# pbp_data = nfl.import_pbp_data([2024])

# qb = nfl.import_qbr([2022, 2023, 2024])
# combine = nfl.import_combine_data([2022, 2023, 2024])
season = nfl.import_seasonal_data([2024])
# print(nfl.import_qbr([2022, 2024]))

# Show all available columns
print(season.columns.tolist())
