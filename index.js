const { calc, vector, victor, point, ipoint } = basics.vector;
import { intersection } from './vector_utils.js'
import { calculateShellNormalization } from './shell_simulation.js'
import { drawVector, drawPenSimulation, drawArmorPlane } from './draw.js'

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

/*function calculateIntermediateShell(surfaceNormal, refDir, armorStats, shellStats) {
    const refDir = calculateShellNormalization(surfaceNormal, refDir, armorStats, shellStats)
}*/

const size = 400

var surfaceNormal = [
    vector(1, 2),
    vector(1, 0),
    vector(1, 0)
] // actually -1 * surfaceNormal

for (let index = 0; index < surfaceNormal.length; index++) {
    surfaceNormal[index] = vector(() => surfaceNormal[index] / surfaceNormal[index].length);
}

var rayDir = vector(2, 2)
rayDir = vector(() => rayDir / rayDir.length);

const shellStats = {
    name: "APFSDS",
    pen: 478,
    pen60: 281,
    ricochetAngle:81
}

const armorStats = [
    {
        armorThickness: 3.7,
        thicknessMultiplier: 0.5
    },
    {
        armorThickness: 6,
        thicknessMultiplier: 0.5
    },
    {
        armorThickness: 2,
        thicknessMultiplier: 0.5
    }
]

const planeOffset = [
    vector(100, 0),
    vector(200, 0),
    vector(300, 0)
]

var calculatedShells = []
// rayDir, refDir, pointIn

window.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    const mouseY = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

    rayDir = vector(mouseX - canvas.width/2, mouseY - canvas.height/2)
    rayDir = vector(() => rayDir / rayDir.length);

    var center = vector(() => vector(canvas.width/2, canvas.height/2) - planeOffset[0])

    var pointIn = vector(() => center - surfaceNormal[0]*armorStats[0].armorThickness*3.57)
    var pointOut = vector(() => center + surfaceNormal[0]*armorStats[0].armorThickness*3.57)

    var refDir = calculateShellNormalization(surfaceNormal[0], rayDir, armorStats[0], shellStats)


    var normalPerpendicular = vector(-surfaceNormal[1].y, surfaceNormal[1].x)
    var surfacePlane = vector(() => normalPerpendicular*size)
    var armorPlane = vector(() => surfacePlane*2)
    //drawVector(armorPlane, vector(() => pointIn - surfacePlane), "blue")

    const center2 = intersection(pointIn, vector(() => refDir*size*2), vector(() => pointIn - surfacePlane + planeOffset[1]), armorPlane)

    var pointIn2 = vector(() => center2 - surfaceNormal[1]*armorStats[1].armorThickness*3.57)
    var pointOut2 = vector(() => center2 + surfaceNormal[1]*armorStats[1].armorThickness*3.57)

    var penLength = vector(() => center2-pointIn).length

    context.clearRect(0, 0, canvas.width, canvas.height);
    
    drawArmorPlane(
        context, 
        pointIn, 
        pointOut, 
        surfaceNormal[0], 
        armorStats[0].armorThickness, 
        size
    )
    drawArmorPlane(
        context,
        vector(() => pointIn + planeOffset[1]), 
        vector(() => pointIn + planeOffset[1] + surfaceNormal[1]*armorStats[1].armorThickness*3.57*2),
        surfaceNormal[1],
        armorStats[1].armorThickness,
        size
    )
    
    drawPenSimulation(context, rayDir, refDir, pointIn, surfaceNormal[0], armorStats[0], penLength, true)

    const refDir2 = calculateShellNormalization(surfaceNormal[1], refDir, armorStats[1], shellStats)


    drawPenSimulation(context, refDir, refDir2, vector(() => pointIn2+surfaceNormal[1]*armorStats[1].armorThickness*3.57), surfaceNormal[1], armorStats[1], size, false)
}, false)
