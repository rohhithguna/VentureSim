import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { phases } from '../data/phases';
import { decisions } from '../data/decisions';
import { processDecision } from '../services/decisionEngine';

import { checkFailure, checkSuccess } from '../services/outcomeEngine';
import { generateInsights } from '../services/insightsEngine';
import { generateRandomEvent } from '../services/eventEngine';

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function useOnMount(fn) {
    
    useEffect(fn, []);
}

function useAnimatedProgress(target, duration) {
    var [value, setValue] = useState(0);
    var frame = useRef(null);
    useEffect(function () {
        var start = null;
        var from = 0;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            var ease = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(from + (target - from) * ease));
            if (p < 1) frame.current = requestAnimationFrame(step);
        }
        if (frame.current) cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(step);
        return function () { if (frame.current) cancelAnimationFrame(frame.current); };
    }, [target, duration]);
    return value;
}

function InsightStrip({ metrics, healthScore }) {
    var [visible, setVisible] = useState(false);
    useOnMount(function () { setTimeout(function () { setVisible(true); }, 50); });

    function generateSentence() {
        var mf = metrics.marketFit || 0;
        var gr = metrics.growth || 0;
        var rw = metrics.runway || 0;
        var risk = metrics.risk || 0;
        var rev = metrics.revenue || 0;
        var ts = metrics.teamStrength || 0;

        if (rw < 15 && rw > 0) return 'Runway risk detected — capital reserves are approaching a critical threshold.';
        if (risk > 70) return 'Elevated risk exposure detected. Structural intervention recommended before next phase.';
        if (mf > 65 && gr < 25) return 'Demand signal is strong, but execution capacity is insufficient to capture market share.';
        if (mf > 65 && ts > 60) return 'Market demand and team execution are aligned — scaling conditions are approaching viability.';
        if (gr > 60 && rev < 30) return 'Growth trajectory outpaces revenue capture. Monetization optimization is the priority lever.';
        if (gr < 20 && mf < 30) return 'Both market fit and growth are below threshold. Product-market alignment requires immediate attention.';
        if (healthScore > 75) return 'System indicators stable. Capital efficiency and growth compound favorably at current trajectory.';
        if (healthScore > 50) return 'Core metrics are within operational parameters. Risk management is the next strategic priority.';
        return 'Simulation active. Make decisions below to advance your startup through each phase.';
    }

    return (
        <div className={'dp-strip' + (visible ? ' dp-strip-visible' : '')}>
            <span className="dp-strip-pulse" />
            <span className="dp-strip-text">{generateSentence()}</span>
        </div>
    );
}

function HealthDial({ score }) {
    var animated = useAnimatedProgress(score, 1200);
    var r = 58;
    var circ = 2 * Math.PI * r;
    var dash = (animated / 100) * circ;

    function verdictLabel(s) {
        if (s >= 76) return 'Strong';
        if (s >= 51) return 'Stable';
        if (s >= 26) return 'Weak';
        return 'Critical';
    }

    return (
        <div className="dp-dial-wrap">
            <svg width="140" height="140" viewBox="0 0 140 140" className="dp-dial-svg">
                <defs>
                    <linearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0F172A" />
                        <stop offset="100%" stopColor="#334155" />
                    </linearGradient>
                </defs>
                <circle cx="70" cy="70" r={r} fill="none" stroke="#E2E8F0" strokeWidth="7" />
                <circle
                    cx="70" cy="70" r={r}
                    fill="none"
                    stroke="url(#dialGrad)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    strokeDashoffset={circ * 0.25}
                    style={{ transition: 'stroke-dasharray 80ms linear' }}
                />
                <text x="70" y="66" textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="700" fill="#0F172A" fontFamily="Inter, system-ui">
                    {animated}
                </text>
                <text x="70" y="86" textAnchor="middle" fontSize="10" fontWeight="500" fill="#475569" fontFamily="Inter, system-ui" letterSpacing="0.05em">
                    HEALTH
                </text>
            </svg>
            <div className="dp-dial-verdict">{verdictLabel(score)}</div>
        </div>
    );
}

