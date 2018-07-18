let playerPos = '#0x0';
let lastPlayerPos = '#0x0';

function loadGame(gameUrl) {
    $.ajax({
        url: gameUrl,
        success: function(result) {
            let title = result.team.name;

            // Set the title values
            if (result.botId !== '') {
                $('#view-title').html(result.team.name + ' [ ' + getBotNameById(result.team, result.botId) + ' ] in ' + result.maze.seed);
            } else {
                $('#view-title').html(result.team.name + ' in ' + result.maze.seed);
            }

            // render the maze
            renderMaze(result);

            // set player location
            setPlayerPosition(result.player.location.row, result.player.location.col);
        }
    });
}

// Player Location
function setPlayerPosition(row, col) {
    // note the current position
    lastPlayerPos = playerPos.toString();

    // set the next position
    playerPos = '#' + row + 'x' + col;

    // and update the html
    $(lastPlayerPos).html('');
    $(playerPos).html('@');
}

// return the name of the bot with the id
function getBotNameById(team, botId) {
    let bots = team.bots;
    for (let x = 0; x < bots.length; x++) {
        if (bots[x].id == botId) return bots[x].name;
    }
    return 'Mystery Bot';
}

// render the maze initially
function renderMaze(curGame) {
    let cells = curGame.maze.cells;
    let maze_width = cells[0].length * 50;
    let parent_width = parseInt($('#maze-container').css('width'));

    let cTxt = '';

    // Create new maze container and insert into vpGame
    $('#maze-container').html('');

    for (row = 0; row < cells.length; row++) {
        // create new row
        let div_row = document.createElement('div');
        div_row.setAttribute('class', 'maze-row');
        $('#maze-container').append(div_row);
        div_row.style.width = maze_width + 'px';

        for (col = 0; col < cells[0].length; col++) {
            let cId = row + 'x' + col;
            var temp = document.createElement('span');

            temp.setAttribute('id', cId);
            temp.setAttribute('class', 'maze-cell');
            div_row.appendChild(temp);

            let cell = cells[row][col];

            let cDiv = $('#' + row + 'x' + col);

            if (!(cell.exits & 1)) cDiv.css('border-top', '2px solid #507091');
            if (!(cell.exits & 2)) cDiv.css('border-bottom', '2px solid #507091');
            if (!(cell.exits & 4)) cDiv.css('border-right', '2px solid #507091');
            if (!(cell.exits & 8)) cDiv.css('border-left', '2px solid #507091');

            if (!!(cell.tags & 4)) {
                cDiv.addClass('path');
                cDiv.attr('title', 'This room is on the shortest path through the maze.');
            }
            if (!!(cell.tags & 16)) {
                cDiv.addClass('lava');
                cDiv.attr('title', 'This room is filled with LAVA!');
            }
            if (!!(cell.tags & 32)) {
                cDiv.addClass('trap-pit');
                cDiv.attr('title', 'There is a pit in this room.');
            }
            if (!!(cell.tags & 64)) {
                cDiv.addClass('trap-bear');
                cDiv.attr('title', 'There is a bear trap in this room.');
            }
            if (!!(cell.tags & 256)) {
                cDiv.addClass('trap-flame');
                cDiv.attr('title', 'There is a fire trap in this room.');
            }

            if (!!(cell.tags & 1)) {
                cDiv.addClass('start');
                cDiv.attr('title', 'Maze Entrance (north)');
            }
            if (!!(cell.tags & 2)) {
                cDiv.addClass('finish');
                cDiv.attr('title', 'Maze Exit (south)');
            }
        }
    }

    try {
        resizeContainer();
    } catch (err) {
        console.log('Error in render() during initial maze sizing: ' + err.message);
    }
}

// resize maze in response to changes in window size
window.addEventListener('resize', () => {
    resizeContainer();
});

function resizeContainer() {
    // Width of parent container of maze_container
    let zoom_value = '100%';
    let rows = $('.maze-row').length;
    let cols = $('.maze-row')[0].children.length;
    let multiplier = 500;

    let maze_width = cols * $('#maze-parent').width();
    let maze_height = rows * $('#maze-parent').height();

    let parent_height = $('#maze-parent').height();
    let parent_width = $('#maze-parent').width();

    let zoomW = ((parent_width / maze_width) * multiplier).toFixed(6).toString() + '%';
    let zoomH = ((parent_height / maze_height) * multiplier).toFixed(6).toString() + '%';

    if (maze_height > maze_width) {
        zoom_value = ((parent_width / maze_width) * multiplier).toFixed(6).toString() + '%';
    } else {
        zoom_value = ((parent_height / maze_height) * multiplier).toFixed(6).toString() + '%';
    }

    $('#maze-container').css('zoom', zoom_value);

    console.log('Zoom: %s', zoom_value);
} // end resizeContainer
