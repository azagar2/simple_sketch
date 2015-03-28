var mode = 'select';
var colour = 'black';


// Main stuff 
(function() {
	
	var canvas = document.querySelector('#paint');
	var ctx = canvas.getContext('2d');
	
	var sketch = document.querySelector('#sketch');
	var sketch_style = getComputedStyle(sketch);
	canvas.width = parseInt(sketch_style.getPropertyValue('width'));
	canvas.height = parseInt(sketch_style.getPropertyValue('height'));
	
	
	// Creating a tmp canvas
	var tmp_canvas = document.createElement('canvas');
	var tmp_ctx = tmp_canvas.getContext('2d');
	tmp_canvas.id = 'tmp_canvas';
	tmp_canvas.width = canvas.width;
	tmp_canvas.height = canvas.height;
	
	sketch.appendChild(tmp_canvas);

	var mouse = {x: 0, y: 0};
	var last_mouse = {x: 0, y: 0};
	var start_mouse = {x:0, y:0};
	
	// Pencil Points
	var ppts = [];
	
	
	$('#selectButton').on('click', function (e) {
    	mode = "select";
	});
	$('#freehandButton').on('click', function (e) {
    	mode = "freehand";
	});
	$('#lineButton').on('click', function (e) {
    	mode = "line";
	});
	$('#rectButton').on('click', function (e) {
    	mode = "rect";
	});
	$('#squareButton').on('click', function (e) {
    	mode = "square";
	});
	$('#ellipseButton').on('click', function (e) {
    	mode = "ellipse";
	});
	$('#circleButton').on('click', function (e) {
    	mode = "circle";
	});
	
	
	/* Mouse Capturing Work */
	tmp_canvas.addEventListener('mousemove', function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
	}, false);
	
	
	/* Drawing on Paint App */
	tmp_ctx.lineWidth = 5;
	tmp_ctx.lineJoin = 'round';
	tmp_ctx.lineCap = 'round';
	tmp_ctx.strokeStyle = colour;
	tmp_ctx.fillStyle = colour;
	
	
	
	tmp_canvas.addEventListener('mousedown', function(e) {
		tmp_canvas.addEventListener('mousemove', onPaint, false);
		
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
		
		ppts.push({x: mouse.x, y: mouse.y});
		
		start_mouse.x = mouse.x;
		start_mouse.y = mouse.y;
		
		onPaint();
	}, false);
	
	
	
	tmp_canvas.addEventListener('mouseup', function() {
		tmp_canvas.removeEventListener('mousemove', onPaint, false);
		// Writing down to real canvas now
		ctx.drawImage(tmp_canvas, 0, 0);
		// Clearing tmp canvas
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		// Emptying up Pencil Points
		ppts = [];
	}, false);
	
	
	
	
	var onPaint = function() {
		
		if (mode != 'select') {
			// Saving all the points in an array
			ppts.push({x: mouse.x, y: mouse.y});
			
			if (false) {
				if (ppts.length < 3) {
					var b = ppts[0];
					tmp_ctx.beginPath();
					tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
					tmp_ctx.fill();
					tmp_ctx.closePath();
					
					return;
				}
			}
		}
		
		// Tmp canvas is always cleared up before drawing.
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		
		if (mode == 'line') {
			tmp_ctx.beginPath();
			tmp_ctx.moveTo(start_mouse.x, start_mouse.y);
			tmp_ctx.lineTo(mouse.x, mouse.y);
			tmp_ctx.stroke();
			tmp_ctx.closePath();
		}
		
		else if (mode == 'rect') {
			var x = Math.min(mouse.x, start_mouse.x);
			var y = Math.min(mouse.y, start_mouse.y);
			var width = Math.abs(mouse.x - start_mouse.x);
			var height = Math.abs(mouse.y - start_mouse.y);
			tmp_ctx.strokeRect(x, y, width, height);
		}
		
		else if (mode == 'circle') {
			var x = (mouse.x + start_mouse.x) / 2;
		    var y = (mouse.y + start_mouse.y) / 2;
		 
		    var radius = Math.max(
		        Math.abs(mouse.x - start_mouse.x),
		        Math.abs(mouse.y - start_mouse.y)
		    ) / 2;
		 
		    tmp_ctx.beginPath();
		    tmp_ctx.arc(x, y, radius, 0, Math.PI*2, false);
		    tmp_ctx.stroke();
		    tmp_ctx.closePath();
		}
		
		else if (mode == 'square') {
			var x = Math.min(mouse.x, start_mouse.x);
			var y = Math.min(mouse.y, start_mouse.y);
			var width = Math.abs(mouse.x - start_mouse.x);
			var height = width;
			tmp_ctx.strokeRect(x, y, width, height);
		}
		
		else if (mode == 'ellipse') {
			var x = Math.min(mouse.x, start_mouse.x);
			var y = Math.min(mouse.y, start_mouse.y);
			var w = Math.abs(mouse.x - start_mouse.x);
			var h = Math.abs(mouse.y - start_mouse.y);
			
			var kappa = .5522848,
			ox = (w / 2) * kappa, // control point offset horizontal
			oy = (h / 2) * kappa, // control point offset vertical
			xe = x + w,           // x-end
			ye = y + h,           // y-end
			xm = x + w / 2,       // x-middle
			ym = y + h / 2;       // y-middle
			
			ctx.beginPath();
			ctx.moveTo(x, ym);
			ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
			ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
			ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
			ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
			ctx.stroke();
			ctx.closePath();
			//ctx.stroke();
		}
		
		else if (mode == 'freehand') {
			
			tmp_ctx.beginPath();
			tmp_ctx.moveTo(ppts[0].x, ppts[0].y);
			
			for (var i = 1; i < ppts.length - 2; i++) {
				var c = (ppts[i].x + ppts[i + 1].x) / 2;
				var d = (ppts[i].y + ppts[i + 1].y) / 2;
				
				tmp_ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
			}
			
			// For the last 2 points
			tmp_ctx.quadraticCurveTo(
				ppts[i].x,
				ppts[i].y,
				ppts[i + 1].x,
				ppts[i + 1].y
			);
		
			tmp_ctx.stroke();
		}
		
		else {}
	
		
	};
	
}());