function StabilityMap({ marketDemand, executionStrength }) {
    var [plotted, setPlotted] = useState(false);
    useOnMount(function () { setTimeout(function () { setPlotted(true); }, 400); });

    var x = clamp((marketDemand / 100) * 0.8 + 0.1, 0.1, 0.9);
    var y = clamp(1 - ((executionStrength / 100) * 0.8 + 0.1), 0.1, 0.9);

    var W = 220; var H = 180;
    var px = x * W;
    var py = y * H;

    function quadrant() {
        if (marketDemand > 50 && executionStrength > 50) return 'Ideal Position';
        if (marketDemand <= 50 && executionStrength > 50) return 'Execution Gap';
        if (marketDemand > 50 && executionStrength <= 50) return 'Market Misfit';
        return 'High Risk';
    }

    return (
        <div className="dp-map-wrap">
            <div className="dp-map-title">STABILITY MAP</div>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="dp-map-svg">
                
                <rect x="0" y="0" width={W / 2} height={H / 2} fill="rgba(0,0,0,0.015)" />
                <rect x={W / 2} y="0" width={W / 2} height={H / 2} fill="rgba(0,0,0,0.03)" />
                <rect x="0" y={H / 2} width={W / 2} height={H / 2} fill="rgba(0,0,0,0.03)" />
                <rect x={W / 2} y={H / 2} width={W / 2} height={H / 2} fill="rgba(0,0,0,0.015)" />

                <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="#E2E8F0" strokeWidth="1" />
                <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#E2E8F0" strokeWidth="1" />

                <text x={W * 0.75} y="12" textAnchor="middle" fontSize="8" fill="#475569" fontFamily="Inter, system-ui" fontWeight="600">IDEAL</text>
                <text x={W * 0.25} y="12" textAnchor="middle" fontSize="8" fill="#94A3B8" fontFamily="Inter, system-ui">EXEC GAP</text>
                <text x={W * 0.75} y={H - 5} textAnchor="middle" fontSize="8" fill="#94A3B8" fontFamily="Inter, system-ui">MARKET MISFIT</text>
                <text x={W * 0.25} y={H - 5} textAnchor="middle" fontSize="8" fill="#CBD5E1" fontFamily="Inter, system-ui">HIGH RISK</text>

                <text x={W / 2} y={H + 0} textAnchor="middle" fontSize="8" fill="#94A3B8" fontFamily="Inter, system-ui">← Market Demand →</text>

                <circle
                    cx={px}
                    cy={py}
                    r="6"
                    fill="#0F172A"
                    opacity={plotted ? 1 : 0}
                    style={{ transition: 'opacity 400ms ease, cx 600ms cubic-bezier(0.22,1,0.36,1), cy 600ms cubic-bezier(0.22,1,0.36,1)' }}
                />
                <circle cx={px} cy={py} r="12" fill="#0F172A" opacity={plotted ? 0.08 : 0} style={{ transition: 'opacity 400ms ease' }} />
            </svg>
            <div className="dp-map-pos">{quadrant()}</div>
        </div>
    );
}

