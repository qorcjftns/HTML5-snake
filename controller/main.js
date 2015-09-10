
// Declare BS object
var BS = BS || {};

// Declare config namespace
BS.config = {
	boardSizeX: 50,
	boardSizeY: 50,
	boardSize: 100,
	fps: 30,
}

// Declare utils namespace
BS.utils = {
	windowLoad: function() {
		BS.vars.c = document.getElementById("mainCanvas");
		BS.vars.c.width = BS.vars.c.offsetWidth;
		BS.vars.c.height = BS.vars.c.offsetHeight;
		// Responsive canvas size
		BS.utils.setCanvasSize();
		BS.utils.refreshView();
		BS.utils.initBoard();
		BS.utils.introAnimationPanel();
	},
	setCanvasSize: function() {
		// get smaller dimension.
		var wWidth = window.innerWidth * 0.9
		var wHeight = window.innerHeight * 0.9
		var smdim = wWidth < wHeight ? wWidth : wHeight;
		BS.config.boardSize = smdim / BS.config.boardSizeX;
		BS.vars.c.width = smdim;
		BS.vars.c.height = smdim;
		BS.vars.c.style.width = smdim + "px";
		BS.vars.c.style.height = smdim + "px";
		for (var i = 0; i < BS.vars.panels.length; i++) {
			for (var j = 0; j < BS.vars.panels[i].length; j++) {
				BS.vars.panels[i][j].size = BS.config.boardSize;
			}
		}
	},
	initBoard: function() {
		for(i = 0 ; i < BS.config.boardSizeX ; i++) {
			for(j = 0 ; j < BS.config.boardSizeY ; j++) {
				var panel = new BS.panel(i,j,BS.config.boardSize, "#FFFFFF");
				if(!BS.vars.panels[i]) BS.vars.panels[i] = [];
				BS.vars.panels[i][j] = panel;
			}
		}
	},
	drawLoop: function() {
		setInterval(BS.utils.refreshView);
	},
	refreshView: function() {
		// Draw Panels in board
		console.log("refreshing...");
		BS.utils.setCanvasSize();
		for (var i = 0; i < BS.config.boardSizeX; i++) {
			for (var j = 0; j < BS.config.boardSizeY; j++) {
				BS.utils.drawPanel(i,j);
			}
		}
		// scoreboard
		var canvasElem = document.getElementById("mainCanvas");
		var y = canvasElem.getBoundingClientRect().top
		var x = canvasElem.getBoundingClientRect().right
		document.getElementById("score").style.left = (x + 20) + "px";
		document.getElementById("score").style.top = y + "px";
		document.getElementById("scorePanel").innerHTML = BS.vars.score;
	},
	drawPanel: function(x,y) {
		try {
			var x = BS.vars.panels[x][y].x;
			var y = BS.vars.panels[x][y].y;
			var size = BS.vars.panels[x][y].size;
			var ctx = BS.vars.c.getContext("2d");

			ctx.fillStyle = BS.vars.panels[x][y].color;
			ctx.fillRect(size * x, size * y, size, size);
		} catch(e) {
			console.log("ERROR: " + x + "," + y);
		}
	},
	introAnimationPanel: function() {
		var i = 0;
		function changeColorDiagonal(i,color) {
			if(i < BS.config.boardSizeX) {
				for(j = i ; j >= 0 ; j--) {
					BS.vars.panels[j][i-j].color = color;
					BS.utils.drawPanel(j, i-j);
				}
			} else {
				k = i - BS.config.boardSizeX + 1;
				for(j = i-k  ; j >= k ; j--) {
					BS.vars.panels[j][i-j].color = color;
					BS.utils.drawPanel(j, i-j);
				}
			}
		}
		function updatePanels() {
			if(0 <= i && i < BS.config.boardSizeX*2) {
				changeColorDiagonal(i, "#FFF");
			}
			if(0 <= i-1 && i-1 < BS.config.boardSizeX*2) {
				changeColorDiagonal(i-1, "#DDD");
			}
			if(0 <= i-2 && i-2 < BS.config.boardSizeX*2) {
				changeColorDiagonal(i-2, "#AAA");
			}
			if(0 <= i-3 && i-3 < BS.config.boardSizeX*2) {
				changeColorDiagonal(i-3, "#888");
			}
			if(0 <= i-4 && i-4 < BS.config.boardSizeX*2) {
				changeColorDiagonal(i-4, "#444");
			}
			if(0 <= i-5 && i-5 < BS.config.boardSizeX*2) {
				changeColorDiagonal(i-5, "#000");
			}
			i = i + 1;
			if(i < BS.config.boardSizeX * 2 + 6) {
				setTimeout(function() {
					window.requestAnimationFrame(updatePanels);
				}, 1000/BS.config.fps)
			} else {
				BS.game.start();
			}
		}
		window.requestAnimationFrame(updatePanels);
	},
}

