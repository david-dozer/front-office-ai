from pro_football_reference_web_scraper import player_game_log as p

game_log = p.get_player_game_log(player = 'Cam Robinson', position = 'T', season = 2023)
print(game_log)

print(game_log.columns.to_list())