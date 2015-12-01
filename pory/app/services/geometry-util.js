import Ember from 'ember';

export default Ember.Service.extend({

    // Returns true is point is within epsilon distance from (x,y), false otherwise
    isNearEnough: function(point, x ,y, epsilon) {
      return (point.x - x) * (point.x - x)  + (point.y - y) * (point.y - y) < epsilon*epsilon;
    },

    // Polyline  defines a none intersecting contour of a polygon.
    // The polyline is a list of vertices, each one  defined as (x:x,y:y}
    // The last edge of the polygon is implicit between the first and last vertex
    // of the polyline
    // NOTE: this method does not check if polyline is a none intersecting contour
    //       it assumes that it is.
    calculatePolygonArea: function(polyline) {

        // We need a minimum of 3 vertex to define a polygone
        if (polyline.length < 3) {
          return 0;
        }

        let area = polyline.reduce(function(acc, value, index, array) {
            if  (index === 0) {
                let length = array.length;
                acc =  acc + array[length -1].x * value.y - array[length -1].y * value.x;
            } else {
                acc = acc + array[index -1].x * value.y - array[index -1].y * value.x;
            }
            return acc;
        }, 0);

        area = area / 2.0;

        // Polygone could be clock-wise or anti clock-wise
        return Math.abs(area);
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
    }

});
