/**
 * Expectation Scaling: Business Scale Multiplier
 * 
 * Uses logarithmic normalization on raw review and photo volumes 
 * to prevent massive mega-brands from monopolizing the local execution score.
 */

function calculateBusinessScale(reviewCount = 0, photoCount = 0) {
    // Combine raw interaction volume (photos weighted slightly higher for effort)
    const rawVolume = reviewCount + (photoCount * 2);

    // Logarithmic scale prevents linear inflation.
    // e.g. 10 vol   -> log10(10)   = 1.0 (Multiplier ~ 1.0)
    // e.g. 100 vol  -> log10(100)  = 2.0 (Multiplier ~ 0.76)
    // e.g. 1000 vol -> log10(1000) = 3.0 (Multiplier ~ 0.53)
    // e.g. 10000 vol-> log10(10000)= 4.0 (Multiplier ~ 0.3)

    const logScale = Math.log10(Math.max(10, rawVolume)); // Ground floor at 10

    // Slope mapping: log 1 -> 1.0 multiplier, log 4 -> 0.3 multiplier
    // Equation: M = 1.0 - ((log - 1) * 0.233)
    let multiplier = 1.0 - ((logScale - 1) * 0.233);

    // Constrain strict geometric bounds
    multiplier = Math.max(0.3, Math.min(1.0, multiplier));

    return {
        scaleMultiplier: Number(multiplier.toFixed(2)),
        rawVolumeLog: Number(logScale.toFixed(2))
    };
}

module.exports = { calculateBusinessScale };
