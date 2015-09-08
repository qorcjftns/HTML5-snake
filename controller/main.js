
// Declare BS object
var BS = BS || {};

// Declare config namespace
BS.config = {
	boardSizeX: 25,
	boardSizeY: 25,
	boardSize: 100,
	fps: 30,
}

// Declare utils namespace
BS.utils = {
	windowLoad: function() {
		BS.vars.c = document.getElementById("mainCanvas");
		BS.vars.c.width = BS.vars.c.offsetWidth;
		BS.vars.c.height = BS.vars.c.offsetHeight;
		// get smaller dimension.
		var smdim = BS.vars.c.width < BS.vars.c.height ? BS.vars.c.width : BS.vars.c.height;
		BS.config.boardSize = smdim / 25;
		BS.vars.c.width = smdim;
		BS.vars.c.height = smdim;
		BS.vars.c.style.width = smdim + "px";
		BS.vars.c.style.height = smdim + "px";

		BS.utils.initBoard();
		BS.utils.drawLoop();
	},
	initBoard: function() {
		for(i = 0 ; i < BS.config.boardSizeX ; i++) {
			for(j = 0 ; j < BS.config.boardSizeY ; j++) {
				var panel = new BS.panel(i,j,BS.config.boardSize);
				BS.vars.panels[BS.vars.panels.length] = panel;
			}
		}
	},
	drawLoop: function() {
		// Draw Panels in board
		setInterval(function() {
			for (var i = 0; i < BS.vars.panels.length; i++) {
				var x = BS.vars.panels[i].x;
				var y = BS.vars.panels[i].y;
				var size = BS.vars.panels[i].size;
				var ctx = BS.vars.c.getContext("2d");

				ctx.fillStyle = "#000000";
				ctx.fillRect(size * x, size * y, size * (x+1), size * (y+1));

				ctx.strokeStyle = "#FFFFFF";
				ctx.moveTo(size*x, size*y);
				ctx.lineTo(size*(x+1), size*y);
				ctx.stroke();
				ctx.moveTo(size*x, size*y);
				ctx.lineTo(size*x, size*(y+1));
				ctx.stroke();
				ctx.moveTo(size*(x+1), size*y);
				ctx.lineTo(size*(x+1), size*(y+1));
				ctx.stroke();
				ctx.moveTo(size*x, size*(y+1));
				ctx.lineTo(size*(x+1), size*(y+1));
				ctx.stroke();
			}
		}, 1000/BS.config.fps);
	}
}
BS.vars = {
	panels: []
}

// Declare classes
BS.panel = function(x, y, size, color) {
	this.x = x;
	this.y = y;
	this.size = size;
	this.color = color;
}

// Attach Event
window.onload = BS.utils.windowLoad;