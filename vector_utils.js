import { vector } from './vector/index.js'


function intersection(v1_startPos, v1_direction, v2_startPos, v2_direction) {
    const [x1, y1] = v1_startPos;
    const [x1d, y1d] = v1_direction;
    const [x3, y3] = v2_startPos;
    const [x3d, y3d] = v2_direction;

    const x2 = x1 + x1d;
    const y2 = y1 + y1d;
    const x4 = x3 + x3d;
    const y4 = y3 + y3d;

    const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    if (denominator === 0) {
        // Lines are parallel or coincident
        return null; // No intersection
    }

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    // Now we can return the intersection point if ua and ub are valid
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        // Intersection outside the segments
        return null; // No intersection within the segments
    }

    return vector(x1 + ua * (x2 - x1), y1 + ua * (y2 - y1));
};

export { intersection }