import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';

function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}

var LAYERS = [
    {
        id: 'demand',
        title: 'Demand Reality',
        number: 1,
        inputs: [
            { id: 'frequency', label: 'Problem Frequency Index', desc: 'How often do target customers encounter this problem?', low: 'Rare', high: 'Daily' },
            { id: 'severity', label: 'Problem Severity Level', desc: 'How painful is this problem when it occurs?', low: 'Minor', high: 'Critical' },
            { id: 'growth', label: 'Demand Growth Trend', desc: 'Is market demand for this solution accelerating?', low: 'Declining', high: 'Surging' },
            { id: 'timing', label: 'Market Timing Readiness', desc: 'Is the market ready to adopt this type of solution now?', low: 'Too Early', high: 'Perfect' }
        ]
    },
    {
        id: 'customer',
        title: 'Customer Behavior',
        number: 2,
        inputs: [
            { id: 'switching', label: 'Switching Willingness', desc: 'How willing are customers to leave current solutions?', low: 'Resistant', high: 'Eager' },
            { id: 'budget', label: 'Budget Availability', desc: 'Do target customers have allocated budget for this?', low: 'None', high: 'Abundant' },
            { id: 'adoption', label: 'Adoption Speed', desc: 'How quickly will customers onboard and use the product?', low: 'Slow', high: 'Instant' },
            { id: 'priceSensitivity', label: 'Price Sensitivity', desc: 'How sensitive is your market to pricing changes?', low: 'Inelastic', high: 'Very Elastic' }
        ]
    },
    {
        id: 'competition',
        title: 'Competitive Landscape',
        number: 3,
        inputs: [
            { id: 'density', label: 'Competitor Density', desc: 'How many direct competitors exist in this space?', low: 'None', high: 'Crowded' },
            { id: 'differentiation', label: 'Differentiation Strength', desc: 'How unique is your offering versus alternatives?', low: 'Generic', high: 'Unique' },
            { id: 'saturation', label: 'Market Saturation', desc: 'How saturated is the market with existing solutions?', low: 'Empty', high: 'Saturated' },
            { id: 'brandLoyalty', label: 'Brand Loyalty Barrier', desc: 'How loyal are customers to existing brands?', low: 'None', high: 'Locked In' }
        ]
    },
    {
        id: 'viability',
        title: 'Market Viability',
        number: 4,
        inputs: [
            { id: 'entryBarrier', label: 'Entry Barrier Level', desc: 'How difficult is it to enter this market?', low: 'Open', high: 'Fortress' },
            { id: 'regulation', label: 'Regulation Difficulty', desc: 'How heavily regulated is this industry?', low: 'None', high: 'Heavy' },
            { id: 'distribution', label: 'Distribution Complexity', desc: 'How complex is it to deliver the product to customers?', low: 'Simple', high: 'Complex' },
            { id: 'scalability', label: 'Scalability Potential', desc: 'How easily can the business scale operations?', low: 'Limited', high: 'Infinite' }
        ]
    }
];

var ALL_INPUTS = [];
LAYERS.forEach(function (layer) {
    layer.inputs.forEach(function (input) {
        ALL_INPUTS.push(input);
    });
});

function getConfidenceLabel(pct) {
    if (pct <= 25) return 'Low Confidence';
    if (pct <= 50) return 'Preliminary';
    if (pct <= 75) return 'Reliable';
    return 'High Precision';
}

function getInsightLines(demand, customer, competition, difficulty, opportunity) {
    var lines = [];

    if (demand >= 70 && competition < 40) {
        lines.push('Favorable entry window detected.');
    } else if (demand >= 70 && competition >= 60) {
        lines.push('Opportunity exists but differentiation required.');
    } else if (demand < 40) {
        lines.push('Market demand insufficient for sustainable growth.');
    } else {
        lines.push('Moderate demand signal — validation recommended before scaling.');
    }

    if (customer >= 70) {
        lines.push('Customer readiness is strong — adoption likely.');
    } else if (customer < 40) {
        lines.push('Customer resistance detected — onboarding strategy critical.');
    }

    if (difficulty >= 65) {
        lines.push('High execution barriers — requires significant resources.');
    } else if (difficulty < 30) {
        lines.push('Low execution barriers — rapid market entry possible.');
    }

    if (opportunity >= 70) {
        lines.push('High-potential market identified — strong strategic fit.');
    } else if (opportunity < 35) {
        lines.push('Limited opportunity window — consider pivot or niche focus.');
    }

    return lines;
}