function Sparkline({ data, width, height }) {
    if (!data || data.length < 2) {
        return <svg width={width} height={height}><line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#E2E8F0" strokeWidth="1.5" /></svg>;
    }
    var min = Math.min(...data);
    var max = Math.max(...data);
    var range = max - min || 1;
    var pts = data.map(function (v, i) {
        var x = (i / (data.length - 1)) * width;
        var y = height - ((v - min) / range) * (height - 4) - 2;
        return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <polyline points={pts} fill="none" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    );
}

var METRIC_INSIGHTS = {
    marketFit: function (v) {
        if (v > 70) return 'Strong product-market alignment detected.';
        if (v > 40) return 'Moderate fit — differentiation improvement needed.';
        return 'Weak fit. Market alignment is the critical priority.';
    },
    teamStrength: function (v) {
        if (v > 70) return 'Execution capacity supports growth phase goals.';
        if (v > 40) return 'Team depth insufficient for rapid scaling.';
        return 'Team limitations will constrain operations.';
    },
    growth: function (v) {
        if (v > 60) return 'Acquisition exists but retention may limit compound growth.';
        if (v > 30) return 'Moderate trajectory. CAC efficiency is the lever.';
        return 'Growth below minimum viable threshold.';
    },
    revenue: function (v) {
        if (v > 70) return 'Revenue model is sustaining operations.';
        if (v > 40) return 'Revenue insufficient to cover expansion costs.';
        return 'Monetization needs structural revision.';
    },
    risk: function (v) {
        if (v > 70) return 'Risk exposure requires immediate structural mitigation.';
        if (v > 40) return 'Risk level is manageable with active monitoring.';
        return 'Risk profile within safe operational parameters.';
    },
    burnRate: function (v) {
        if (v > 70) return 'Burn rate accelerating — capital efficiency low.';
        if (v > 40) return 'Moderate burn. Revenue growth must outpace.';
        return 'Burn rate under control.';
    },
    runway: function (v) {
        if (v < 15) return 'Runway critically short. Funding event required.';
        if (v < 40) return 'Runway below safe threshold for growth stage.';
        return 'Runway supports operational continuity.';
    },
    brand: function (v) {
        if (v > 70) return 'Brand equity supports premium positioning.';
        if (v > 40) return 'Brand visibility is moderate — invest in awareness.';
        return 'Brand strength limits customer acquisition.';
    },
    scalability: function (v) {
        if (v > 70) return 'Infrastructure ready to support expansion phase.';
        if (v > 40) return 'Scaling friction will increase with growth.';
        return 'Scale readiness is insufficient for rapid growth.';
    },
    operationalEfficiency: function (v) {
        if (v >= 75) return 'Operations are optimized for scalable execution.';
        if (v >= 50) return 'Operational structure is stable but improvable.';
        if (v >= 25) return 'Inefficiencies may limit growth speed.';
        return 'Operational model is not sustainable.';
    }
};

function MetricCard({ title, metricKey, value, historyData }) {
    var trend = historyData.length >= 2
        ? (historyData[historyData.length - 1] || 0) - (historyData[historyData.length - 2] || 0)
        : 0;
    var confidence = clamp(50 + Math.round((value - 50) * 0.6), 20, 95);
    var arrow = trend > 2 ? '↑' : trend < -2 ? '↓' : '→';
    var trendCls = trend > 2 ? 'dp-trend-up' : trend < -2 ? 'dp-trend-dn' : 'dp-trend-flat';
    var insightFn = METRIC_INSIGHTS[metricKey] || function () { return ''; };

    return (
        <div className="dp-metric-card">
            <div className="dp-mc-top">
                <span className="dp-mc-label">{title.toUpperCase()}</span>
                <span className={'dp-mc-arrow ' + trendCls}>{arrow}</span>
            </div>
            <div className="dp-mc-value">{value}</div>
            <div className="dp-mc-confidence">Confidence: {confidence}%</div>
            <div className="dp-mc-sparkline">
                <Sparkline data={historyData} width={100} height={24} />
            </div>
            <div className="dp-mc-insight">{insightFn(value)}</div>
        </div>
    );
}

function SVGLineChart({ data, dataKey, label, W, H, loaded }) {
    var values = data.map(function (d) { return d[dataKey] || 0; });
    if (values.length < 2) values = [0, 0];
    var min = 0; var max = Math.max(100, ...values);
    var range = max - min || 1;
    var padL = 28; var padR = 12; var padT = 12; var padB = 24;
    var chartW = W - padL - padR;
    var chartH = H - padT - padB;

    var pts = values.map(function (v, i) {
        var x = padL + (i / Math.max(values.length - 1, 1)) * chartW;
        var y = padT + chartH - ((v - min) / range) * chartH;
        return { x, y, v };
    });

    var d = pts.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');
    
    var areaD = d + ' L' + pts[pts.length - 1].x.toFixed(1) + ',' + (padT + chartH) + ' L' + padL + ',' + (padT + chartH) + ' Z';

    var yTicks = [0, 25, 50, 75, 100];

    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            
            {yTicks.map(function (t) {
                var y = padT + chartH - ((t - min) / range) * chartH;
                return (
                    <g key={t}>
                        <line x1={padL} y1={y} x2={padL + chartW} y2={y} stroke="#E2E8F0" strokeWidth="1" />
                        <text x={padL - 5} y={y + 3} textAnchor="end" fontSize="8" fill="#94A3B8" fontFamily="Inter, system-ui">{t}</text>
                    </g>
                );
            })}
            
            <path d={areaD} fill="rgba(15,23,42,0.04)" />
            
            <path
                d={d}
                fill="none"
                stroke="#0F172A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={loaded ? {} : { strokeDasharray: '1000', strokeDashoffset: '1000', transition: 'stroke-dashoffset 600ms ease' }}
                ref={function (el) {
                    if (el && loaded) {
                        var len = el.getTotalLength ? el.getTotalLength() : 1000;
                        el.style.strokeDasharray = len;
                        el.style.strokeDashoffset = '0';
                    }
                }}
            />
            
            {pts.map(function (p, i) {
                return (
                    <text key={i} x={p.x} y={padT + chartH + 14} textAnchor="middle" fontSize="8" fill="#94A3B8" fontFamily="Inter, system-ui">
                        P{data[i] ? data[i].phase : i}
                    </text>
                );
            })}
            
            <text x={padL} y={padT - 2} fontSize="9" fontWeight="600" fill="#475569" fontFamily="Inter, system-ui" letterSpacing="0.05em">
                {label}
            </text>
        </svg>
    );
}

