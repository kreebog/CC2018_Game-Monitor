function loadGame(gameUrl) {
    $.ajax({
        url: gameUrl,
        success: function(result) {
            console.log('Fetching game data...');
            let title = result.team.name;

            if (result.botId === '') {
                $('#view-title').html(result.team.name + ' [ Bot: ' + getBotNameById(result.botId) + '] in ' + result.maze.seed);
            } else {
                $('#view-title').html(result.team.name + ' in ' + result.maze.seed);
            }
            let render = '<pre>' + result.maze.textRender + '</pre>';

            $('#data').html(render);
        }
    });
}

function getBotNameById(team, botId) {
    let bots = team.bots;
    for (let x = 0; x < bots.length; x++) {
        if (bots[x].id == botId) return bots[x].name;
    }

    return 'Mystery Bot';
}
