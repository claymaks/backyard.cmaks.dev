// ----------------------------------------------------------------------------
// Form manager.
// ----------------------------------------------------------------------------

let ON_TAB_LOAD = {
    1: function() { load_players(); },
    2: function() { sync_teammates(); }
}

let currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
    // This function will display the specified tab of the form...
    var x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    //... and fix the Previous/Next buttons:
    if (n === 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
    }
    if (n === (x.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Submit";
    } else {
        document.getElementById("nextBtn").innerHTML = "Next";
    }
    //... and run a function that will display the correct step indicator:
    fixStepIndicator(n)
    if (ON_TAB_LOAD[n] !== undefined) { ON_TAB_LOAD[n]() }
}

function nextPrev(n) {
    // This function will figure out which tab to display
    var x = document.getElementsByClassName("tab");
    // Exit the function if any field in the current tab is invalid:
    if (n === 1 && !validateForm()) return false;
    // Hide the current tab:
    x[currentTab].style.display = "none";
    // Increase or decrease the current tab by 1:
    currentTab = currentTab + n;
    // if you have reached the end of the form...
    if (currentTab >= x.length) {
        // ... the form gets submitted:
        document.getElementById("regForm").submit();
        return false;
    }
    // Otherwise, display the correct tab:
    showTab(currentTab);
}

function validateForm() {
    // This function deals with validation of the form fields
    let x, y, i, valid = true;
    x = document.getElementsByClassName("tab");
    y = x[currentTab].getElementsByTagName("input");

    let boys = document.getElementById("player_boys").value.split('\n').filter(n => n).length;
    let girls = document.getElementById("player_girls").value.split('\n').filter(n => n).length;

    // Check if we're on the first tab (player input)
    if (currentTab === 0) {
        if (boys !== girls) {
            valid = false;
            document.getElementById("player_boys").className = "invalid";
            document.getElementById("player_girls").className = "invalid";
            alert("Please enter the same number of players in both groups. Group A has " + boys + " players, Group B has " + girls + " players.");
        } else if (boys < 2) {
            valid = false;
            document.getElementById("player_boys").className = "invalid";
            document.getElementById("player_girls").className = "invalid";
            alert("Please enter at least 2 players in each group to create teams.");
        } else {
            document.getElementById("player_boys").className = "";
            document.getElementById("player_girls").className = "";
        }
    }
    
    // A loop that checks every input field in the current tab:
    for (i = 0; i < y.length; i++) {
        // If a field is empty...
        if (y[i].value === "") {
            // add an "invalid" class to the field:
            y[i].className += " invalid";
            // and set the current valid status to false
            valid = false;
        }
    }
    // If the valid status is true, mark the step as finished and valid:
    if (valid) {
        document.getElementsByClassName("step")[currentTab].className += " finish";
    }
    return valid; // return the valid status
}

function fixStepIndicator(n) {
    // This function removes the "active" class of all steps...
    let i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    //... and adds the "active" class on the current step:
    x[n].className += " active";
}

// ----------------------------------------------------------------------------
// Manual team selection
// ----------------------------------------------------------------------------
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (
            c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
    );
}

function pair_name(pair) {
    return pair.pair1.name + " & " + pair.pair2.name;
}

let players = [];
let player_from_uuid = {};

let pairs = [];
let pair_from_uuid = {};

let select_pairs_element = document.getElementById("pairs");
let pillbox = document.getElementById("pillbox");
let selected_tile = null;
function load_players() {
    let all_player_names = document.getElementById("player_boys").value.split('\n').filter(n => n).concat(document.getElementById("player_girls").value.split('\n').filter(n => n));
    for (let i = 0; i < all_player_names.length; i++) {
        // Skip names that already exist.
        if (players.findIndex(player => {
            return player.name === all_player_names[i];
        }) !== -1) { continue; }

        players.push({
            name: all_player_names[i],
            hidden: false,
            uuid: uuidv4()
        });
        player_from_uuid[players[players.length-1].uuid] = players[players.length-1];
    }

    // Remove players that were removed from the list.
    for (let i = 0; i < players.length; i++) {
        // Skip names that match.
        if (all_player_names.findIndex(player_name => {
            return player_name === players[i].name;
        }) !== -1) { continue; }

        // Unlink pair if it exists.
        if (players[i].pair_uuid && players[i].pair_uuid !== 0) {
            let pair = pair_from_uuid[players[i].pair_uuid];

            pair.hidden = true;
            pair.pair1.hidden = false;
            pair.pair1.pair_uuid = 0;
            pair.pair2.hidden = false;
            pair.pair2.pair_uuid = 0;
        }


        // Just clear and hide players that should be removed.
        players[i].name = "";
        players[i].hidden = true;
    }

    selected_tile = null
    select_pairs(players);
    populate_pills(pairs);
}

function sync_teammates() {
    let input_field = document.getElementById("teammates");
    input_field.value = "";
    for (let i = 0; i < pairs.length; i++) {
        if (pairs[i].hidden) { continue; }

        input_field.value += pair_name(pairs[i]) + "\n";
    }
}

function onTileClick(event) {
    var tile = event.target;
    if (selected_tile === null) {
        selected_tile = tile;
        tile.style.background = "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)";
        tile.querySelector('p').style.color = "#ffffff";
    } else if (selected_tile === tile) {
        selected_tile = null;
        tile.style.background = "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)";
        tile.querySelector('p').style.color = "#1e293b";
    } else {
        var pair1 = player_from_uuid[tile.dataset.uuid];
        var pair2 = player_from_uuid[selected_tile.dataset.uuid];

        console.log("Pair created! " + pair1.name + " & " + pair2.name);

        let pair_uuid = uuidv4();

        pair1.hidden = true;
        pair1.pair_uuid = pair_uuid;
        pair2.hidden = true;
        pair2.pair_uuid = pair_uuid;


        var pair = {
            pair1: pair1,
            pair2: pair2,
            pair_uuid: pair_uuid,
            hidden: false
        };

        pairs.unshift(pair);
        pair_from_uuid[pair_uuid] = pair;

        selected_tile = null;

        select_pairs(players);
        populate_pills(pairs);
    }
}

