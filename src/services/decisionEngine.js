function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

function processDecision(state, decision) {
    var newState = {
        ...state,
        startup: { ...state.startup },
        metrics: { ...state.metrics },
        history: [...state.history],
        insights: [...state.insights],
        futureEffects: [...state.futureEffects]
    };

    var effects = decision.effects;

    for (var key in effects) {
        if (newState.metrics.hasOwnProperty(key)) {
            newState.metrics[key] = clamp(newState.metrics[key] + effects[key], 0, 100);
        }
    }

    return newState;
}

export { processDecision };