function MarketPage() {
    var { state, setState } = useStartup();
    var navigate = useNavigate();
    var containerRef = useRef(null);

    var defaultValues = {};
    ALL_INPUTS.forEach(function (input) {
        defaultValues[input.id] = 50;
    });

    var valuesState = useState(defaultValues);
    var values = valuesState[0];
    var setValues = valuesState[1];

    var activeLayerState = useState(0);
    var activeLayer = activeLayerState[0];
    var setActiveLayer = activeLayerState[1];

    var activeQState = useState(0);
    var activeQ = activeQState[0];
    var setActiveQ = activeQState[1];

    var interactedState = useState({});
    var interacted = interactedState[0];
    var setInteracted = interactedState[1];

    var insightVisState = useState(true);
    var insightVisible = insightVisState[0];
    var setInsightVisible = insightVisState[1];

    useEffect(function () {
        document.body.classList.add('ma-no-scroll');
        return function () {
            document.body.classList.remove('ma-no-scroll');
        };
    }, []);

    var handleMouseMove = useCallback(function (e) {
        if (containerRef.current) {
            var rect = containerRef.current.getBoundingClientRect();
            var xPct = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            var yPct = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            containerRef.current.style.setProperty('--mx', xPct.toFixed(3));
            containerRef.current.style.setProperty('--my', yPct.toFixed(3));
        }
    }, []);

    function handleSliderChange(inputId, newValue, layerIdx, qIdx) {
        var updated = {};
        for (var key in values) updated[key] = values[key];
        updated[inputId] = Number(newValue);
        setValues(updated);

        if (!interacted[inputId]) {
            var ui = {};
            for (var k in interacted) ui[k] = interacted[k];
            ui[inputId] = true;
            setInteracted(ui);

            var layerInputs = LAYERS[layerIdx].inputs;
            var allLayerDone = layerInputs.every(function (inp) {
                return inp.id === inputId || ui[inp.id];
            });
            if (allLayerDone && layerIdx < LAYERS.length - 1) {
                setTimeout(function () {
                    setActiveLayer(layerIdx + 1);
                    setActiveQ(0);
                }, 400);
            } else if (qIdx < layerInputs.length - 1) {
                setTimeout(function () {
                    setActiveQ(qIdx + 1);
                }, 200);
            }
        }

        setActiveLayer(layerIdx);
        setActiveQ(qIdx);

        setInsightVisible(false);
        setTimeout(function () { setInsightVisible(true); }, 150);
    }

    function handleQuestionClick(layerIdx, qIdx) {
        setActiveLayer(layerIdx);
        setActiveQ(qIdx);
    }

    function handleLayerClick(layerIdx) {
        setActiveLayer(layerIdx);
        setActiveQ(0);
    }

    var v = values;

    var demandScore = clamp(Math.round(
        v.frequency * 0.25 + v.severity * 0.25 + v.growth * 0.25 + v.timing * 0.25
    ), 0, 100);

    var customerReadiness = clamp(Math.round(
        v.switching * 0.25 + v.budget * 0.25 + v.adoption * 0.25 + (100 - v.priceSensitivity) * 0.25
    ), 0, 100);

    var competitivePressure = clamp(Math.round(
        v.density * 0.25 + (100 - v.differentiation) * 0.25 + v.saturation * 0.25 + v.brandLoyalty * 0.25
    ), 0, 100);

    var executionDifficulty = clamp(Math.round(
        v.entryBarrier * 0.33 + v.regulation * 0.33 + v.distribution * 0.34
    ), 0, 100);

    var opportunityIndex = clamp(Math.round(
        demandScore + customerReadiness - competitivePressure - executionDifficulty + v.scalability
    ), 0, 100);

    var gauges = [
        { label: 'Demand Score', value: demandScore },
        { label: 'Customer Readiness', value: customerReadiness },
        { label: 'Competitive Pressure', value: competitivePressure },
        { label: 'Execution Difficulty', value: executionDifficulty },
        { label: 'Opportunity Index', value: opportunityIndex }
    ];

    var insightLines = getInsightLines(demandScore, customerReadiness, competitivePressure, executionDifficulty, opportunityIndex);

    var interactedCount = 0;
    ALL_INPUTS.forEach(function (inp) { if (interacted[inp.id]) interactedCount++; });
    var confidencePct = Math.round((interactedCount / 16) * 100);
    var confidenceLabel = getConfidenceLabel(confidencePct);
    var allInteracted = interactedCount === 16;

    function getLayerDoneCount(layer) {
        var c = 0;
        layer.inputs.forEach(function (inp) { if (interacted[inp.id]) c++; });
        return c;
    }

    function handleContinue() {
        var mf = clamp(Math.round((demandScore * 0.35 + customerReadiness * 0.30 + opportunityIndex * 0.35)), 0, 100);
        var brand = clamp(Math.round(opportunityIndex * 0.5 + customerReadiness * 0.5), 0, 100);
        var scal = clamp(Math.round((v.scalability * 0.4 + demandScore * 0.3 + customerReadiness * 0.3)), 0, 100);

        setState({
            ...state,
            metrics: {
                ...state.metrics,
                marketFit: mf,
                brand: brand,
                scalability: scal
            }
        });
        navigate('/finance');
    }

    return (
        <div className="ma-ambient" ref={containerRef} onMouseMove={handleMouseMove}>
            <div className="ma-ambient-bg"></div>

            <div className="ma-layout">

                <div className="ma-progress-rail">
                    <div className="ma-progress-label">Analysis Progress</div>
                    <div className="ma-progress-dots">
                        {ALL_INPUTS.map(function (input, i) {
                            var done = interacted[input.id];
                            var globalActive = false;
                            var count = 0;
                            for (var li = 0; li < LAYERS.length; li++) {
                                for (var qi = 0; qi < LAYERS[li].inputs.length; qi++) {
                                    if (li === activeLayer && qi === activeQ && count === i) globalActive = true;
                                    count++;
                                }
                            }
                            return (
                                <div
                                    key={input.id}
                                    className={'ma-dot' + (done ? ' ma-dot-done' : '') + (globalActive ? ' ma-dot-active' : '')}
                                    title={input.label}
                                >
                                    <span className="ma-dot-num">{i + 1}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="ma-confidence">
                        <span className="ma-confidence-pct">{confidencePct}%</span>
                        <span className="ma-confidence-label">{confidenceLabel}</span>
                    </div>
                </div>

                <div className="ma-center">
                    <div className="ma-questions-col">
                        <div className="ma-questions-header">
                            <h1 className="ma-title">Market Analysis Engine</h1>
                            <p className="ma-subtitle">Multi-layer strategic intelligence system</p>
                        </div>
                        <div className="ma-questions-stack">
                            {LAYERS.map(function (layer, layerIdx) {
                                var isActiveLayer = activeLayer === layerIdx;
                                var layerDone = getLayerDoneCount(layer);
                                var layerComplete = layerDone === layer.inputs.length;
                                return (
                                    <div
                                        key={layer.id}
                                        className={'ma-layer' + (isActiveLayer ? ' ma-layer-active' : '') + (layerComplete ? ' ma-layer-complete' : '')}
                                    >
                                        <div className="ma-layer-header" onClick={function () { handleLayerClick(layerIdx); }}>
                                            <span className="ma-layer-num">{'L' + layer.number}</span>
                                            <span className="ma-layer-title">{layer.title}</span>
                                            <span className="ma-layer-count">{layerDone}/{layer.inputs.length}</span>
                                            {layerComplete && <span className="ma-layer-check">✓</span>}
                                        </div>
                                        {isActiveLayer && (
                                            <div className="ma-layer-body">
                                                {layer.inputs.map(function (input, qIdx) {
                                                    var isActiveQuestion = activeQ === qIdx;
                                                    var isDone = interacted[input.id];
                                                    var globalIdx = 0;
                                                    for (var li = 0; li < layerIdx; li++) globalIdx += LAYERS[li].inputs.length;
                                                    globalIdx += qIdx;
                                                    return (
                                                        <div
                                                            key={input.id}
                                                            className={'ma-q-card' + (isActiveQuestion ? ' ma-q-active' : '') + (isDone && !isActiveQuestion ? ' ma-q-done' : '')}
                                                            onClick={function () { handleQuestionClick(layerIdx, qIdx); }}
                                                        >
                                                            <div className="ma-q-top">
                                                                <span className="ma-q-index">{String(globalIdx + 1).padStart(2, '0')}</span>
                                                                <span className="ma-q-label">{input.label}</span>
                                                                {isDone && !isActiveQuestion && <span className="ma-q-check">✓</span>}
                                                            </div>
                                                            {isActiveQuestion && (
                                                                <div className="ma-q-expanded">
                                                                    <p className="ma-q-desc">{input.desc}</p>
                                                                    <div className="ma-slider-wrap">
                                                                        <span className="ma-slider-bound">{input.low}</span>
                                                                        <div className="ma-slider-container">
                                                                            <input
                                                                                type="range"
                                                                                min="0"
                                                                                max="100"
                                                                                value={values[input.id]}
                                                                                className="ma-slider"
                                                                                onChange={function (e) { handleSliderChange(input.id, e.target.value, layerIdx, qIdx); }}
                                                                            />
                                                                            <div className="ma-slider-fill" style={{ width: values[input.id] + '%' }}></div>
                                                                        </div>
                                                                        <span className="ma-slider-bound">{input.high}</span>
                                                                        <span className="ma-slider-val">{values[input.id]}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="ma-intel-col">
                        <div className="ma-intel-panel">
                            <div className="ma-intel-header">
                                <span className="ma-intel-dot"></span>
                                <span className="ma-intel-title">Intelligence Meter</span>
                            </div>
                            <div className="ma-gauges">
                                {gauges.map(function (g) {
                                    return (
                                        <div className="ma-gauge" key={g.label}>
                                            <div className="ma-gauge-row">
                                                <span className="ma-gauge-label">{g.label}</span>
                                                <span className="ma-gauge-val">{g.value}</span>
                                            </div>
                                            <div className="ma-gauge-track">
                                                <div className="ma-gauge-fill" style={{ width: g.value + '%' }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {allInteracted && (
                            <button className="ma-continue" onClick={handleContinue}>
                                Continue to Finance
                                <span className="ma-continue-arrow">→</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className={'ma-insight-bar' + (insightVisible ? ' ma-insight-visible' : '')}>
                    <span className="ma-insight-icon">◈</span>
                    <div className="ma-insight-lines">
                        {insightLines.map(function (line, i) {
                            return <span key={i} className="ma-insight-line">{line}</span>;
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MarketPage;