function GraphPanel({ chartData, metrics }) {
    var [loaded, setLoaded] = useState(false);
    useOnMount(function () { setTimeout(function () { setLoaded(true); }, 200); });

    var growthRate = (metrics.growth || 0) / 100;
    var revBase = metrics.revenue || 0;
    var burnBase = metrics.burnRate || 0;
    var runwayBase = metrics.runway || 0;
    var riskBase = metrics.risk || 0;

    var projData = [0, 1, 2, 3, 4, 5, 6].map(function (mo) {
        return {
            phase: 'M' + mo,
            revenue: Math.round(clamp(revBase * Math.pow(1 + growthRate * 0.3, mo), 0, 100)),
            burn: Math.round(clamp(burnBase * (1 + mo * 0.04), 0, 100)),
            runway: Math.round(clamp(runwayBase - mo * (burnBase * 0.05), 0, 100)),
            risk: Math.round(clamp(riskBase + mo * 1.5 - growthRate * mo * 5, 0, 100))
        };
    });

    var W = 260; var H = 120;

    return (
        <div className="dp-graphs-section">
            <div className="dp-section-title">PREDICTIVE GRAPH PANEL</div>
            <div className="dp-graphs-grid">
                <div className="dp-graph-card">
                    <SVGLineChart data={projData} dataKey="revenue" label="REVENUE PROJECTION" W={W} H={H} loaded={loaded} />
                </div>
                <div className="dp-graph-card">
                    <SVGLineChart data={projData} dataKey="burn" label="BURN vs RUNWAY" W={W} H={H} loaded={loaded} />
                </div>
                <div className="dp-graph-card">
                    <SVGLineChart data={projData} dataKey="risk" label="RISK PROBABILITY CURVE" W={W} H={H} loaded={loaded} />
                </div>
            </div>
            {chartData.length > 1 && (
                <div className="dp-history-chart">
                    <div className="dp-graph-sublabel">HISTORICAL PERFORMANCE</div>
                    <SVGLineChart data={chartData} dataKey="growth" label="GROWTH" W={820} H={100} loaded={loaded} />
                </div>
            )}
        </div>
    );
}

