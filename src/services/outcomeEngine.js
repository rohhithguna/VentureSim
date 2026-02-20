function checkFailure(metrics, capital) {
    if (capital <= 0) return true;
    if (metrics.risk > 90) return true;
    if (metrics.growth < 10) return true;
    return false;
}

function checkSuccess(metrics) {
    if (metrics.growth > 80 && metrics.risk < 40 && metrics.revenue > 50) {
        return true;
    }
    return false;
}

export { checkFailure, checkSuccess };