function onPillClick(event) {
    var pill = event.target;
    var pair = pair_from_uuid[pill.dataset.uuid];
    if (
        !window.confirm(
            "Are you sure you want to break up the team " + pair_name(pair) + "?"
        )
    ) {
        return;
    }

    pair.hidden = true;
    pair.pair1.hidden = false;
    pair.pair1.pair_uuid = 0;
    pair.pair2.hidden = false;
    pair.pair2.pair_uuid = 0;

    select_pairs(players);
    populate_pills(pairs);
}

function select_pairs(players) {
    select_pairs_element.innerHTML = "";

    for (var i = 0; i < players.length; i++) {
        if (players[i].hidden) {
            continue;
        }
        var tile = document.createElement("div");
        tile.dataset.uuid = players[i].uuid;
        tile.classList.add("tile");
        var p = document.createElement("p");
        p.dataset.uuid = players[i].uuid;
        p.innerText = players[i].name;
        tile.appendChild(p);
        tile.addEventListener("click", onTileClick);
        select_pairs_element.appendChild(tile);
    }
}

function populate_pills(pairs) {
    pillbox.innerHTML = "";
    for (var i = 0; i < pairs.length; i++) {
        if (pairs[i].hidden) {
            continue;
        }
        var pill = document.createElement("div");
        pill.dataset.uuid = pairs[i].pair_uuid;
        pill.classList.add("pill");
        var p = document.createElement("p");
        p.dataset.uuid = pairs[i].pair_uuid;
        p.innerText = pair_name(pairs[i]);
        pill.appendChild(p);
        pill.addEventListener("click", onPillClick);
        pillbox.appendChild(pill);
    }
}

// ----------------------------------------------------------------------------
// Previous Tournaments
// ----------------------------------------------------------------------------

function loadPreviousTournaments() {
    try {
        let tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
        let listDiv = document.getElementById('tournaments-list');
        
        if (tournaments.length === 0) {
            listDiv.innerHTML = '<p style="text-align: center; color: #666;">No previous tournaments yet. Create your first tournament above!</p>';
            return;
        }
        
        listDiv.innerHTML = '';
        
        for (let i = 0; i < tournaments.length; i++) {
            let tournament = tournaments[i];
            let tournamentDiv = document.createElement('div');
            tournamentDiv.style.cssText = 'background-color: white; padding: 20px; margin: 12px 0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s ease;';
            tournamentDiv.onmouseenter = function() {
                this.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
                this.style.transform = 'translateY(-2px)';
            };
            tournamentDiv.onmouseleave = function() {
                this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                this.style.transform = 'translateY(0)';
            };
            
            let date = new Date(tournament.date);
            let dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            let contentDiv = document.createElement('div');
            contentDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;';
            
            let infoDiv = document.createElement('div');
            infoDiv.innerHTML = `
                <strong style="color: #1a1a1a; font-size: 1.05em;">Tournament from ${dateStr}</strong><br>
                <span style="color: #64748b; font-size: 0.9em;">
                    ${tournament.teams.length} teams, ${tournament.num_games} games
                </span>
            `;
            
            let buttonsDiv = document.createElement('div');
            buttonsDiv.style.cssText = 'display: flex; gap: 10px;';
            
            let viewBtn = document.createElement('button');
            viewBtn.textContent = 'View';
            viewBtn.style.cssText = 'padding: 10px 20px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);';
            viewBtn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
            });
            viewBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
            });
            viewBtn.addEventListener('click', () => viewTournament(i));
            
            let deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.style.cssText = 'padding: 10px 20px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);';
            deleteBtn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            });
            deleteBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
            });
            deleteBtn.addEventListener('click', () => deleteTournament(i));
            
            buttonsDiv.appendChild(viewBtn);
            buttonsDiv.appendChild(deleteBtn);
            
            contentDiv.appendChild(infoDiv);
            contentDiv.appendChild(buttonsDiv);
            tournamentDiv.appendChild(contentDiv);
            
            listDiv.appendChild(tournamentDiv);
        }
    } catch (e) {
        console.error('Failed to load tournaments:', e);
        document.getElementById('tournaments-list').innerHTML = '<p style="text-align: center; color: #dc3545;">Error loading previous tournaments.</p>';
    }
}

function viewTournament(index) {
    try {
        let tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
        let tournament = tournaments[index];
        
        // Build the URL with query parameters
        let params = new URLSearchParams();
        params.append('player_girls', tournament.player_girls.join('\n'));
        params.append('player_boys', tournament.player_boys.join('\n'));
        params.append('teammates', tournament.preassigned.join('\n'));
        params.append('num_games', tournament.num_games);
        
        window.location.href = 'bracket.html?' + params.toString();
    } catch (e) {
        console.error('Failed to view tournament:', e);
        alert('Error loading tournament');
    }
}

function deleteTournament(index) {
    if (!confirm('Are you sure you want to delete this tournament?')) {
        return;
    }
    
    try {
        let tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
        tournaments.splice(index, 1);
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
        loadPreviousTournaments();
    } catch (e) {
        console.error('Failed to delete tournament:', e);
        alert('Error deleting tournament');
    }
}

// Load previous tournaments when page loads
window.addEventListener('DOMContentLoaded', function() {
    loadPreviousTournaments();
});
