import Ember from 'ember';

export default Ember.Object.extend({
    canvas: null,
    mouseIsDown: false,
    widgetColor: '#5CB85C',
    highlightColor: 'red',
    badSegmentColor: 'red',
    polyFillColor: 'yellow',

    // List of vertex that defines a polygone contour
    areaPoints: [],

    // This value is used to create a circle around selected points.
    // It is also use to determine is a point is near an another point
    // (in the point circle)
    circleRadius: 5,

    firstPoint: null,
    secondPoint: null,
    initialFirstPoint: null,
    initialSecondPoint: null,
    initialMeasurementLength: null,

    mouseX: 0,
    mouseY: 0,

    previousSegment: null,

    // Callback used to record measurements
    recordData: null,

    // Flag used when creating a polygon. It will be true
    // if the current segment self-intersect the polygone contour
    incorrectSegment: false,

    init()
    {
        this._super(...arguments);

        this.canvas = new fabric.Canvas('mapperCanvas');

        let canvasOffset = Ember.$('#mapperCanvas').offset().top;

        let innerHeight = window.innerHeight;

        let canvasHeight = innerHeight - canvasOffset;

        this.canvas.setHeight(canvasHeight);

        // Set the height of the toolbox
        Ember.$('.col-toolbox').height(canvasHeight);

        let canvasColumnWidth = Ember.$('.col-canvas').width();

        this.canvas.setWidth(canvasColumnWidth);

        this.canvas.selection = false;

        let self = this;
        // Load the test image
        fabric.Image.fromURL('images/floorplan.jpg', function (img) {
            img.scaleToHeight(self.canvas.height);

            // Make it so the user can't interact with or select the image
            img.evented = img.selectable = false;

            // Set the X origin to the center of the image so we can center it
            img.originX = 'center';
            img.left = self.canvas.width / 2;

            self.canvas.add(img).renderAll();
      });

      this.canvas.defaultCursor = 'crosshair';
    },

    startOver()
    {
        this.set('initialFirstPoint', null);
        this.set('initialSecondPoint', null);
        this.set('initialMeasurementLength', null);
        this.set('mouseX', 0);
        this.set('mouseY', 0);

    },

  /*-------------------  Geometry util --------------*/
    // Returns true is point is within epsilon distance from (x,y), false otherwise
    isNearEnough: function(point, x ,y, epsilon) {
        return (point.x - x) * (point.x - x)  + (point.y - y) * (point.y - y) < epsilon*epsilon;
    },

    // Test intersection of segment p1p2 and p3p4
    // Returns true if they do intersect, false if they don't
    // We use standerd line equation: ax + by +c = 0
    segmentIntersects(p1, p2, p3, p4) {

        // Line equation , segment  p1p2
        let a1 = p2.y - p1.y;
        let b1 = p1.x - p2.x;
        let c1 = p2.x * p1.y - p1.x * p2.y;

        // Compute the line sign values
        let r1 = a1 * p3.x + b1 * p3.y + c1;
        let r2 = a1 * p4.x + b1 * p4.y + c1;

        if  (r1 !== 0 && r2 !== 0 && ((r1 > 0) === (r2>0))) {
            return false;
        }

        //Line equation , segment  p3p4
        let a2 = p4.y - p3.y;
        let b2 = p3.x - p4.x;
        let c2 = p4.x * p3.y - p3.x * p4.y;

        // Compute the line sign values
        r1 = a2 * p1.x + b2 * p1.y + c2;
        r2 = a2 * p2.x + b2 * p2.y + c2;

        if  (r1 !== 0 && r2 !== 0 && ((r1 > 0) === (r2>0))) {
            return false;
        }

        if  ( (a1 * b2 - a2 * b1) === 0) {
          // The segments are collinear, they intersect if they overlap
          // They overlap is p4 falls on p1p2 or if p2 falls on p3p4
          if (this.isOnSegment(p1, p2, p4) || this.isOnSegment(p3, p4, p2)) {
              return true;
          } else {
              return false;
          }
        } else {

            return true;

        }
    },

    // The polyline is a list of vertices, each one  defined as (x:x,y:y}
    // Does a segment  to be added at the end off the polyline creates
    // a self-intersection polyline? It will return true if it does.
    // p2 is the end vertex of the segment we want to add and its start
    // vertex is last vertex of the polyline.
    doesSegmentIntersectPolyline(polyline, p2) {

        // We need at least one edge
        if ( polyline.length < 2) {
            return false;
        }

        let polylineLength = polyline.length;

        let doIntersect = false;
        let lastPoint = polyline[polylineLength -1];

        // First we need to test against all the polyline segment except the last one
        for (let idx = 0; idx < polylineLength - 2; idx++) {
            if (this.segmentIntersects(polyline[idx], polyline[idx + 1], lastPoint, p2) === true) {
            doIntersect = true;
            break;
          }
        }

        if (!doIntersect) {
            // We now test against the last polyline segment.
            // Since the fast segement and the segement we want to
            // add share a vertex, theoretically they do intersect.
            // But it is not considered a self-intersection.
            // We do self-intersect the last polyline segment if we backtrack
            // on it. We backtrack on it if p2 falls on the last segment of the
            // polyline
            if (this.isOnSegment(polyline[polylineLength - 2], lastPoint, p2)) {
                doIntersect = true;
            }
        }

        return doIntersect;
    },
    // Returns true is p3 is on segment p1p2
    isOnSegment(p1,p2,p3) {
        // For p3 to be on segment p1p2 , segments p1p3 and p3p2 must be collinear
        let crossProduct = (p3.y - p1.y) * (p2.x - p1.x) - (p3.x - p1.x) * (p2.y - p1.y);
        if ( crossProduct !== 0) {
            // They are not collinear
            return false;
        }

        // A collinear point falls on a segment if the dotProduct is
        // positive and if it is less than the squared length of the
        // segment
        let dotProduct = (p3.x - p1.x) * (p2.x - p1.x) + (p3.y - p1.y) * (p2.y - p1.y);

        if (dotProduct < 0) {
            return false;
        }

        let squaredLengthP1P2 = (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);

        if ( dotProduct > squaredLengthP1P2) {
            return false;
        }
        return true;
    },
    /*--------------------------------------------------------------------------------------*/
    createCircle(x, y, reference)
    {
        return new fabric.Circle({
            radius: this.get('circleRadius'),
            fill: undefined,
            left: x,
            top: y,
            originX: 'center',
            originY: 'center',
            stroke: this.get('widgetColor'),
            strokeWidth: 2,
            reference: reference,
            hasControls: false,
            selectable: false
        });
    },

    createLine(startPoint, endPoint, strokeColor, strokeWidth, reference)
    {
        return new fabric.Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
            fill: this.get('widgetColor'),
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            selectable: false,
            originX: 'center',
            originY: 'center',
            reference: reference,
            hasControls: false
        });
    },

    setMouseValues(canvas, event) {
        let pointer = canvas.getPointer(event);

        this.set('mouseX', Math.round(pointer.x));
        this.set('mouseY', Math.round(pointer.y));
    },


    resetCanvasMouseEventListener(canvas)
    {
        if (canvas.__eventListeners) {
            canvas.__eventListeners["mouse:down"] = [];
            canvas.__eventListeners["mouse:move"] = [];
            canvas.__eventListeners["mouse:up"] = [];
        }
    },

    setMeasurementPoint(x, y, pointName, referenceName)
    {
        let canvas = this.get('canvas');

        let circle = this.createCircle(x, y, referenceName);

        canvas.add(circle).renderAll();

        // Animate the circle
        circle.animate('radius', '+=5', {
            onChange: canvas.renderAll.bind(canvas),
            duration: 100,
            easing: fabric.util.ease.easeInCubic,

            onComplete: function() {
                circle.animate('radius', '-=5', {
                    onChange: canvas.renderAll.bind(canvas),
                    duration: 150,
                    easing: fabric.util.ease.easeOutCubic
                });
            }
        });

        this.set(pointName, {x:x, y:y});
    },

    // Use to get rid of unfinished area
    cleanDisplay(canvas) {

        // We need to remove unfinished area objects, if any
        let objs = this.getCanvasObjects('areaRef-circle');
        objs.map(obj => canvas.remove(obj));
        objs = this.getCanvasObjects('areaRef-line');
        objs.map(obj => canvas.remove(obj));
        canvas.renderAll();

        this.set('firstPoint', null);
        this.set('secondPoint', null);
        this.get('areaPoints').length = 0;
    },

    // Delete all objects in the canvas
    deleteAllDisplayedMeasurements()
    {
        let canvas = this.get('canvas');

        canvas.forEachObject(function(obj)
        {
            // If it's not an image then it is a measurement, remove it
            if (obj.type !== 'image') {
               canvas.remove(obj).renderAll();
            }
        });
    },

    getCanvasObject(reference)
    {
        let object = null;

        let canvas = this.get('canvas');

        canvas.forEachObject(function(obj) {
            if (obj.reference === reference) {
               object = obj;
            }
        });

        return object;
    },

    // Get all the canvas objects that have the given reference
    getCanvasObjects(reference)
    {
        let object = [];

        let canvas = this.get('canvas');

        canvas.forEachObject(function(obj)
        {
            if (obj.reference === reference) {
              object.push(obj);
            }
        });

        return object;
    },

    /*---------------------- Initial Measurement ----------------------------------------*/
    // This sets the canvas to get the initial line that will be use to calculate the
    // display resolution
    setDisplayForResolutionMeasurement()
    {
        let canvas = this.get('canvas');

        this.resetCanvasMouseEventListener(canvas);
        canvas.on({
            'mouse:down': options => this.initialCanvasOnMouseDown(options),
            'mouse:move': options => this.initialCanvasOnMouseMove(options),
            'mouse:up': options => this.initialCanvasOnMouseUp(options)
        });
    },

    initialCanvasOnMouseDown(options)
    {

        this.set('mouseIsDown', true);

        this.setMeasurementPoint(
            this.get('mouseX'),
            this.get('mouseY'),
            'initialFirstPoint',
            '',
            options
        );
    },

    initialCanvasOnMouseMove(options)
    {
        let canvas = this.get('canvas');

        this.setMouseValues(canvas, options.e);

        let mouseIsDown = this.get('mouseIsDown');

        if (mouseIsDown) {
            // Erase the previous segement, if any
            let previousSegment = this.get('previousSegment');
            if (previousSegment) {
                canvas.remove(previousSegment);
            }

            let x = this.get("mouseX");
            let y = this.get("mouseY");

            let line = this.createLine(
                this.get('initialFirstPoint'),
                {x:x, y:y},
                this.get('widgetColor'),
                1,
                ''
            );

            canvas.add(line).renderAll();
            this.set('previousSegment', line);
        }
    },

    initialCanvasOnMouseUp(options)
    {
        let canvas = this.get('canvas');

        this.set("mouseIsDown", false);

        // Erase the previous segment, if any
        let previousSegment = this.get('previousSegment');
        if (previousSegment) {
            canvas.remove(previousSegment);
            this.set('previousSegment', null);
        }

        this.setMeasurementPoint(
            this.get('mouseX'),
            this.get('mouseY'),
            'initialSecondPoint',
            '',
            options
        );

        // Create the display line and the data record
        this.setInitialLength(canvas);
    },

    setInitialLength(canvas)
    {

        let line = this.createLine(
            this.get('initialFirstPoint'),
            this.get('initialSecondPoint'),
            this.get('widgetColor'),
            1,
            'measurementJoinLine'
        );

        canvas.add(line).renderAll();

        let measurementLength = Math.sqrt(
            Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y1 - line.y2, 2)
        );

        this.set('initialMeasurementLength', measurementLength);

    },
    /*---------------------- Length Measurements -------------------------------------*/
    // This sets the canvas to get lines for length measurements
    setDisplayForLengthMeasurements(recordLength)
    {
        this.set('recordData', recordLength);

        let canvas = this.get('canvas');

        // It is possible that when we switch to length measurements we might have an unfinished
        // area build up, we need to clear it from the display
        this.cleanDisplay(canvas);

        this.resetCanvasMouseEventListener(canvas);
        canvas.on({
            'mouse:down': options => this.lengthCanvasOnMouseDown(options),
            'mouse:move': options => this.lengthCanvasOnMouseMove(options),
            'mouse:up': options => this.lengthCanvasOnMouseUp(options)
        });
    },

    lengthCanvasOnMouseDown(options)
    {
        this.set('mouseIsDown', true);

        this.setMeasurementPoint(
            this.get('mouseX'),
            this.get('mouseY'),
            'firstPoint',
            'firstMeasurement',
            options
        );
    },

    lengthCanvasOnMouseMove(options)
    {
        let canvas = this.get('canvas');

        this.setMouseValues(canvas, options.e);

        let mouseIsDown = this.get('mouseIsDown');

        if (mouseIsDown) {
            // Erase the previous segement, if any
            let previousSegment = this.get('previousSegment');
            if (previousSegment) {
               canvas.remove(previousSegment);
            }

            let x = this.get("mouseX");
            let y = this.get("mouseY");

            let line = this.createLine(
                this.get('firstPoint'),
                {x:x, y:y},
                this.get('widgetColor'),
                1,
                ''
            );

            canvas.add(line).renderAll();
            this.set('previousSegment', line);
        }
    },

    lengthCanvasOnMouseUp(options)
    {
        let canvas = this.get('canvas');

        this.set("mouseIsDown", false);

        // Erase the previous segement, if any
        let previousSegment = this.get('previousSegment');
        if (previousSegment) {
            canvas.remove(previousSegment);
            this.set('previousSegment', null);
        }

        this.setMeasurementPoint(
            this.get('mouseX'),
            this.get('mouseY'),
            'secondPoint',
            'secondMeasurement',
            options
        );

        // Create the display line and the data record
        this.setLength(canvas, true, 'measurementJoinLine');

        this.set('firstPoint', null);
        this.set('secondPoint', null);

    },

    setLength(canvas, saveData, reference)
    {
        let pt1 = {x: this.get('firstPoint.x'), y: this.get('firstPoint.y')};
        let pt2 = {x: this.get('secondPoint.x'), y: this.get('secondPoint.y')};

        let line = this.createLine(
            pt1,
            pt2,
            this.get('widgetColor'),
            1,
            reference
        );

        canvas.add(line).renderAll();

        if (saveData && this.get('recordData')) {
            // Create a data object containing the length's data
            this.recordData(pt1, pt2).then(data => {
                // Set the reference of our points and line to that of our ID
                let firstPoint = this.getCanvasObject('firstMeasurement');
                let secondPoint = this.getCanvasObject('secondMeasurement');
                firstPoint.reference = `${data.id}_point_1`;
                secondPoint.reference = `${data.id}_point_2`;
                line.reference = `${data.id}_join_line`;
            });
        }
    },

    deleteLength(id)
    {
        // Get the canvas
        let canvas = this.get('canvas');

        // Remove the measurement from the canvas
        canvas.remove(this.getCanvasObject(`${id}_point_1`)).renderAll();
        canvas.remove(this.getCanvasObject(`${id}_point_2`)).renderAll();
        canvas.remove(this.getCanvasObject(`${id}_join_line`)).renderAll();
    },

    unLightLength(id)
    {
        let canvas = this.get('canvas');

        let widgetColor = this.get('widgetColor');

        let obj = this.getCanvasObject(`${id}_point_1`);
        if (obj) {
            obj.stroke = widgetColor;
        }
        obj = this.getCanvasObject(`${id}_point_2`);
        if (obj) {
            obj.stroke = widgetColor;
        }
        obj = this.getCanvasObject(`${id}_join_line`);
        if (obj) {
            obj.stroke = widgetColor;
        }
        canvas.renderAll();

    },

    highLightLength(id)
    {
        let canvas = this.get('canvas');

        let highlightColor = this.get('highlightColor');

        let obj = this.getCanvasObject(`${id}_point_1`);
        if (obj) {
            obj.stroke = highlightColor;
        }
        obj = this.getCanvasObject(`${id}_point_2`);
        if (obj) {
            obj.stroke = highlightColor;
        }
        obj = this.getCanvasObject(`${id}_join_line`);
        if (obj) {
            obj.stroke = highlightColor;
        }
        canvas.renderAll();

    },

    /*---------------------- Area Measurements -------------------------------------*/
    // This sets the canvas to get polyline contours for area measurements
    setDisplayForAreaMeasurements(recordArea)
    {
        this.set('recordData', recordArea);

        this.set('incorrectSegment', false);

        let canvas = this.get('canvas');

        this.resetCanvasMouseEventListener(canvas);
        canvas.on({
            'mouse:down': options => this.areaCanvasOnMouseDown(options),
            'mouse:move': options => this.areaCanvasOnMouseMove(options),
            'mouse:up': options => this.areaCanvasOnMouseUp(options)
        });
    },

    areaCanvasOnMouseDown(options)
    {
        this.set('mouseIsDown', true);

        let point1 = this.get('firstPoint');

        // If the first point is done then we just do nothing
        // all the action is in the move event
        if (!point1) {
            let x = this.get("mouseX");
            let y = this.get("mouseY");
            this.setMeasurementPoint(
                x,
                y,
                'firstPoint',
                'areaRef-circle',
                options
            );

            this.get('areaPoints').push({'x':x, 'y':y});
        }

    },

    areaCanvasOnMouseMove(options)
    {
        this.set("displayWarning", "");

        let canvas = this.get('canvas');

        this.setMouseValues(canvas, options.e);

        let mouseIsDown = this.get('mouseIsDown');

        if (mouseIsDown) {
            let x = this.get("mouseX");
            let y = this.get("mouseY");

            // Erase the previous segment, if any
            let previousSegment = this.get('previousSegment');
            if (previousSegment) {
                canvas.remove(previousSegment);
            }

            let polyline = this.get('areaPoints');
            let firstVertex = polyline[0];

            // Check to see if the current position could close the polygon
            //let willClosePolygon = this.get('geomUtil').isNearEnough(firstVertex, x, y, this.get('circleRadius'));
            let willClosePolygon = this.isNearEnough(firstVertex, x, y, this.get('circleRadius'));

            let lineStrokeColor = this.get('widgetColor');

            // Self intersecting polygon is not allowed
            if (!willClosePolygon &&
                polyline.length > 2 &&
                //this.get('geomUtil').doesSegmentIntersectPolyline(polyline, {x:x, y:y})) {
                this.doesSegmentIntersectPolyline(polyline, {x:x, y:y})) {
                // So it is a bad segment, warn the user
                lineStrokeColor = this.get('badSegmentColor');
                this.set("displayWarning", "Incorrect self-intersecting segment");
                this.set('invalidSegment', true);
            } else {
                this.set('invalidSegment', false);
            }

            let strokeWidth = 1;
            if (willClosePolygon) {
                // We temporally change the segment color to give feedback
                // to the user, telling him that if he choose that segment
                // an area will be generated
                lineStrokeColor = this.get('polyFillColor');
                strokeWidth = 2;
            }

            let line = this.createLine(
                this.get('firstPoint'),
                {x:x, y:y},
                lineStrokeColor,
                strokeWidth,
                ''
            );

            canvas.add(line).renderAll();

            this.set('previousSegment', line);
      }
    },

    areaCanvasOnMouseUp(options)
    {
        let canvas = this.get('canvas');

        this.set("mouseIsDown", false);

        // Erase the previous segement, if any
        let previousSegment = this.get('previousSegment');
        if (previousSegment) {
            canvas.remove(previousSegment);
            this.set('previousSegment', null);
        }

        let x =  this.get('mouseX');
        let y =  this.get('mouseY');

        if (this.get('invalidSegment')) {
            this.set('secondPoint', null);
            this.set("displayWarning", "Cannot add incorrect segment");
            return;
        }

        // If we clicked inside the circle of the first point, we close the polygon
        let areaPoints = this.get('areaPoints');
        let firstVertex = areaPoints[0];
        //let closePolygon = this.get('geomUtil').isNearEnough(firstVertex, x, y, this.get('circleRadius'));
        let closePolygon = this.isNearEnough(firstVertex, x, y, this.get('circleRadius'));

        if  (closePolygon) {
            // snap the last vertex to the first one
            x = firstVertex.x;
            y = firstVertex.y;
        }

        this.setMeasurementPoint(
            x,
            y,
            'secondPoint',
            'areaRef-circle',
            options
        );

        // Create the display line but do not create a length record
        this.setLength(canvas, false, 'areaRef-line');

        if (!closePolygon) {
            areaPoints.push({'x':x, 'y':y});

            // Copy point 2 in point 1 so that we can
            // continue building the polygon
            this.set('firstPoint', this.get('secondPoint'));
            this.set('secondPoint', null);
        } else {
            // We do not add the last point to areaPoints, as fabric point list for polygon
            // must not be closed
            this.setArea(canvas);

            // Reset everything so that we can begin a new polygon if desired
            this.set('firstPoint', null);
            this.set('secondPoint', null);
            areaPoints.length = 0;
        }
    },

    setArea(canvas)
    {
        let areaPoints = this.get("areaPoints");

        // We make a copy of the points because fabric modifies the list pass to it
        let polyPoints = areaPoints.map(obj => {
            let newObj = {};
            newObj.x = obj.x;
            newObj.y = obj.y;
            return newObj;
        });
        let poly = new fabric.Polygon (polyPoints, {
            fill: this.get('polyFillColor'),
            stroke: this.get('widgetColor'),
            strokeWidth: 1,
            hasControls: false,
            selectable: false,
            opacity: 0.5,
            reference: 'thePoly'
        });

        // We do not keep the segments used to define the polygon
        // But we do keep the circles around each polygon vertex
        let areaObjects = this.getCanvasObjects('areaRef-line');
        areaObjects.map(obj => canvas.remove(obj));

        canvas.add(poly).renderAll();

        // Create a data object containing the areas's data
        this.recordData(areaPoints).then(data => {

            // Set the reference of our polygon  and circles  to that of our ID
            let polyObject = this.getCanvasObject('thePoly');
            let circles   = this.getCanvasObjects('areaRef-circle');
            circles.map(obj => obj.reference = `${data.id}_circle`);
            polyObject.reference = `${data.id}_poly`;
        });
    },

    deleteArea(id)
    {
        let canvas = this.get('canvas');

        // Remove the area measurement from the canvas
        let circles = this.getCanvasObjects(`${id}_circle`);
        circles.map(circle => canvas.remove(circle).renderAll());
        canvas.remove(this.getCanvasObject(`${id}_poly`)).renderAll();
    },

    unLightArea(id)
    {
        let canvas = this.get('canvas');

        let circles = this.getCanvasObjects(`${id}_circle`);
        circles.map(circle => circle.stroke = this.get('widgetColor'));
        let poly = this.getCanvasObject(`${id}_poly`);
        if (poly) {
            poly.stroke = this.get('widgetColor');
        }
        canvas.renderAll();
    },

    highLightArea(id)
    {
        let canvas = this.get('canvas');

        let circles = this.getCanvasObjects(`${id}_circle`);
        circles.map(circle => circle.stroke = this.get('highlightColor'));
        let poly = this.getCanvasObject(`${id}_poly`);
        if (poly) {
           poly.stroke =  this.get('highlightColor');
        }
        canvas.renderAll();
    }
});
