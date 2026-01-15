SEED_PLAYERS = [
    # Quarterbacks
    {"name": "Patrick Mahomes", "team": "KC", "position": "QB", "pass_yds": 4839, "pass_td": 41, "fantasy_pts": 324.5},
    {"name": "Josh Allen", "team": "BUF", "position": "QB", "pass_yds": 4306, "pass_td": 35, "fantasy_pts": 312.8},
    {"name": "Lamar Jackson", "team": "BAL", "position": "QB", "pass_yds": 3678, "pass_td": 24, "fantasy_pts": 298.2},
    {"name": "Jalen Hurts", "team": "PHI", "position": "QB", "pass_yds": 3858, "pass_td": 23, "fantasy_pts": 285.6},
    {"name": "Joe Burrow", "team": "CIN", "position": "QB", "pass_yds": 4475, "pass_td": 34, "fantasy_pts": 278.4},
    {"name": "Dak Prescott", "team": "DAL", "position": "QB", "pass_yds": 4516, "pass_td": 36, "fantasy_pts": 275.2},
    {"name": "Justin Herbert", "team": "LAC", "position": "QB", "pass_yds": 4100, "pass_td": 28, "fantasy_pts": 268.4},
    {"name": "Tua Tagovailoa", "team": "MIA", "position": "QB", "pass_yds": 4624, "pass_td": 29, "fantasy_pts": 265.8},
    
    # Running Backs
    {"name": "Christian McCaffrey", "team": "SF", "position": "RB", "rush_yds": 1459, "rush_td": 14, "rec_yds": 564, "rec_td": 7, "fantasy_pts": 341.2},
    {"name": "Breece Hall", "team": "NYJ", "position": "RB", "rush_yds": 1234, "rush_td": 11, "rec_yds": 591, "rec_td": 4, "fantasy_pts": 285.4},
    {"name": "Bijan Robinson", "team": "ATL", "position": "RB", "rush_yds": 1345, "rush_td": 9, "rec_yds": 487, "rec_td": 4, "fantasy_pts": 268.9},
    {"name": "Jahmyr Gibbs", "team": "DET", "position": "RB", "rush_yds": 1156, "rush_td": 12, "rec_yds": 436, "rec_td": 1, "fantasy_pts": 262.3},
    {"name": "Kyren Williams", "team": "LAR", "position": "RB", "rush_yds": 1198, "rush_td": 10, "rec_yds": 206, "rec_td": 3, "fantasy_pts": 248.7},
    {"name": "Derrick Henry", "team": "TEN", "position": "RB", "rush_yds": 1167, "rush_td": 12, "rec_yds": 214, "rec_td": 0, "fantasy_pts": 246.1},
    {"name": "Saquon Barkley", "team": "NYG", "position": "RB", "rush_yds": 962, "rush_td": 6, "rec_yds": 280, "rec_td": 4, "fantasy_pts": 238.2},
    {"name": "Alvin Kamara", "team": "NO", "position": "RB", "rush_yds": 694, "rush_td": 5, "rec_yds": 466, "rec_td": 1, "fantasy_pts": 230.0},
    {"name": "Rhamondre Stevenson", "team": "NE", "position": "RB", "rush_yds": 619, "rush_td": 4, "rec_yds": 238, "rec_td": 0, "fantasy_pts": 185.7},
    {"name": "James Cook", "team": "BUF", "position": "RB", "rush_yds": 1122, "rush_td": 16, "rec_yds": 445, "rec_td": 0, "fantasy_pts": 276.7},
    
    # Wide Receivers
    {"name": "CeeDee Lamb", "team": "DAL", "position": "WR", "rec_yds": 1749, "rec_td": 12, "fantasy_pts": 298.6},
    {"name": "Tyreek Hill", "team": "MIA", "position": "WR", "rec_yds": 1689, "rec_td": 13, "fantasy_pts": 292.4},
    {"name": "Ja'Marr Chase", "team": "CIN", "position": "WR", "rec_yds": 1456, "rec_td": 10, "fantasy_pts": 275.8},
    {"name": "Amon-Ra St. Brown", "team": "DET", "position": "WR", "rec_yds": 1515, "rec_td": 11, "fantasy_pts": 268.2},
    {"name": "A.J. Brown", "team": "PHI", "position": "WR", "rec_yds": 1456, "rec_td": 9, "fantasy_pts": 254.6},
    {"name": "Mike Evans", "team": "TB", "position": "WR", "rec_yds": 1255, "rec_td": 13, "fantasy_pts": 251.5},
    {"name": "Stefon Diggs", "team": "BUF", "position": "WR", "rec_yds": 1183, "rec_td": 8, "fantasy_pts": 242.3},
    {"name": "Puka Nacua", "team": "LAR", "position": "WR", "rec_yds": 1486, "rec_td": 6, "fantasy_pts": 238.6},
    {"name": "Keenan Allen", "team": "LAC", "position": "WR", "rec_yds": 1243, "rec_td": 7, "fantasy_pts": 235.3},
    {"name": "Davante Adams", "team": "LV", "position": "WR", "rec_yds": 1144, "rec_td": 8, "fantasy_pts": 234.4},
    {"name": "Deebo Samuel", "team": "SF", "position": "WR", "rec_yds": 892, "rec_td": 7, "rush_yds": 225, "rush_td": 5, "fantasy_pts": 231.2},
    {"name": "DJ Moore", "team": "CHI", "position": "WR", "rec_yds": 1364, "rec_td": 8, "fantasy_pts": 244.4},
    
    # Tight Ends
    {"name": "Travis Kelce", "team": "KC", "position": "TE", "rec_yds": 984, "rec_td": 8, "fantasy_pts": 198.4},
    {"name": "Sam LaPorta", "team": "DET", "position": "TE", "rec_yds": 889, "rec_td": 10, "fantasy_pts": 186.2},
    {"name": "T.J. Hockenson", "team": "MIN", "position": "TE", "rec_yds": 812, "rec_td": 6, "fantasy_pts": 165.8},
    {"name": "Evan Engram", "team": "JAX", "position": "TE", "rec_yds": 963, "rec_td": 4, "fantasy_pts": 162.3},
    {"name": "George Kittle", "team": "SF", "position": "TE", "rec_yds": 1020, "rec_td": 6, "fantasy_pts": 168.0},
    {"name": "David Njoku", "team": "CLE", "position": "TE", "rec_yds": 882, "rec_td": 6, "fantasy_pts": 160.2},
    
    # Kickers
    {"name": "Harrison Butker", "team": "KC", "position": "K", "fg_made": 32, "xp_made": 52, "fantasy_pts": 168.0},
    {"name": "Justin Tucker", "team": "BAL", "position": "K", "fg_made": 31, "xp_made": 48, "fantasy_pts": 161.0},
    {"name": "Dustin Hopkins", "team": "CLE", "position": "K", "fg_made": 33, "xp_made": 35, "fantasy_pts": 164.0},
    {"name": "Brandon Aubrey", "team": "DAL", "position": "K", "fg_made": 36, "xp_made": 49, "fantasy_pts": 177.0},
    {"name": "Jake Elliott", "team": "PHI", "position": "K", "fg_made": 30, "xp_made": 51, "fantasy_pts": 161.0},
    
    # Defense
    {"name": "San Francisco 49ers", "team": "SF", "position": "DEF", "sacks": 48, "ints": 18, "fantasy_pts": 156.0},
    {"name": "Dallas Cowboys", "team": "DAL", "position": "DEF", "sacks": 52, "ints": 16, "fantasy_pts": 148.0},
    {"name": "Baltimore Ravens", "team": "BAL", "position": "DEF", "sacks": 60, "ints": 18, "fantasy_pts": 152.0},
    {"name": "Buffalo Bills", "team": "BUF", "position": "DEF", "sacks": 54, "ints": 17, "fantasy_pts": 145.0},
    {"name": "Kansas City Chiefs", "team": "KC", "position": "DEF", "sacks": 57, "ints": 16, "fantasy_pts": 143.0},
    {"name": "New York Jets", "team": "NYJ", "position": "DEF", "sacks": 48, "ints": 14, "fantasy_pts": 138.0},
]