function RiskTimeline({ metrics }) {
    var [appeared, setAppeared] = useState([false, false, false, false]);
    useOnMount(function () {
        [0, 1, 2, 3].forEach(function (i) {
            setTimeout(function () {
                setAppeared(function (prev) {
                    var next = prev.slice();
                    next[i] = true;
                    return next;
                });
            }, 200 + i * 120);
        });
    });

    var run = metrics.runway || 0;
    var risk = metrics.risk || 0;
    var growth = metrics.growth || 0;

    var points = [
        {
            label: 'Month 1',
            survival: clamp(70 + growth * 0.2 - risk * 0.2, 5, 98),
            cash: run > 3 ? 'Adequate' : 'Low',
            riskLevel: risk > 60 ? 'Elevated' : risk > 30 ? 'Moderate' : 'Contained'
        },
        {
            label: 'Month 3',
            survival: clamp(60 + growth * 0.25 - risk * 0.25 - 5, 5, 95),
            cash: run > 6 ? 'Adequate' : run > 3 ? 'Depleting' : 'Critical',
            riskLevel: risk > 70 ? 'Critical' : risk > 40 ? 'Elevated' : 'Moderate'
        },
        {
            label: 'Month 6',
            survival: clamp(50 + growth * 0.3 - risk * 0.3 - 10, 5, 90),
            cash: run > 12 ? 'Stable' : run > 6 ? 'Low' : 'Depleted',
            riskLevel: risk > 60 ? 'Critical' : 'Elevated'
        },
        {
            label: 'Month 12',
            survival: clamp(40 + growth * 0.4 - risk * 0.3 - 15, 5, 88),
            cash: run > 24 ? 'Healthy' : 'Risk',
            riskLevel: growth > 50 ? 'Managed' : 'High'
        }
    ];

    return (
        <div className="dp-risk-timeline">
            <div className="dp-section-title">RISK TIMELINE</div>
            <div className="dp-tl-row">
                <div className="dp-tl-line-bar" />
                {points.map(function (pt, i) {
                    return (
                        <div key={i} className={'dp-tl-point' + (appeared[i] ? ' dp-tl-point-on' : '')} style={{ transitionDelay: (i * 120) + 'ms' }}>
                            <div className="dp-tl-dot-outer">
                                <div className="dp-tl-dot" />
                            </div>
                            <div className="dp-tl-label">{pt.label}</div>
                            <div className="dp-tl-surv">{Math.round(pt.survival)}%</div>
                            <div className="dp-tl-detail">Cash: {pt.cash}</div>
                            <div className="dp-tl-detail">Risk: {pt.riskLevel}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function buildInsightFeed(metrics, allInsights) {
    var feed = [];
    var mf = metrics.marketFit || 0;
    var ts = metrics.teamStrength || 0;
    var gr = metrics.growth || 0;
    var rv = metrics.revenue || 0;
    var ri = metrics.risk || 0;
    var sc = metrics.scalability || 0;

    if (ri > 68) feed.push('Cost structure is heavier than 68% of comparable stage startups.');
    if (mf > 70) feed.push('Market timing advantage detected — demand indicators above sector average.');
    if (ts < 35) feed.push('Team execution strength limits near-term scaling potential.');
    if (gr > 55) feed.push('Growth trajectory is compounding at an above-average rate for current phase.');
    if (rv < 25) feed.push('Revenue capture is below model projection — pricing or channel review required.');
    if (sc > 65) feed.push('Infrastructure scalability score positions the model for Phase 2 expansion.');
    if (mf < 30 && gr > 50) feed.push('Channel growth exists but market alignment is weak — retention risk is elevated.');
    if (ri < 25) feed.push('Risk profile is contained — operational stability exceeds peer benchmark.');
    if (feed.length < 3) {
        allInsights.slice(0, 3 - feed.length).forEach(function (ins) { feed.push(ins); });
    }
    return feed.slice(0, 6);
}

function InsightFeed({ metrics, allInsights }) {
    var feed = useMemo(function () { return buildInsightFeed(metrics, allInsights); }, [metrics, allInsights]);
    return (
        <div className="dp-insight-feed">
            <div className="dp-section-title">INSIGHT FEED</div>
            <div className="dp-feed-list">
                {feed.map(function (text, i) {
                    return (
                        <div key={i} className="dp-feed-item" style={{ animationDelay: (i * 80) + 'ms' }}>
                            <div className="dp-feed-bar" />
                            <p className="dp-feed-text">{text}</p>
                        </div>
                    );
                })}
                {feed.length === 0 && (
                    <div className="dp-feed-item">
                        <div className="dp-feed-bar" />
                        <p className="dp-feed-text">Complete the Setup and Market phases to activate the insight engine.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SimulationPanel({ metrics, capital }) {
    var [result, setResult] = useState(null);
    var [loading, setLoading] = useState(false);

    function simulate() {
        setLoading(true);
        setTimeout(function () {
            var gr = (metrics.growth || 0) / 100;
            var rv = metrics.revenue || 0;
            var run = metrics.runway || 0;
            var risk = metrics.risk || 0;

            var projRev = clamp(rv * Math.pow(1 + gr * 0.4, 3), 0, 100);
            var survProb = clamp(
                Math.round(
                    (run / 100) * 30 + (gr * 100) * 0.2 + ((100 - risk) / 100) * 25 + (projRev / 100) * 25
                ), 5, 97
            );
            var failRisk = 100 - survProb;

            setResult({ projRev: Math.round(projRev), survProb, failRisk: Math.round(failRisk) });
            setLoading(false);
        }, 500);
    }

    return (
        <div className="dp-sim-panel">
            <div className="dp-section-title">SIMULATION ENGINE</div>
            <div className="dp-sim-inner">
                <p className="dp-sim-desc">Compute a 3-month forward projection based on current metric trajectory and capital structure.</p>
                <button className="dp-sim-btn" onClick={simulate} disabled={loading} type="button">
                    {loading ? 'Computing...' : 'Simulate Next 3 Months'}
                </button>
                {result && (
                    <div className="dp-sim-results">
                        <div className="dp-sim-metric">
                            <span className="dp-sim-label">Projected Revenue Index</span>
                            <span className="dp-sim-val">{result.projRev}</span>
                        </div>
                        <div className="dp-sim-metric">
                            <span className="dp-sim-label">Survival Probability</span>
                            <span className="dp-sim-val">{result.survProb}%</span>
                        </div>
                        <div className="dp-sim-metric">
                            <span className="dp-sim-label">Failure Risk</span>
                            <span className="dp-sim-val">{result.failRisk}%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function buildDecisionRanking(metrics, decisionList) {
    var mf = metrics.marketFit || 0;
    var ts = metrics.teamStrength || 0;
    var gr = metrics.growth || 0;
    var rv = metrics.revenue || 0;
    var sc = metrics.scalability || 0;

    return decisionList.map(function (dec) {
        var impact = 0;
        var conf = 70;
        var effects = dec.effects || {};

        Object.keys(effects).forEach(function (k) {
            var v = effects[k] || 0;
            if (k === 'marketFit' && mf < 50) impact += Math.abs(v) * 1.3;
            else if (k === 'growth' && gr < 40) impact += Math.abs(v) * 1.2;
            else if (k === 'teamStrength' && ts < 40) impact += Math.abs(v) * 1.1;
            else if (k === 'revenue' && rv < 40) impact += Math.abs(v) * 1.2;
            else if (k === 'risk') impact += (v < 0 ? Math.abs(v) * 0.9 : -v * 0.4);
            else if (k === 'scalability' && sc < 40) impact += Math.abs(v) * 1.0;
            else impact += Math.abs(v) * 0.8;
        });
        conf = clamp(55 + Math.round(impact * 0.6), 30, 95);
        return { ...dec, impactScore: Math.round(impact), confidence: conf };
    }).sort(function (a, b) { return b.impactScore - a.impactScore; });
}

function DashboardPage() {
    var { state, setState } = useStartup();
    var navigate = useNavigate();

    function handleDecision(decision) {
        var newState = processDecision(state, decision);
        setState(newState);
    }

    function handleNextPhase() {
        var nextPhase = state.currentPhase + 1;
        if (nextPhase >= phases.length) { navigate('/result'); return; }

        var updatedMetrics = { ...state.metrics };
        var remainingEffects = [];
        for (var i = 0; i < state.futureEffects.length; i++) {
            var effect = state.futureEffects[i];
            if (effect.phase === nextPhase) {
                for (var key in effect.effects) {
                    if (updatedMetrics.hasOwnProperty(key)) {
                        updatedMetrics[key] = updatedMetrics[key] + effect.effects[key];
                    }
                }
            } else { remainingEffects.push(effect); }
        }

        var updatedInsights = state.insights.slice();
        var event = generateRandomEvent();
        if (event) {
            for (var eventKey in event.effects) {
                if (updatedMetrics.hasOwnProperty(eventKey)) {
                    updatedMetrics[eventKey] = updatedMetrics[eventKey] + event.effects[eventKey];
                }
            }
            updatedInsights.push(event.name);
        }

        var metricKeys = Object.keys(updatedMetrics);
        for (var m = 0; m < metricKeys.length; m++) {
            updatedMetrics[metricKeys[m]] = clamp(updatedMetrics[metricKeys[m]], 0, 100);
        }

        var snapshot = { phase: nextPhase, metrics: { ...updatedMetrics }, timestamp: Date.now() };
        var newHistory = state.history.concat([snapshot]);
        var newState = {
            ...state, currentPhase: nextPhase, metrics: updatedMetrics,
            history: newHistory, futureEffects: remainingEffects, insights: updatedInsights
        };

        if (checkFailure(updatedMetrics, state.startup.capital)) {
            setState({ ...newState, startup: { ...newState.startup, status: 'failed' } });
            navigate('/result'); return;
        }
        if (checkSuccess(updatedMetrics)) {
            setState({ ...newState, startup: { ...newState.startup, status: 'success' } });
            navigate('/result'); return;
        }
        setState(newState);
    }

    var metrics = state.metrics;
    var history = state.history;

    var costControl = clamp(100 - (metrics.burnRate || 0), 0, 100);
    var opEff = clamp(
        Math.round(
            (metrics.revenue || 0) * 0.30 +
            costControl * 0.25 +
            (metrics.teamStrength || 0) * 0.20 +
            (metrics.scalability || 0) * 0.25
        ),
        0, 100
    );

    var coreMetrics = [
        { key: 'marketFit', title: 'Market Fit' },
        { key: 'teamStrength', title: 'Team Strength' },
        { key: 'growth', title: 'Growth' },
        { key: 'revenue', title: 'Revenue' },
        { key: 'operationalEfficiency', title: 'Operational Efficiency' },
        { key: 'risk', title: 'Risk' },
        { key: 'burnRate', title: 'Burn Rate' },
        { key: 'runway', title: 'Runway' },
        { key: 'brand', title: 'Brand' },
        { key: 'scalability', title: 'Scalability' }
    ];

    var scorableKeys = ['marketFit', 'teamStrength', 'growth', 'revenue', 'brand', 'scalability'];
    var scoreSum = scorableKeys.reduce(function (s, k) { return s + (metrics[k] || 0); }, 0);
    var healthScore = Math.round(scoreSum / scorableKeys.length);

    var chartData = history.map(function (entry) {
        return { phase: entry.phase, growth: entry.metrics.growth || 0, revenue: entry.metrics.revenue || 0, marketFit: entry.metrics.marketFit || 0, risk: entry.metrics.risk || 0 };
    });

    var rankedDecisions = useMemo(function () { return buildDecisionRanking(metrics, decisions); }, [metrics]);

    var insights = generateInsights(state.metrics);
    var allInsights = insights.concat(state.insights);

    function getHistoryFor(key) {
        if (key === 'operationalEfficiency') {
            return history.map(function (h) {
                var cc = clamp(100 - (h.metrics.burnRate || 0), 0, 100);
                return clamp(Math.round(
                    (h.metrics.revenue || 0) * 0.30 +
                    cc * 0.25 +
                    (h.metrics.teamStrength || 0) * 0.20 +
                    (h.metrics.scalability || 0) * 0.25
                ), 0, 100);
            }).concat([opEff]);
        }
        return history.map(function (h) { return h.metrics[key] || 0; }).concat([metrics[key] || 0]);
    }

    return (
        <div className="dp-root">

            <InsightStrip metrics={metrics} healthScore={healthScore} />

            <div className="dp-row-two">
                <div className="dp-card dp-card-dial">
                    <div className="dp-section-title">STARTUP HEALTH</div>
                    <div className="dp-dial-row">
                        <HealthDial score={healthScore} />
                        <div className="dp-dial-detail">
                            <div className="dp-detail-phase">Phase {state.currentPhase}: {phases[state.currentPhase] || '—'}</div>
                            {coreMetrics.filter(function (m) { return m.key !== 'risk' && m.key !== 'burnRate'; }).slice(0, 4).map(function (m) {
                                var v = metrics[m.key] || 0;
                                return (
                                    <div key={m.key} className="dp-detail-bar-row">
                                        <span className="dp-detail-bar-label">{m.title}</span>
                                        <div className="dp-detail-bar-track">
                                            <div className="dp-detail-bar-fill" style={{ width: v + '%' }} />
                                        </div>
                                        <span className="dp-detail-bar-val">{v}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="dp-card dp-card-margin">
                    <StabilityMap marketDemand={metrics.marketFit || 0} executionStrength={metrics.teamStrength || 0} />
                </div>
            </div>

            <div className="dp-card dp-section-gap">
                <div className="dp-section-title">PRIORITY DECISION ENGINE</div>
                <div className="dp-decisions-list">
                    {rankedDecisions.map(function (dec, i) {
                        return (
                            <button
                                key={dec.id}
                                className="dp-decision-row"
                                onClick={function () { handleDecision(dec); }}
                                type="button"
                            >
                                <span className="dp-dec-rank">#{i + 1}</span>
                                <span className="dp-dec-title">{dec.title}</span>
                                <span className="dp-dec-impact">Impact +{dec.impactScore}</span>
                                <span className="dp-dec-conf">Confidence {dec.confidence}%</span>
                                <span className="dp-dec-arrow">›</span>
                            </button>
                        );
                    })}
                </div>
                <div className="dp-next-phase-row">
                    <button className="dp-next-btn" onClick={handleNextPhase} type="button">
                        Advance to Phase {state.currentPhase + 1} →
                    </button>
                </div>
            </div>

            <div className="dp-section-gap">
                <div className="dp-section-title">METRIC INTELLIGENCE GRID</div>
                <div className="dp-metrics-grid">
                    {coreMetrics.map(function (m) {
                        var val = m.key === 'operationalEfficiency' ? opEff : (metrics[m.key] || 0);
                        return (
                            <MetricCard
                                key={m.key}
                                title={m.title}
                                metricKey={m.key}
                                value={val}
                                historyData={getHistoryFor(m.key)}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="dp-card dp-section-gap">
                <GraphPanel chartData={chartData} metrics={metrics} />
            </div>

            <div className="dp-card dp-section-gap">
                <RiskTimeline metrics={metrics} />
            </div>

            <div className="dp-card dp-section-gap">
                <InsightFeed metrics={metrics} allInsights={allInsights} />
            </div>

            <div className="dp-card dp-section-gap">
                <SimulationPanel metrics={metrics} capital={state.startup.capital || 0} />
            </div>

        </div>
    );
}

export default DashboardPage;
