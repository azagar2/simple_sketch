var mode = 'select';
var colour = 'black';
var isDrawing = false;
var endOfLine = {x:0, y:0};
var shapes = [];
var selectedShapes = [];
var global_x, global_y, global_radius, global_width, global_height;
var points = [];

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
    $('#openPolyButton').on('click', function (e) {
        mode = "open";
    });
    $('#closedPolyButton').on('click', function (e) {
        mode = "closed";
    });
    $('#clearButton').on('click', function (e) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes = [];
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

    /* Drawing on Paint App */
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = colour;
    ctx.fillStyle = colour;

	
	tmp_canvas.addEventListener('mousedown', function(e) {

		// collision detection
		if (mode == "select") {
			for (var i = 0; i<shapes.length; i++) {
				if (shapes[i].type == "square") {
					if (mouse.x > shapes[i].x && mouse.x < (shapes[i].x + shapes[i].w)
						&& mouse.y > shapes[i].y && mouse.y < (shapes[i].y + shapes[i].h)) {
						console.log("collision");
						selectedShapes.push(shapes[i]);
					}
				}
			}
		}

        if ((mode != 'open') && (mode != 'closed')) {
            tmp_canvas.addEventListener('mousemove', onPaint, false);

            mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
            mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;

            ppts.push({x: mouse.x, y: mouse.y});

            start_mouse.x = mouse.x;
            start_mouse.y = mouse.y;

            onPaint();
        }
        else { // open and closed polygons
            console.log("polygon");
            if (!isDrawing) {
                console.log("down new drawing");
                isDrawing = true;
                points.push({x: mouse.x, y:mouse.y});
                endOfLine.x = mouse.x;
                endOfLine.y = mouse.y;
                ctx.beginPath();
                ctx.moveTo(endOfLine.x, endOfLine.y);
            }
            else { // already drawing polygon
                console.log("down already drawing");
                points.push({x: mouse.x, y:mouse.y});
                endOfLine.x = mouse.x;
                endOfLine.y = mouse.y;
                if (points.length > 1) {
                    var length = points.length;
                    ctx.lineTo(points[length-1].x, points[length-1].y);
                    ctx.stroke();
                    console.log("draw on canvas with points " + points[length-1].x + " and " + points[length-1].y);
                }
            }
        }
	}, false);
	

	tmp_canvas.addEventListener('mouseup', function() {

        if ((mode != 'open') && (mode != 'closed')) {

            tmp_canvas.removeEventListener('mousemove', onPaint, false);
            // Writing down to real canvas now
            ctx.drawImage(tmp_canvas, 0, 0);
            // Clearing tmp canvas
            tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
            // Emptying up Pencil Points
            ppts = [];

            if (mode == 'circle') {
                shapes.push({ type:'circle',x:global_x, y:global_y, rad:global_radius});
            }
            else if (mode == 'square') {
                shapes.push({ type:'square',x:global_x, y:global_y, w:global_width, h:global_height });
            }
            else{};
            console.log(shapes.length);
        }
        else { // polygon

            tmp_canvas.addEventListener('mousemove', onPaint, false);
            if (isDrawing) {
                onPaint();
            }
        }
        else{};
    }, false);


    tmp_canvas.addEventListener('dblclick', function(){
        points.push({ x:mouse.x, y:mouse.y});
        console.log("double click");
        if ((mode == 'closed') || (mode == 'open')) {
            if (mode == 'closed') {
                ctx.closePath();
            }
            ctx.stroke();
            tmp_canvas.removeEventListener('mousemove', onPaint, false);
            // clear temp canvas
            isDrawing = false;
        }
        // closes polygon, should be able to create new object now
    });
	
	var onPaint = function() {
		
		if (mode != 'select') {
			// Saving all the points in an array
			ppts.push({x: mouse.x, y: mouse.y});
			//
			//if (false) {
			//	if (ppts.length < 3) {
			//		var b = ppts[0];
			//		tmp_ctx.beginPath();
			//		tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
			//		tmp_ctx.fill();
			//		tmp_ctx.closePath();
			//
			//		return;
			//	}
			//}
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

            global_x = x;
            global_y = y;
            global_radius = radius;
		}
		
		else if (mode == 'square') {
			var x = Math.min(mouse.x, start_mouse.x);
			var y = Math.min(mouse.y, start_mouse.y);
			var width = Math.abs(mouse.x - start_mouse.x);
			var height = width;
			tmp_ctx.strokeRect(x, y, width, height);
            global_height = height;
            global_width = width;
            global_x = x;
            global_y = y;
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

            tmp_ctx.beginPath();
            tmp_ctx.moveTo(x, ym);
            tmp_ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            tmp_ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            tmp_ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            tmp_ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
            tmp_ctx.stroke();
            tmp_ctx.closePath();
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

        else if ((mode == 'open') || (mode == 'closed')) {

            tmp_ctx.beginPath();
            tmp_ctx.moveTo(endOfLine.x, endOfLine.y);
            tmp_ctx.lineTo(mouse.x, mouse.y);
            tmp_ctx.stroke();
            tmp_ctx.closePath();
        }
		
		else {}
	};
	
}());





