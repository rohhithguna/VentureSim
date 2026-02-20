function analyzeStartup(state) {
    var metrics = state.metrics;
    var healthStatus = 'Moderate';

    if (metrics.risk > 70) {
        healthStatus = 'Unstable';
    } else if (metrics.growth > 70 && metrics.risk < 40) {
        healthStatus = 'Healthy';
    }

    var warnings = [];
    if (metrics.runway < 3) warnings.push('Low runway');
    if (metrics.risk > 60) warnings.push('Risk rising');
    if (metrics.growth < 30) warnings.push('Growth slowing');

    var metricNames = {
        marketFit: 'Market Fit',
        teamStrength: 'Team Strength',
        growth: 'Growth',
        revenue: 'Revenue',
        risk: 'Risk',
        burnRate: 'Burn Rate',
        runway: 'Runway',
        brand: 'Brand',
        scalability: 'Scalability'
    };

    var strengths = [];
    var weaknesses = [];

    var keys = Object.keys(metricNames);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = metrics[key];
        var name = metricNames[key];
        if (val > 70) strengths.push(name);
        if (val < 30) weaknesses.push(name);
    }

    return {
        healthStatus: healthStatus,
        warnings: warnings,
        strengths: strengths,
        weaknesses: weaknesses
    };
}

export { analyzeStartup };