BS.game = {
	start: function() {
		// starting point
		var x = parseInt(BS.config.boardSizeX / 2);
		var y = parseInt(BS.config.boardSizeY / 2);
		var original = BS.vars.panels[x][y].color;
		BS.vars.panels[x][y].color = "#FFF";
		BS.utils.drawPanel(x,y);
		BS.game.blink(x, y, 1, 500, original);
	},
	blink: function(x, y, n, interval, original) {
		var i = 0;
		function action() {
			if(i % 2 == 0) {
				BS.vars.panels[x][y].color = "#FFF";
				BS.utils.drawPanel(x,y);
			} else {
				BS.vars.panels[x][y].color = original;
				BS.utils.drawPanel(x,y);
			}
			i++;
			if(i <= n*2) {
				setTimeout(function() {
					window.requestAnimationFrame(action);
				}, interval)
			} else {
				BS.vars.user = new BS.user(x,y);
				BS.vars.user.start();
				BS.game.processFires();
				BS.vars.fireCreateInterval = setInterval(function() {
					var newFire = new BS.fire();
					console.log("new fire at: " + newFire.x + "," + newFire.y + " with direction: " +  + newFire.direction)
					BS.vars.fires.push(newFire);
					BS.game.addScore(10);
				},  200);
			}
		}
		window.requestAnimationFrame(action);
	},
	processFires: function() {
		BS.vars.fireInterval = setInterval(function() {
			action();
		}, 1 * (1000 / BS.config.fps));
		function action() {
			for (var i = 0; i < BS.vars.fires.length;) {
				BS.vars.panels[BS.vars.fires[i].x][BS.vars.fires[i].y].color = "#000";
				BS.utils.drawPanel(BS.vars.fires[i].x,BS.vars.fires[i].y);

				if(BS.vars.fires[i].direction == 37) BS.vars.fires[i].x = (BS.vars.fires[i].x - 1 < 0) ? -1 : BS.vars.fires[i].x - 1; // left
				if(BS.vars.fires[i].direction == 38) BS.vars.fires[i].y = (BS.vars.fires[i].y - 1 < 0) ? -1 : BS.vars.fires[i].y - 1; // up
				if(BS.vars.fires[i].direction == 39) BS.vars.fires[i].x = (BS.vars.fires[i].x + 1 > BS.config.boardSizeX-1) ? BS.config.boardSizeX : BS.vars.fires[i].x + 1; // right
				if(BS.vars.fires[i].direction == 40) BS.vars.fires[i].y = (BS.vars.fires[i].y + 1 > BS.config.boardSizeY-1) ? BS.config.boardSizeY : BS.vars.fires[i].y + 1; // down
				
				// check if it is out of box
				if(BS.vars.fires[i].direction == 37 && BS.vars.fires[i].x == -1 ||
					BS.vars.fires[i].direction == 38 && BS.vars.fires[i].y == -1 ||
					BS.vars.fires[i].direction == 39 && BS.vars.fires[i].x == BS.config.boardSizeX ||
					BS.vars.fires[i].direction == 40 && BS.vars.fires[i].y == BS.config.boardSizeY) {
					BS.vars.fires.splice(i,1);
				} else {
					BS.vars.panels[BS.vars.fires[i].x][BS.vars.fires[i].y].color = "#FF0000";
					BS.utils.drawPanel(BS.vars.fires[i].x,BS.vars.fires[i].y);
					i++;
				}
			};
		}
	}, 
	over: function() {
		clearInterval(BS.vars.user.interval);
		clearInterval(BS.vars.fireInterval);
		clearInterval(BS.vars.fireCreateInterval);
		BS.game.overAction(BS.vars.user.posX,BS.vars.user.posY);
	},
	overAction: function(x,y) {
		var i = 0;
		function updatePanels() {
			
		}
		window.requestAnimationFrame(updatePanels);
	},
	addScore: function(n) {
		BS.vars.score += n;
		document.getElementById("scorePanel").innerHTML = BS.vars.score;
	}
}


