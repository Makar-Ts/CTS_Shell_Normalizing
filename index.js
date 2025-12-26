import { vector } from './vector/index.js'
import { intersection } from './vector_utils.js'
import { calculateShellNormalization } from './shell_simulation.js'
import { drawVector, drawPenSimulation, drawArmorPlane } from './draw.js'

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

/*function calculateIntermediateShell(surfaceNormal, refDir, armorStats, shellStats) {
    const refDir = calculateShellNormalization(surfaceNormal, refDir, armorStats, shellStats)
}*/

const size = 400

// DO NOT TRY ENABLING MORE THAN 2 ARMOR PLANES! ITS NOT WORKING (yet)
var surfaceNormal = [
    vector(1, 2),
    vector(1, 0)/*,
    vector(1, 2),
    vector(2, 2)*/
] // actually -1 * surfaceNormal

for (let index = 0; index < surfaceNormal.length; index++) {
    surfaceNormal[index] = vector(() => surfaceNormal[index] / surfaceNormal[index].length);
}

var rayDir = vector(2, 2)
rayDir = vector(() => rayDir / rayDir.length);

var shellStats = {
    name: "APFSDS",
    pen: 478,
    pen60: 281,
    ricochetAngle:81
}

var armorStats = [
    {
        armorThickness: 3.7,
        thicknessMultiplier: 0.5
    },
    {
        armorThickness: 6,
        thicknessMultiplier: 0.5
    }/*,
    {
        armorThickness: 6,
        thicknessMultiplier: 0.5
    },
    {
        armorThickness: 4,
        thicknessMultiplier: 0.5
    }*/
]

var planeOffset = [
    vector(100, 100),
    vector(300, 200)/*,
    vector(400, 180),
    vector(400, 300)*/
]
// rayDir, refDir, pointIn

draw(rayDir)


window.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    const mouseY = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

    if (mouseX < 0 || 
        mouseY < 0 ||
        mouseX > canvas.width ||
        mouseY > canvas.height) {
            return;
    }

    rayDir = vector(mouseX - canvas.width/2, mouseY - canvas.height/2)
    rayDir = vector(() => rayDir / rayDir.length);

    draw(rayDir)
}, false)


function draw(rayDir) {
    var calculatedShells = []

    var center = vector(() => vector(canvas.width/2, canvas.height/2) - planeOffset[0])

    var pointIn = vector(() => center - surfaceNormal[0]*armorStats[0].armorThickness*3.57)
    var pointOut = vector(() => center + surfaceNormal[0]*armorStats[0].armorThickness*3.57)

    var refDir = calculateShellNormalization(surfaceNormal[0], rayDir, armorStats[0], shellStats)

    calculatedShells.push({
        pointIn: pointIn,
        refDir: refDir,
        penLength: 0
    })

    for (let index = 1; index < armorStats.length; index++) {
        var normalPerpendicular = vector(-surfaceNormal[index].y, surfaceNormal[index].x)
        var surfacePlane = vector(() => normalPerpendicular*size)
        var armorPlane = vector(() => surfacePlane*2)
        //drawVector(context, armorPlane, vector(() => pointIn - surfacePlane), "green", 10)

        const center2 = intersection(calculatedShells[index-1].pointIn, vector(() => calculatedShells[index-1].refDir*size*2), vector(() => calculatedShells[0].pointIn - surfacePlane + planeOffset[index]), armorPlane)

        if (center2 == null) {
            break;
        }

        var pointIn2 = vector(() => center2 - surfaceNormal[index]*armorStats[index].armorThickness*3.57)
        var pointOut2 = vector(() => center2 + surfaceNormal[index]*armorStats[index].armorThickness*3.57)

        var penLength = vector(() => center2-calculatedShells[index-1].pointIn).length

        const refDir2 = calculateShellNormalization(surfaceNormal[index], refDir, armorStats[index], shellStats)

        calculatedShells.push({
            pointIn: pointIn2,
            refDir: refDir2,
            penLength: penLength
        })
    }



    context.clearRect(0, 0, canvas.width, canvas.height);
    
    var offset = vector()
    for (let index = 0; index < planeOffset.length; index++) {
        if (index == 0) {
            var pIn = pointIn
            var pOut = vector(() => pIn  + surfaceNormal[index]*armorStats[index].armorThickness*3.57*2)
        } else {
            offset = vector(() => offset + surfaceNormal[index]*armorStats[index].armorThickness*3.57)

            var pIn = vector(() => calculatedShells[0].pointIn + planeOffset[index])
            var pOut = vector(() => calculatedShells[0].pointIn  + planeOffset[index] + surfaceNormal[index]*armorStats[index].armorThickness*3.57*2)
        }
        
        drawArmorPlane(
            context,
            pIn, 
            pOut,
            surfaceNormal[index],
            armorStats[index].armorThickness,
            size
        )
    }

    drawPenSimulation(
        context, 
        rayDir, 
        refDir, 
        pointIn, 
        surfaceNormal[0], 
        armorStats[0], 
        calculatedShells[1] ? calculatedShells[1].penLength : size, 
        true
    )
    if (refDir.x == 0 && refDir.y == 0) {
        return
    }

    offset = vector()
    for (let index = 1; index < calculatedShells.length; index++) {
        if (calculatedShells[index].refDir.x == 0 && calculatedShells[index].refDir.y == 0) {
            break
        }

        offset = vector(() => offset + surfaceNormal[index]*armorStats[index].armorThickness*3.57)

        drawPenSimulation(
            context, 
            calculatedShells[index-1].refDir, 
            calculatedShells[index].refDir, 
            vector(() => calculatedShells[index].pointIn+offset), 
            surfaceNormal[index], 
            armorStats[index], 
            calculatedShells[index+1] ? calculatedShells[index+1].penLength : size, 
            false
        )
    }
}


