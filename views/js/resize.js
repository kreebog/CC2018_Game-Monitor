
window.onload = function () {
	

	
    window.addEventListener("resize", () => {
        var maze_row = document.querySelector(".maze_row");
        var cols = maze_row.childElementCount;
        
        var cell = document.querySelector(".maze_cell");
        var cell_width = parseInt(window.getComputedStyle(cell, null).getPropertyValue("width"), 10);
        
        maze_width = cols * cell_width;
        resizeContainer(maze_width);
    });

    function resizeContainer(maze_width) {
    	// Width of parent container of maze_container
		let parent_width = parseInt(getComputedStyle(document.getElementById("main"), null).getPropertyValue("width"), 10);
		let zoom_value = ((parent_width / maze_width)*90).toFixed(6).toString() + "%";
		document.getElementById('maze_container').style.zoom = zoom_value;
	
	
	}; // end resizeContainer
	
};
//# sourceMappingURL=resize.js.map