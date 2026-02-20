function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}

function predictOutcomes(metrics) {
    var values = [
        metrics.marketFit,
        metrics.teamStrength,
        metrics.growth,
        metrics.revenue,
        100 - metrics.risk,
        100 - metrics.burnRate,
        metrics.runway,
        metrics.brand,
        metrics.scalability
    ];

    var sum = 0;
    for (var i = 0; i < values.length; i++) {
        sum = sum + values[i];
    }
    var baseScore = sum / values.length;

    return {
        bestCase: clamp(baseScore + 15, 0, 100),
        expectedCase: clamp(baseScore, 0, 100),
        worstCase: clamp(baseScore - 20, 0, 100)
    };
}

export { predictOutcomes };