//Im tired boss
document.addEventListener("DOMContentLoaded", () => {
    const ammoTypeSelect = document.getElementById("ammoType");
    ammoTypeSelect.addEventListener("change", () => {
        shellStats.name = ammoTypeSelect.value;
        draw(rayDir)
    });


    const pen0Input = document.getElementById("pen0");
    const pen60Input = document.getElementById("pen60");
    const ricAngleInput = document.getElementById("ric_angle");

    pen0Input.addEventListener("input", () => {
        shellStats.pen = parseFloat(pen0Input.value);
        draw(rayDir)
    });

    pen60Input.addEventListener("input", () => {
        shellStats.pen60 = parseFloat(pen60Input.value);
        draw(rayDir)
    });

    ricAngleInput.addEventListener("input", () => {
        shellStats.ricochetAngle = parseFloat(ricAngleInput.value);
        draw(rayDir)
    });


    const nx1Input = document.getElementById("nx_1");
    const ny1Input = document.getElementById("ny_1");
    const px1Input = document.getElementById("px_1");
    const py1Input = document.getElementById("py_1");
    const thick1Input = document.getElementById("thick_1");
    const mult1Input = document.getElementById("mult_1");

    nx1Input.addEventListener("input", () => {
        surfaceNormal[0] = vector(parseFloat(nx1Input.value), parseFloat(ny1Input.value));

        for (let index = 0; index < surfaceNormal.length; index++) {
            surfaceNormal[index] = vector(() => surfaceNormal[index] / surfaceNormal[index].length);
        }

        draw(rayDir)
    });

    ny1Input.addEventListener("input", () => {
        surfaceNormal[0] = vector(parseFloat(nx1Input.value), parseFloat(ny1Input.value));

        for (let index = 0; index < surfaceNormal.length; index++) {
            surfaceNormal[index] = vector(() => surfaceNormal[index] / surfaceNormal[index].length);
        }

        draw(rayDir)
    });

    px1Input.addEventListener("input", () => {
        planeOffset[0] = vector(parseFloat(px1Input.value), parseFloat(py1Input.value));
        draw(rayDir)
    });

    py1Input.addEventListener("input", () => {
        planeOffset[0] = vector(parseFloat(px1Input.value), parseFloat(py1Input.value));
        draw(rayDir)
    });

    thick1Input.addEventListener("input", () => {
        armorStats[0].armorThickness = parseFloat(thick1Input.value);
        draw(rayDir)
    });

    mult1Input.addEventListener("input", () => {
        armorStats[0].thicknessMultiplier = parseFloat(mult1Input.value);
        draw(rayDir)
    });


    const nx2Input = document.getElementById("nx_2");
    const ny2Input = document.getElementById("ny_2");
    const px2Input = document.getElementById("px_2");
    const py2Input = document.getElementById("py_2");
    const thick2Input = document.getElementById("thick_2");
    const mult2Input = document.getElementById("mult_2");

    nx2Input.addEventListener("input", () => {
        surfaceNormal[1] = vector(parseFloat(nx2Input.value), parseFloat(ny2Input.value));

        for (let index = 0; index < surfaceNormal.length; index++) {
            surfaceNormal[index] = vector(() => surfaceNormal[index] / surfaceNormal[index].length);
        }

        draw(rayDir)
    });

    ny2Input.addEventListener("input", () => {
        surfaceNormal[1] = vector(parseFloat(nx2Input.value), parseFloat(ny2Input.value));

        for (let index = 0; index < surfaceNormal.length; index++) {
            surfaceNormal[index] = vector(() => surfaceNormal[index] / surfaceNormal[index].length);
        }

        draw(rayDir)
    });

    px2Input.addEventListener("input", () => {
        planeOffset[1] = vector(parseFloat(px2Input.value), parseFloat(py2Input.value));
        draw(rayDir)
    });

    py2Input.addEventListener("input", () => {
        planeOffset[1] = vector(parseFloat(px2Input.value), parseFloat(py2Input.value));
        draw(rayDir)
    });

    thick2Input.addEventListener("input", () => {
        armorStats[1].armorThickness = parseFloat(thick2Input.value);
        draw(rayDir)
    });

    mult2Input.addEventListener("input", () => {
        armorStats[1].thicknessMultiplier = parseFloat(mult2Input.value);
        draw(rayDir)
    });
});