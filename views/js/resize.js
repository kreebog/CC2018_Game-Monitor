window.onload = function() {
    window.addEventListener('resize', () => {
        try {
            var maze_row = document.querySelector('.maze_row');
            var cols = maze_row.childElementCount;

            var cell = document.querySelector('.maze_cell');
            var cell_width = parseInt(window.getComputedStyle(cell, null).getPropertyValue('width'), 10);

            maze_width = cols * cell_width;

            resizeContainer(maze_width);
        } catch (err) {
            console.log('Error in window.resize() event handler: ' + err.message);
        }
    });

    function resizeContainer(maze_width) {
        // Width of parent container of maze_container
        let parent_width = parseInt(getComputedStyle(document.getElementById('main'), null).getPropertyValue('width'), 10);

        let zoom_value;
        if (maze_width > parent_width) {
            zoom_value = ((parent_width / maze_width) * 90).toFixed(6).toString() + '%';
        } else {
            zoom_value = '100%';
        }
        document.getElementById('maze_container').style.zoom = zoom_value;
    } // end resizeContainer
};
//# sourceMappingURL=resize.js.map