BS.vars = {
	panels: [],
	user: undefined,
	fires: [],
	score: 0,
}

// Declare classes
BS.panel = function(x, y, size, color) {
	this.x = x;
	this.y = y;
	this.size = size;
	this.color = color;
}

BS.user = function(x,y) {
	this.direction = 1;
	this.length = 5;
	this.posX = x;
	this.posY = y;
	this.points = [[x,y]];
	this.start = function() {
		BS.vars.user.interval = setInterval(function() {
			BS.vars.user.action();
		}, 1 * (1000 / BS.config.fps));
	}
	this.action = function() {
		if(this.direction == 37) this.posX = (this.posX - 1 < 0) ? 0 : this.posX - 1; // left
		if(this.direction == 38) this.posY = (this.posY - 1 < 0) ? 0 : this.posY - 1; // up
		if(this.direction == 39) this.posX = (this.posX + 1 > BS.config.boardSizeX-1) ? BS.config.boardSizeX-1 : this.posX + 1; // right
		if(this.direction == 40) this.posY = (this.posY + 1 > BS.config.boardSizeY-1) ? BS.config.boardSizeY-1 : this.posY + 1; // down
		var newpoint = [this.posX, this.posY];
		BS.vars.user.points.push(newpoint);

		if(BS.vars.user.points.length > BS.vars.user.length) {
			BS.vars.user.points.reverse();
			var removed = BS.vars.user.points.pop();
			BS.vars.user.points.reverse();

			BS.vars.panels[removed[0]][removed[1]].color = "#000";
			BS.utils.drawPanel(removed[0], removed[1]);
		}

		// Check collision with fires
		for(i = 0 ; i < BS.vars.fires.length ; i++) { // for each fires
			for(j = 0 ; j < BS.vars.user.points.length ; j++) { // for each points
				if(BS.vars.fires[i].x == BS.vars.user.points[j][0] &&
					BS.vars.fires[i].y == BS.vars.user.points[j][1]) {
					BS.game.over();
				}
			}
		}

		BS.vars.panels[this.posX][this.posY].color = "#FFF";
		BS.utils.drawPanel(this.posX,this.posY);
	}
}

BS.fire = function() {
	// First, decide the direction of fire.
	this.direction = Math.floor(Math.random() * 4) + 37;
	if(this.direction == 37 || this.direction == 39) {
		this.y = Math.floor(Math.random() * BS.config.boardSizeY);
		if(this.direction == 37) {
			this.x = BS.config.boardSizeY - 1;
		} else if(this.direction == 39) {
			this.x = 0;
		}
	} else if(this.direction == 38 || this.direction == 40) {
		this.x = Math.floor(Math.random() * BS.config.boardSizeX);
		if(this.direction == 38) {
			this.y = BS.config.boardSizeX - 1;
		} else if(this.direction == 40) {
			this.y = 0;
		}
	}
}

// Attach Event
window.onload = BS.utils.windowLoad;
window.onresize = BS.utils.refreshView;