var mode = 'select';
var colour = 'black';
var isDrawing = false;
var endOfLine = {x:0, y:0};
var shapes = [];
var deletedShapes = [];
var selectedShapes = [];
var copiedShapes = [];
var global_x, global_y, global_radius, global_width, global_height;
var global_points = [];
var poly_points = [];

var last_length = 0, current_length = 0;
var numUndos = 0, numDeleted = 0;

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
		unselect();
		reDraw();
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
		selectedShapes = [];
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		tmp_ctx.clearRect(0, 0, canvas.width, canvas.height);
		reDraw();
	});
	$('#deleteButton').on('click', function (e) {
		for (var i = 0; i<selectedShapes.length; i++) {
			var index = shapes.indexOf(selectedShapes[i]);
			if (index > -1) {
				var deletedShape = shapes.splice(index, 1);
                deletedShapes.push(deletedShape);
                numDeleted++;
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
		unselect();
		var offset = 10;
		for (var i = 0; i<copiedShapes.length; i++) {
			if (copiedShapes[i].type == "square") {
				shapes.push({type:'square', x:offset, y:10, w:copiedShapes[i].w, h:copiedShapes[i].h, colour: copiedShapes[i].colour, selected:true});
				selectedShapes.push(shapes[shapes.length-1]);
			}
			offset += 25;
		}	
		reDraw();
	});
    $('#black').on('click', function (e) {
        tmp_ctx.strokeStyle = 'black';
        ctx.strokeStyle = 'black';
        colour = 'black';
    });
    $('#red').on('click', function (e) {
        tmp_ctx.strokeStyle = 'red';
        ctx.strokeStyle = 'red';
        colour = 'red';
    });
    $('#green').on('click', function (e) {
        tmp_ctx.strokeStyle = 'green';
        ctx.strokeStyle = 'green';
        colour = 'green';
    });
    $('#blue').on('click', function (e) {
        tmp_ctx.strokeStyle = 'blue';
        ctx.strokeStyle = 'blue';
        colour = 'blue';
    });
    $('#yellow').on('click', function (e) {
        tmp_ctx.strokeStyle = 'yellow';
        ctx.strokeStyle = 'yellow';
        colour = 'yellow';
    });
    $('#purple').on('click', function (e) {
        tmp_ctx.strokeStyle = 'purple';
        ctx.strokeStyle = 'purple';
        colour = 'purple';
    });
    
    $(document).on('keydown', function ( e ) {
        if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'z' || String.fromCharCode(e.which) === 'Z')) { //UNDO
                if (deletedShapes.length > 0) { // something was deleted, so add it back
                    var num = numDeleted;
                    while (num > 0) {
                        var tempShape = deletedShapes.pop();
                        if (tempShape.colour === undefined)
                            shapes.push(tempShape[0]);
                        else
                            shapes.push(tempShape);
                        num--;
                    }
                    reDraw();
                    numUndos++;
                }
            console.log( "You pressed CTRL + Z" );
        }
        else if ( e.ctrlKey && ( String.fromCharCode(e.which) === 'y' || String.fromCharCode(e.which) === 'Y')) { //REDO
                if (shapes.length > 0 && numUndos > 0) { // delete it again
                    var num = numDeleted;
                    while (num > 0) {
                        var tempShape = shapes.pop();
                        if (tempShape.colour === undefined)
                            deletedShapes.push(tempShape[0]);
                        else
                            deletedShapes.push(tempShape);
                        num--;
                    }
                    reDraw();
                    numUndos--;
                }
            console.log( "You pressed CTRL + Y" );
        }
        else {}
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
				unselect();				
			} else {
				// collision detection
				for (var i = 0; i<shapes.length; i++) {
					if (shapes[i].type == "square") {
						if (mouse.x > shapes[i].x && mouse.x < (shapes[i].x + shapes[i].w)
							&& mouse.y > shapes[i].y && mouse.y < (shapes[i].y + shapes[i].h)) {
							console.log("collision");
							shapes[i].selected = true;
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

            if (mode == 'freehand') {
                ppts = [];
                ppts.push({x: mouse.x, y: mouse.y});
                console.log("ppts add first point");
            }

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
                shapes.push({type:'freehand', points:ppts, colour: colour});
                // Emptying up Pencil Points
                ppts = [];
                console.log("clear ppts");
            }
            if (mode == 'circle') {
                shapes.push({type:'circle',x:global_x, y:global_y, rad:global_radius, colour: colour});
            }
            else if (mode == 'line') {
                global_points.splice(1, (global_points.length)-2);
                shapes.push({type:'line', points: global_points, colour: colour});
            }
            else if (mode == 'square') {
                shapes.push({type:'square',x:global_x, y:global_y, w:global_width, h:global_height, colour: colour, selected:false});
            }
            else if (mode == 'rect') {
                shapes.push({type:'rect',x:global_x, y:global_y, w:global_width, h:global_height, colour: colour });
            }
            else if (mode == 'ellipse') {
                shapes.push({type:'ellipse', x:global_x, y:global_y, w:global_width, h:global_height, colour: colour});
            }
            else{};
            console.log(shapes.length);
            last_length = current_length;
            current_length = shapes.length;
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
                shapes.push({type:'closed', points: poly_points,colour: colour});
            else shapes.push({type:'open', points: poly_points, colour: colour});
            poly_points = [];
            last_length = current_length;
            current_length = shapes.length;
        }
    });
	
	var onPaint = function() {
		
		if (mode != 'select') {
			// Saving all the poly_points in an array
			ppts.push({x: mouse.x, y: mouse.y});
		} else {
			reDraw();
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
            ctx.strokeStyle = shapes[i].colour;
            //console.log(shapes[i].type);

            if ((shapes[i].type == 'square') || (shapes[i].type == 'rect')) {
            	if (shapes[i].selected) {
            		ctx.strokeStyle = 'yellow';
            	} else {
            		ctx.strokeStyle = shapes[i].colour; // CHANGE
            	}
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

    var unselect = function() {
		for (var i = 0; i<selectedShapes.length;i++) {
			selectedShapes[i].selected = false;
		}
		selectedShapes = [];
    }
	
}());