var mode = 'select';
var colour = 'black';
var isDrawing = false;
var endOfLine = {x:0, y:0};
var shapes = [];
var selectedShapes = [];
var copiedShapes = [];
var global_x, global_y, global_radius, global_width, global_height;
var global_points = [];
var poly_points = [];

// Main stuff 
(function() {

    // colour picker
    var colour_canvas  = document.querySelector('#colour');
    //app.colorctx = app.$colors.getContext('2d');
    var colourctx = colour_canvas.getContext('2d');

    var colour_palette = document.querySelector('#colour_palette');
    var palette_style = getComputedStyle(colour_palette);
    //colour_canvas.width = parseInt(palette_style.getPropertyValue('width'));
    //colour_canvas.height = parseInt(palette_style.getPropertyValue('height'));

    colour_palette.appendChild(colour_canvas);

    /* Mouse Capturing Work */
    colour_canvas.addEventListener('mousemove', function(e) {
        //mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
        //mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
        colourctx.colorEventX = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
        colourctx.colorEventY = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
        //colourctx.colorEventX = e.pageX - ms.$colors.offset().left;
        //colourctx.colorEventY = e.pageY - ms.$colors.offset().top;
    }, false);

    colour_canvas.addEventListener('mousedown', function(e) {

        colour_canvas.addEventListener('mousemove', buildColorPalette, false);

        // Get the color at the current mouse coordinates
        colourctx.colorTimer = setInterval(getColor(), 50);

        buildColorPalette();
    });

    colour_canvas.addEventListener('mouseup', function(e) {
        clearInterval(colourctx.colorTimer);
        colour_canvas.removeEventListener('mousemove', buildColorPalette, false);
    });


// Build Color palette
    var buildColorPalette = function() {
        console.log("in build colour palette");
        var gradient = colourctx.createLinearGradient(0, 0, colour_canvas.width(), 0);

        // Create color gradient
        gradient.addColorStop(0,    "rgb(255,   0,   0)");
        gradient.addColorStop(0.15, "rgb(255,   0, 255)");
        gradient.addColorStop(0.33, "rgb(0,     0, 255)");
        gradient.addColorStop(0.49, "rgb(0,   255, 255)");
        gradient.addColorStop(0.67, "rgb(0,   255,   0)");
        gradient.addColorStop(0.84, "rgb(255, 255,   0)");
        gradient.addColorStop(1,    "rgb(255,   0,   0)");

        // Apply gradient to canvas
        colourctx.fillStyle = gradient;
        colourctx.fillRect(0, 0, colourctx.canvas.width, colourctx.canvas.height);

        // Create semi transparent gradient (white -> trans. -> black)
        gradient = colourctx.createLinearGradient(0, 0, 0, colour_canvas.height());
        gradient.addColorStop(0,   "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
        gradient.addColorStop(0.5, "rgba(0,     0,   0, 0)");
        gradient.addColorStop(1,   "rgba(0,     0,   0, 1)");

        // Apply gradient to canvas
        colourctx.fillStyle = gradient;
        colourctx.fillRect(0, 0, colourctx.canvas.width, colourctx.canvas.height);

    };

    var getColor = function(e) {
        var newColor;
        var imageData = colourctx.getImageData(colourctx.colorEventX, colourctx.colorEventY, 1, 1);
        colourctx.selectedColor = 'rgb(' + imageData.data[4] + ', ' + imageData.data[5] + ', ' + imageData.data[6] + ')';
        console.log(colourctx.selectedColor);
    };





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
		shapes = [];
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	});
	$('#deleteButton').on('click', function (e) {
		for (var i = 0; i<selectedShapes.length; i++) {
			var index = shapes.indexOf(selectedShapes[i]);
			if (index > -1) {
				shapes.splice(index, 1);
			}
		}
		selectedShapes = [];
		reDraw();
	});
	$('#copyButton').on('click', function (e) {
		if (selectedShapes.length > 0) {
			copiedShapes = [];
			for (var i = 0; i<selectedShapes.length; i++) {
				copiedShapes.push(selectedShapes[i]);
			}			
			console.log(copiedShapes);
		}
	});
	$('#pasteButton').on('click', function (e) {
		selectedShapes = [];
		var offset = 10;
		for (var i = 0; i<copiedShapes.length; i++) {
			if (copiedShapes[i].type == "square") {
				shapes.push({type:'square', x:offset, y:10, w:copiedShapes[i].w, h:copiedShapes[i].h, selected:false});
			}
			offset += 25;
		}	
		reDraw();
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
		
		if (mode == "select") {
			if (selectedShapes.length > 0) {
				// moving shapes
				for (var i = 0; i<selectedShapes.length; i++) {
					selectedShapes[i].x = mouse.x;
					selectedShapes[i].y = mouse.y;
				}
				reDraw();
				selectedShapes = [];
			} else {
				// collision detection
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
                poly_points.push({x: mouse.x, y:mouse.y});
                endOfLine.x = mouse.x;
                endOfLine.y = mouse.y;
                ctx.beginPath();
                ctx.moveTo(endOfLine.x, endOfLine.y);
            }
            else { // already drawing polygon
                console.log("down already drawing");
                poly_points.push({x: mouse.x, y:mouse.y});
                endOfLine.x = mouse.x;
                endOfLine.y = mouse.y;
                if (poly_points.length > 1) {
                    var length = poly_points.length;
                    ctx.lineTo(poly_points[length-1].x, poly_points[length-1].y);
                    ctx.stroke();
                    console.log("draw on canvas with poly_points " + poly_points[length-1].x + " and " + poly_points[length-1].y);
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


            if (mode == 'freehand') {
                shapes.push({type:'freehand', points:ppts});
                // Emptying up Pencil Points
                ppts = [];
            }
            if (mode == 'circle') {
                shapes.push({type:'circle',x:global_x, y:global_y, rad:global_radius});
            }
            else if (mode == 'line') {
                global_points.splice(1, (global_points.length)-2);
                shapes.push({type:'line', points: global_points});
            }
            else if (mode == 'square') {
                shapes.push({type:'square',x:global_x, y:global_y, w:global_width, h:global_height, selected:false});
            }
            else if (mode == 'rect') {
                shapes.push({type:'rect',x:global_x, y:global_y, w:global_width, h:global_height });
            }
            else if (mode == 'ellipse') {
                shapes.push({type:'ellipse', x:global_x, y:global_y, w:global_width, h:global_height});
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
    }, false);


    tmp_canvas.addEventListener('dblclick', function(){
        if ((mode == 'closed') || (mode == 'open')) {
            poly_points.push({ x:mouse.x, y:mouse.y});
            if (mode == 'closed') {
                ctx.closePath();
            }
            ctx.stroke();
            tmp_canvas.removeEventListener('mousemove', onPaint, false);

            isDrawing = false;
            // Clearing tmp canvas
            tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

            // Add new polygon to shape array
            poly_points.splice(poly_points.length-2, 2);
            if (mode == 'closed')
                shapes.push({type:'closed', points: poly_points});
            else shapes.push({type:'open', points: poly_points});
            poly_points = [];
        }
    });
	
	var onPaint = function() {
		
		if (mode != 'select') {
			// Saving all the poly_points in an array
			ppts.push({x: mouse.x, y: mouse.y});
		}
		
		// Tmp canvas is always cleared up before drawing.
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		
		if (mode == 'line') {
			tmp_ctx.beginPath();
			tmp_ctx.moveTo(start_mouse.x, start_mouse.y);
			tmp_ctx.lineTo(mouse.x, mouse.y);
			tmp_ctx.stroke();
			tmp_ctx.closePath();

            global_points.push({x:start_mouse.x, y:start_mouse.y});
            global_points.push({x:mouse.x, y:mouse.y});
		}
		
		else if (mode == 'rect') {
			var x = Math.min(mouse.x, start_mouse.x);
			var y = Math.min(mouse.y, start_mouse.y);
			var width = Math.abs(mouse.x - start_mouse.x);
			var height = Math.abs(mouse.y - start_mouse.y);
			tmp_ctx.strokeRect(x, y, width, height);
			global_height = height;
			global_width = width;
			global_x = x;
			global_y = y;
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

			global_x = x;
			global_y = y;
			global_width = w;
			global_height = h;
		}
		
		else if (mode == 'freehand') {
			
			tmp_ctx.beginPath();
			tmp_ctx.moveTo(ppts[0].x, ppts[0].y);
			
			for (var i = 1; i < ppts.length - 2; i++) {
                var c = (ppts[i].x + ppts[i + 1].x) / 2;
                var d = (ppts[i].y + ppts[i + 1].y) / 2;

                tmp_ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);


                // For the last 2 poly_points
                tmp_ctx.quadraticCurveTo(
                    ppts[i].x,
                    ppts[i].y,
                    ppts[i + 1].x,
                    ppts[i + 1].y
                );
            }
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

    var reDraw = function() {
    	ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < shapes.length; i++) {
            console.log(shapes[i].type);

            if ((shapes[i].type == 'square') || (shapes[i].type == 'rect')) {
                ctx.strokeRect(shapes[i].x, shapes[i].y, shapes[i].w, shapes[i].h);
            }
            else if (shapes[i].type == 'line') {
                ctx.beginPath();
                console.log(shapes[i].points[0].x + " " + shapes[i].points[0].y);
                console.log(shapes[i].points[1].x + " " + shapes[i].points[1].y);
                ctx.moveTo(shapes[i].points[0].x, shapes[i].points[0].y);
                ctx.lineTo(shapes[i].points[1].x, shapes[i].points[1].y);
                ctx.stroke();
            }
            else if (shapes[i].type == 'circle') {
                ctx.beginPath();
                ctx.arc(shapes[i].x, shapes[i].y, shapes[i].rad, 0, Math.PI*2, false);
                ctx.stroke();
                ctx.closePath();
            }
            else if (shapes[i].type == 'ellipse') {
                var x = shapes[i].x;
                var y = shapes[i].y;
                var w = shapes[i].w;
                var h = shapes[i].h;

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
            else if (shapes[i].type == 'open' || shapes[i].type == 'closed') {
                ctx.beginPath();
                ctx.moveTo(shapes[i].points[0].x, shapes[i].points[0].y);
                for (var j = 1; j < shapes[i].points.length; j++) {
                    ctx.lineTo(shapes[i].points[j].x, shapes[i].points[j].y);
                }
                if (shapes[i].type == 'closed') {
                    ctx.closePath();
                }
                ctx.stroke();
            }
            else if (shapes[i].type == 'freehand') {
                ctx.beginPath();
                ctx.moveTo(shapes[i].points[0].x, shapes[i].points[0].y);

                for (var j = 1; j < shapes[i].points.length - 2; j++) {
                    var c = (shapes[i].points[j].x + shapes[i].points[j + 1].x) / 2;
                    var d = (shapes[i].points[j].y + shapes[i].points[j + 1].y) / 2;
                    ctx.quadraticCurveTo(shapes[i].points[j].x, shapes[i].points[j].y, c, d);

                    // For the last 2 poly_points
                    ctx.quadraticCurveTo(
                        shapes[i].points[j].x,
                        shapes[i].points[j].y,
                        shapes[i].points[j + 1].x,
                        shapes[i].points[j + 1].y
                    );
                }
                ctx.stroke();
            }
            else{};
        }
    }
	
}());





