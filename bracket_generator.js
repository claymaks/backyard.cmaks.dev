function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function pair_name(name1, name2) {
    return name1 + " & " + name2;
}

function generate_teams_of_two(players, preassigned) {
    let team_list = preassigned;

    for (let i = 0; i < preassigned.length; i++) {
        let team = preassigned[i].split(" & ");
        players.splice(players.indexOf(team[0]), 1);
        players.splice(players.indexOf(team[1]), 1);
    }

    let shuffled_players = shuffle(players);
    for (let i = 0; i < shuffled_players.length; i+=2) {
        team_list.push(pair_name(shuffled_players[i], shuffled_players[i+1]));
    }

    return team_list;
}

const eqSet = (xs, ys) =>
    xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));

function Team(name) {
    return {
        name: name,
        rounds_participated: new Set(),
        opponents_played_against: new Set(),
        games_played: new Set(),
        my_games: {},
    };
}

function check_valid_pair(team, slot_num, slot, game) {
    if (team.rounds_participated.has(slot_num)) { return false; }
    if (slot.length === 1 && team.opponents_played_against.has(slot[0].name)) { return false; }
    if (slot.length === 1 && slot[0].name === team.name) { return false; }
    if (slot.length === 2) { return false; }

    team.rounds_participated.add(slot_num);
    if (slot.length > 0) {
        team.opponents_played_against.add(slot[0].name);
        slot[0].opponents_played_against.add(team.name);
    }
    team.games_played.add(game);

    team.my_games[slot_num] = {
        game: game,
        opponent: ""
    };
    return true;
}

function undo_place(team, game, slot_num) {
    team.rounds_participated.delete(slot_num);
    team.games_played.delete(game);
}

function make_schedule(teams, num_games) {
    let unscheduled = [];
    for (let j = 0; j < num_games; j++) {
        for (let team = 0; team < teams.length; team++) {
            unscheduled.push([teams[team], j]);
        }
    }

    unscheduled = shuffle(unscheduled);

    console.log(unscheduled);

    let schedule = {};
    for (let i = 0; i < num_games; i++) {
        schedule[i] = [];
        for (let k = 0; k < Math.floor(unscheduled.length/2); k++) {
            schedule[i].push([]);
        }
    }

    for (let i = 0; i < unscheduled.length; i++) {
        let team = unscheduled[i][0];
        let game = unscheduled[i][1];

        for (let k = 0; k < schedule[game].length; k++) {
            if (!check_valid_pair(team, k, schedule[game][k], game)) {
                continue;
            }
            if (schedule[game][k].length === 1) {
                team.my_games[k].opponent = schedule[game][k][0].name;
                schedule[game][k][0].my_games[k] = {
                    opponent: team.name,
                    game: game,
                };
            }
            schedule[game][k].push(team);
            break;
        }
    }

    console.log("HERE");

    console.log(schedule[0].length);

    // for (let repeat = 0; repeat < 10; repeat++) {
    //     for (let i = 0; i < num_games; i++) {
    //         for (let k = 0; k < schedule[i].length; k++) {
    //             if (schedule[i][k].length !== 1) { continue; }
    //
    //             let op = schedule[i][k].pop();
    //             undo_place(op, i, k);
    //
    //             for (let k2 = 0; k < schedule[i].length; k2++) {
    //                 if (k === k2) { continue; }
    //                 if (! check_valid_pair(op, k2, schedule[i][k2], i)) { continue; }
    //                 console.log("pushing back")
    //                 schedule[i][k2].push(op);
    //                 break;
    //             }
    //         }
    //     }
    // }

    return {
        schedule: schedule,
        teams: teams
    };
}

let test_string = "?player_names=Haley%0D%0AJaret%0D%0AClay%0D%0AAn%0D%0AAnna%0D%0AAlex&teammates=An+%26+Clay%0D%0AJaret+%26+Haley%0D%0A&num_games=2"
function main() {
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);

    let players = urlParams.get("player_names").split('\r\n').filter(n => n);
    let preassigned = urlParams.get("teammates").split('\r\n').filter(n => n);
    let num_games = parseInt(urlParams.get("num_games"));

    console.log("Players: " + players);
    console.log("Preassigned teammates: " + preassigned);
    console.log("Num_games: " + num_games);

    let raw_teams = generate_teams_of_two(players, preassigned);
    console.log("Teams: " + raw_teams);
    let teams = [];
    for (let i = 0; i < raw_teams.length; i++) {
        teams.push(Team(raw_teams[i]));
    }

    let schedule_and_teams = make_schedule(teams, num_games);
    let schedule = schedule_and_teams.schedule;
    let updated_teams = schedule_and_teams.teams;

    let table = document.getElementById("bracket");
    let thead = document.createElement("thead");
    let trh = document.createElement("tr");
    trh.appendChild(document.createElement("th"));
    for (let i = 0; i < schedule[0].length; i++) {
        let th = document.createElement("th");
        th.innerText = "Round " + (i + 1);
        trh.appendChild((th));
    }
    thead.appendChild(trh);
    table.appendChild(thead);

    let count = 0;

    let tbody = document.createElement("tbody");
    for (let i = 0; i < updated_teams.length; i++) {
        let trb = document.createElement("tr");
        let th = document.createElement("th");
        th.innerText = updated_teams[i].name;
        trb.appendChild(th);
        for (let k = 0; k < schedule[0].length; k++) {
            let td = document.createElement("td");
            if (updated_teams[i].my_games[k] !== undefined) {
                if (updated_teams[i].my_games[k].opponent) {
                    td.innerText = "Playing game " + (updated_teams[i].my_games[k].game + 1) + " against " + updated_teams[i].my_games[k].opponent;
                } else {
                    td.innerText = "Playing game " + (updated_teams[i].my_games[k].game + 1) + ", but no opponent scheduled!";
                    count += 1;
                    td.className += "red-highlight";
                }
            }
            trb.appendChild(td);
        }
        tbody.appendChild(trb);
    }
    table.appendChild(tbody);
    console.log(count);

    for (let i = 0; i < schedule.length; i++) {

    }

    return schedule
}

let schedule = main();
console.log(schedule);