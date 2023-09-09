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

// Find num_games links. A valid link is defined as a pair of indices (a, b)
// where
// : a < b
// : (b - a) != (a + len(teams) - b)
// : b - a is unique among all links
//
// Once num_games links are found, we can cycle these links through the teams
// array until every team has seen all of the links.
function generate_links(num_games, num_teams) {
    let links = [];
    let invalid_links = new Set();
    let invalid_distance = new Set();
    for (let i = 0; i < Math.min(num_games, Math.floor(num_teams / 2)); i++) {
        let satisfied = false;
        while (!satisfied) {
            // Start by picking 2 random indices. Sorting them will make sure a < b.
            let shuffled_indices = shuffle([...Array(num_teams).keys()]);
            let pair = shuffled_indices.slice(0,2).sort();
            let a = pair[0];
            let b = pair[1];

            // Check to see if we've marked this as an invalid link.
            let ab = new Set([a, b]);
            let carry_on = false;
            for (let k = 0; k < invalid_links.size; k++) {
                if (eqSet(ab, invalid_links[k])) {
                    carry_on = true;
                    break
                }
            }
            if (carry_on) { continue; }

            // Check to see if we already have a link with this distance.
            if (invalid_distance.has(b - a)) { continue; }

            // Check to see if our distance invariant holds true.
            if ((b - a) === (a + num_teams - b)) { continue; }

            // All conditions met! We have a link.
            links.push([a, b]);
            invalid_links.add(new Set([a, b]));
            invalid_distance.add(b - a);
            satisfied = true;

            console.log("Link added: " + a + " " + b);
            console.log("Number of invalid links: " + invalid_links.size);
            console.log("\t" + invalid_links);
            console.log("Number of invalid distances: " + invalid_distance.size);
            console.log("\t" + invalid_distance);
        }
    }
    return links;
}

function cycle_teams(teams, links) {
    let rounds = [];
    let m = teams.length;
    for (let offset = 0; offset < m; offset++) {
        rounds.push([]);

        for (let l = 0; l < links.length; l++) {
            rounds[rounds.length-1].push([
                teams[(links[l][0] + offset) % m],
                teams[(links[l][1] + offset) % m]
            ])
        }
    }
    return rounds;
}

let test_string = "?player_names=Haley%0D%0AJaret%0D%0AClay%0D%0AAn%0D%0AAnna%0D%0AAlex&teammates=An+%26+Clay%0D%0AJaret+%26+Haley%0D%0A&num_games=10"
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

    let teams = generate_teams_of_two(players, preassigned);
    console.log("Teams: " + teams);

    let links = generate_links(num_games, teams.length);
    console.log("Links: " + links);

    let rounds = cycle_teams(teams, links);
    console.log(rounds);
}

main();