function onKeyDown(e) {
	if(e.keyCode >= 37 && e.keyCode <= 40)
		BS.vars.user.direction = e.keyCode;
}

window.onkeydown = onKeyDown;