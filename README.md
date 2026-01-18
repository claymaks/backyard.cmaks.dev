# Backyard Games Tournament Generator

A web application for creating fair tournament schedules for backyard games where teams rotate through different games and play against different opponents each round.

## Features

- **Team Generation**: Automatically pairs players from two groups into teams
- **Manual Team Selection**: Option to pre-select specific team pairings
- **Smart Scheduling**: Creates a round-robin style schedule ensuring teams:
  - Play different games each round
  - Face different opponents across rounds
  - Minimize conflicts and ensure fair matchups

## How to Use

1. **Enter Players**: Add player names to Group A and Group B (must have equal numbers in each group)
2. **Pre-select Teams (Optional)**: Click on two player names to manually pair them as a team
3. **Set Number of Games**: Enter how many different games are available for the tournament
4. **Generate Schedule**: Submit to create the tournament bracket showing which teams play which games against which opponents in each round

## Technical Details

### Scheduling Algorithm

The application uses a greedy scheduling algorithm with backtracking:

1. Creates a pool of all team-game assignments that need to be scheduled
2. Shuffles the assignments randomly for variety
3. Assigns teams to rounds while enforcing constraints:
   - Teams can only play once per round
   - Teams should face different opponents each round
   - Teams should play each game at most once
4. Attempts to fix any unpaired teams through rematching

### Files

- `index.html` / `index.js` / `index.css` - Tournament creation form
- `bracket.html` / `bracket_generator.js` / `bracket.css` - Schedule display
- `manual_team_selector.css` - Styling for team selection UI

## Recent Improvements

- Updated UI labels to be gender-neutral (Player Group A/B)
- Added clear instructions and descriptions
- Fixed scheduling algorithm to reduce "no opponent scheduled" errors
- Improved validation with helpful error messages
- Enhanced bracket display with better styling
- Added navigation link back to tournament creation

## Known Limitations

- Requires equal numbers of players in both groups
- Works best with even numbers of teams
- Some scheduling conflicts may still occur with certain combinations of teams and games
