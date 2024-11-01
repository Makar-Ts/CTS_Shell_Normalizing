const { calc, vector, victor, point, ipoint } = basics.vector;


const radians = (deg) => deg * Math.PI / 180.0
const degrees = (rad) => (rad * 180.0) / Math.PI

function getAPFSDSIndex(angle, index60, normalThickness, shellPenetration) {
    var angleIndex = 1 + (angle / 60) * (index60 - 1)
    var normalizedThickness = normalThickness / Math.cos(radians(angle))  / shellPenetration
    return 1 + normalizedThickness * (angleIndex - 1)
}

function getOtherIndex(ricochetAngle, angle, normalThickness, shellPenetration) {
    var ricochetIndex = Math.sin(radians(ricochetAngle))
    var normalizedThickness = normalThickness / Math.cos(radians(angle)) / shellPenetration
    return 1 + normalizedThickness * (ricochetIndex - 1)
}

function calculateShellNormalization(surfaceNormal, rayDir, armorStats, shellStats) {
    const ammo = shellStats.name
    const pen = shellStats.pen
    const pen60 = shellStats.pen60
    const ricochetAngle = shellStats.ricochetAngle

    const armorNormalThickness = armorStats.armorThickness
    const armorThicknessMultiplier = armorStats.thicknessMultiplier
    const normalThickness = armorNormalThickness * 3.57 * 280.112 / armorThicknessMultiplier

    const crossNormCalc = rayDir.dot(surfaceNormal);
    const hitAngle = Math.acos(crossNormCalc)
    const angleDeg = degrees(hitAngle)

    if (ammo == "APFSDS") {
        var index60 = 
            (
                pen60*2
            ) / pen
        
        var index = Math.pow(getAPFSDSIndex(
            angleDeg, 
            index60, 
            normalThickness, 
            pen
        ), -1)
    } else {
        var index = Math.pow(getOtherIndex(
            ricochetAngle, 
            angleDeg, 
            normalThickness, 
            pen
        ), -1)
    }

    var minDeflectionAngle = 10
    if (angleDeg > minDeflectionAngle) {
        var refDir = calc(() => 
            Math.sqrt(
                1
                    -
                    Math.pow(index, 2)
                        *
                    (
                        1
                            -
                        Math.pow((surfaceNormal.dot(rayDir)), 2)
                    )
            )
                *
            surfaceNormal
                +
            index
                *
            (
                rayDir
                    -
                    (surfaceNormal.dot(rayDir))
                        *
                    surfaceNormal
            )
        )
    } else {
        var refDir = rayDir
    }
    console.log(`index: ${index}, angle: ${angleDeg}, rayDir: ${rayDir}, refDir: ${refDir}`)

    return refDir
}


export { calculateShellNormalization }