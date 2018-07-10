
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
    	// zoom to fit if maze is too large
    	if (maze_width > parent_width) {
    		// zooms to fit 97% the width of parent container, 
    		// keeping aspect ratio 
    		let zoom_value = ((parent_width / maze_width)*97).toFixed(3).toString() + "%";
    		maze_container.style.zoom = zoom_value;
    	}
    	else {
    		maze_container.style.zoom = "100%";
    	}
    }; // end resizeContainer
};
//# sourceMappingURL=resize.js.map