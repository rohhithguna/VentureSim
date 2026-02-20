function generateInsights(metrics) {
    var messages = [];

    if (metrics.risk > 70) {
        messages.push('Warning: Risk level is high');
    }

    if (metrics.growth < 30) {
        messages.push('Growth is weak');
    }

    if (metrics.marketFit < 40) {
        messages.push('Market demand is low');
    }

    if (metrics.runway < 3) {
        messages.push('Runway critically low');
    }

    if (metrics.revenue > 70) {
        messages.push('Revenue performing strongly');
    }

    return messages;
}

export { generateInsights };
