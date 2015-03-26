// Main stuff

var canvas = document.querySelector('#mySketch');
var context = canvas.getContext('2d');
// need to make these dynamic
canvas.width = 800;
canvas.height = 600;


/* MOUSE INTERACTION */
var mouse = { x:0, y:0 };

canvas.addEventListener('moveMouse', function(e) {
	mouse.x = e.pageX - this.offsetLeft;
	mouse.y = e.pageY - this.offsetTop;
}, false);


/* DRAWING */

