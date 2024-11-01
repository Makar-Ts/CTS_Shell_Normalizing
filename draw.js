const { calc, vector, victor, point, ipoint } = basics.vector;


function drawVector(context, vector, startPos = vector(0, 0), color = "black", size=1) {
    const [x, y] = vector;
    const [x0, y0] = startPos;
    const [x1, y1] = [x, y];

    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x0+x1, y0+y1);
    context.strokeStyle = color;
    context.lineWidth = size;
    context.stroke();
};

function drawPenSimulation(context, rayDir, refDir, pointIn, surfaceNormal, armorStats, size=400, drawBeforeShell=true) {
    var _rayDir = vector(() => rayDir * size)
    var _refDir = vector(() => refDir * size)

    var rayDirStartPoint_forDrawing = vector(() => pointIn-_rayDir)

    drawVector(context, vector(() => -surfaceNormal*size), pointIn, "green")
    if (drawBeforeShell) {
        drawVector(context, _rayDir, rayDirStartPoint_forDrawing, "lime", 4)
    }

    var armorThicknessAfterNormalization = armorStats.armorThickness*3.57 / Math.cos(calc(() => refDir.angleTo(surfaceNormal)))
    var insideArmorPath = vector(() => refDir*armorThicknessAfterNormalization*2)
    var afterPenPathPoint = vector(() => pointIn+insideArmorPath)

    drawVector(context, insideArmorPath, pointIn, "pink", 4)
    drawVector(context, vector(() => _refDir*(1-insideArmorPath.length/_refDir.length)), afterPenPathPoint, "red", 4)
}

function drawArmorPlane(context, pointIn, pointOut, surfaceNormal, armorThickness, size=400) {
    var normalPerpendicular = vector(-surfaceNormal.y, surfaceNormal.x)
    var surfacePlane = vector(() => normalPerpendicular*size)
    var armorPlane = vector(() => surfacePlane*2)
    drawVector(context, armorPlane, vector(() => pointIn - surfacePlane), "blue")

    drawVector(context, armorPlane, vector(() => pointOut - surfacePlane), "blue")

    const to = Math.ceil(armorPlane.length / 20)
    for (var i = 0; i < to; i++) {
        var line = vector(() => -surfaceNormal*armorThickness*3.57*2-normalPerpendicular*0)
        var start = vector(() => pointOut - surfacePlane + armorPlane*(i / to))

        drawVector(context, line, start, "blue")
    }
}


export { drawVector, drawPenSimulation, drawArmorPlane }