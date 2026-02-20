import React, { useState, useEffect, useRef } from 'react';
import { useStartup } from '../context/StartupContext';

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function useAnimatedNumber(target, duration) {
    var [display, setDisplay] = useState(target);
    var prevRef = useRef(target);
    var frameRef = useRef(null);

    useEffect(function () {
        var start = prevRef.current;
        var end = target;
        if (start === end) return;
        var startTime = null;
        function step(ts) {
            if (!startTime) startTime = ts;
            var p = Math.min((ts - startTime) / (duration || 600), 1);
            var ease = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(start + (end - start) * ease));
            if (p < 1) { frameRef.current = requestAnimationFrame(step); }
            else { prevRef.current = end; }
        }
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(step);
        return function () { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
    }, [target, duration]);

    return display;
}

function AnimNum({ value, suffix }) {
    var d = useAnimatedNumber(Math.round(value), 800);
    return <span>{d}{suffix || ''}</span>;
}

function RadarChart({ data }) {
    var cx = 110; var cy = 110; var r = 85;
    var n = data.length;
    var pts = data.map(function (d, i) {
        var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        var pct = d.value / 100;
        return {
            x: cx + r * pct * Math.cos(angle),
            y: cy + r * pct * Math.sin(angle),
            lx: cx + (r + 20) * Math.cos(angle),
            ly: cy + (r + 20) * Math.sin(angle),
            gx: cx + r * Math.cos(angle),
            gy: cy + r * Math.sin(angle),
            label: d.label,
            value: d.value
        };
    });

    var rings = [0.25, 0.5, 0.75, 1];
    var gridPts = function (pct) {
        return data.map(function (_, i) {
            var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
            return (i === 0 ? 'M' : 'L') + (cx + r * pct * Math.cos(angle)).toFixed(1) + ',' + (cy + r * pct * Math.sin(angle)).toFixed(1);
        }).join(' ') + ' Z';
    };

    var polyline = pts.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ') + ' Z';

    return (
        <svg width="220" height="220" viewBox="0 0 220 220" className="rp-radar">
            {rings.map(function (pct, i) {
                return <path key={i} d={gridPts(pct)} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="1" />;
            })}
            {pts.map(function (p) {
                return <line key={p.label} x1={cx} y1={cy} x2={p.gx} y2={p.gy} stroke="rgba(0,0,0,0.07)" strokeWidth="1" />;
            })}
            <path d={polyline} fill="rgba(0,0,0,0.08)" stroke="#444" strokeWidth="1.5" />
            {pts.map(function (p) {
                return <circle key={p.label} cx={p.x} cy={p.y} r="3" fill="#333" />;
            })}
            {pts.map(function (p) {
                return (
                    <text key={p.label + 'l'} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
                        fontSize="9" fill="#888" fontFamily="inherit">
                        {p.label}
                    </text>
                );
            })}
        </svg>
    );
}

var TIMELINE_MONTHS = [1, 3, 6, 12];

function timelineStatus(month, metrics, survProb) {
    var runway = metrics.runway || 0;
    var growth = metrics.growth || 0;
    var profit = metrics.revenue - metrics.burnRate;
    if (runway < month) return { label: 'decline risk', cls: 'rp-tl-critical' };
    if (month <= 1 && profit < 0) return { label: 'loss phase', cls: 'rp-tl-warning' };
    if (month <= 3 && growth < 20) return { label: 'loss phase', cls: 'rp-tl-warning' };
    if (month === 6 && growth > 30) return { label: 'growth', cls: 'rp-tl-good' };
    if (month === 6) return { label: 'break-even', cls: 'rp-tl-neutral' };
    if (month === 12 && survProb > 60) return { label: 'scale-ready', cls: 'rp-tl-good' };
    if (month === 12 && survProb > 35) return { label: 'growth', cls: 'rp-tl-neutral' };
    return { label: 'decline risk', cls: 'rp-tl-critical' };
}

function ResultPage() {
    var { state } = useStartup();
    var metrics = state.metrics;
    var startup = state.startup;

    var [investorMode, setInvestorMode] = useState(false);
    
    var [tlVisible, setTlVisible] = useState(false);

    useEffect(function () {
        var t = setTimeout(function () { setTlVisible(true); }, 300);
        return function () { clearTimeout(t); };
    }, []);

    var marketScore = clamp(metrics.marketFit || 0, 0, 100);
    var teamScore = clamp(metrics.teamStrength || 0, 0, 100);
    var financeScore = clamp(metrics.runway || 0, 0, 100);
    var riskScore = clamp(100 - (metrics.risk || 0), 0, 100);
    var growthScore = clamp(metrics.growth || 0, 0, 100);
    var scalScore = clamp(metrics.scalability || 0, 0, 100);

    var executionScore = Math.round((teamScore + growthScore) / 2);
    var confidenceScore = Math.round((marketScore + financeScore + riskScore + executionScore) / 4);

    function getVerdict() {
        if (confidenceScore >= 72) return { label: 'HIGH POTENTIAL', cls: 'rp-verdict-green' };
        if (confidenceScore >= 50) return { label: 'MODERATE POTENTIAL', cls: 'rp-verdict-neutral' };
        if (confidenceScore >= 30) return { label: 'HIGH RISK', cls: 'rp-verdict-warning' };
        return { label: 'UNSTABLE MODEL', cls: 'rp-verdict-critical' };
    }

    var verdict = getVerdict();

    var survProb = clamp(
        Math.round(
            (financeScore / 100) * 30 +
            (growthScore / 100) * 20 +
            (riskScore / 100) * 15 +
            ((marketScore + teamScore) / 200) * 35
        ), 0, 100
    );

    var roiOutlook = survProb > 60 ? 'Favorable' : survProb > 35 ? 'Moderate' : 'High Risk';

    function getInsights() {
        var ins = [];

        if (growthScore > 60 && metrics.burnRate > 0) {
            ins.push('Growth trajectory is strong, but burn rate presents a compounding risk to long-term runway.');
        } else if (growthScore > 60) {
            ins.push('Growth indicators are above threshold. Expansion execution is the primary value driver.');
        } else if (growthScore < 20) {
            ins.push('Growth signals remain below viable range. Market entry or product-market fit requires immediate attention.');
        }

        if (marketScore > 65 && teamScore < 40) {
            ins.push('Strong demand signal detected, but team execution capacity is insufficient to capture the opportunity.');
        } else if (marketScore > 65) {
            ins.push('Market fit indicators are favorable. Revenue model is positioned for demand capture.');
        } else if (marketScore < 30) {
            ins.push('Weak market differentiation detected. Competitive positioning needs structural revision.');
        }

        if (financeScore > 70) {
            ins.push('Capital reserves and runway are within safe operational parameters.');
        } else if (financeScore < 25) {
            ins.push('Runway is critically insufficient. Capital extension or cost reduction is an immediate priority.');
        }

        if (scalScore > 60 && growthScore > 50) {
            ins.push('Scaling conditions are approaching viability. System recommends initiating Phase 2 planning.');
        }

        if (ins.length === 0) {
            ins.push('Begin your simulation by completing Setup and Market decisions to generate the full analysis.');
        }

        return ins.slice(0, 4);
    }

    var insights = getInsights();

    function getWarnings() {
        var w = [];
        if (metrics.burnRate > 50) w.push('Burn rate exceeds sustainable operational range.');
        if (financeScore < 20) w.push('Capital insufficient for early growth stage progression.');
        if (marketScore < 30) w.push('Pricing or value proposition may be below sustainability threshold.');
        if (riskScore < 25) w.push('Risk exposure is critically elevated. Structural hedging recommended.');
        if (growthScore < 15) w.push('Growth rate below minimum viable threshold for the current burn level.');
        if (teamScore < 20) w.push('Team execution strength is insufficient for planned scope.');
        return w;
    }

    var warnings = getWarnings();

    function getActions() {
        var acts = [];
        if (metrics.burnRate > 30) acts.push('Reduce operational burn rate by 15–20% before next growth phase.');
        if (marketScore < 50) acts.push('Improve product differentiation and revise go-to-market strategy.');
        if (teamScore < 40) acts.push('Accelerate key hires in execution and product leadership.');
        if (financeScore < 30) acts.push('Prioritize runway extension through bridge funding or cost reduction.');
        if (growthScore > 60) acts.push('Activate retention strategy to compound growth trajectory.');
        if (scalScore < 40) acts.push('Delay scaling phase — infrastructure not yet ready for expansion.');
        return acts.slice(0, 5);
    }

    var actions = getActions();

    var scenarios = [
        {
            label: 'Worst Case',
            survival: clamp(survProb - 30, 0, 100),
            outcome: 'Burn through capital within runway period. Recovery requires external injection.'
        },
        {
            label: 'Expected Case',
            survival: survProb,
            outcome: growthScore > 50
                ? 'Moderate growth sustains through early phases. Cash position stabilizes by month 6.'
                : 'Break-even delayed. Capital preservation becomes the primary objective.'
        },
        {
            label: 'Best Case',
            survival: clamp(survProb + 25, 0, 100),
            outcome: 'Growth outpaces burn. Scaling threshold reached ahead of model projection.'
        }
    ];

    var impacts = [
        { decision: 'Marketing ↑', effect: 'Cost ↑', metric: 'Runway ↓' },
        { decision: 'Retention ↑', effect: 'Revenue ↑', metric: 'Runway ↑' },
        { decision: 'Hiring ↑', effect: 'Burn ↑', metric: 'Capital ↓' },
        { decision: 'Pricing ↑', effect: 'Revenue ↑', metric: 'Profit ↑' },
    ];

    var radarData = [
        { label: 'Market', value: marketScore },
        { label: 'Team', value: teamScore },
        { label: 'Finance', value: financeScore },
        { label: 'Scale', value: scalScore },
        { label: 'Risk', value: riskScore },
    ];

    return (
        <div className="rp-root">

            <div className="rp-mode-bar">
                <button
                    className={'rp-mode-btn' + (!investorMode ? ' rp-mode-active' : '')}
                    onClick={function () { setInvestorMode(false); }}
                    type="button"
                >
                    Founder Mode
                </button>
                <button
                    className={'rp-mode-btn' + (investorMode ? ' rp-mode-active' : '')}
                    onClick={function () { setInvestorMode(true); }}
                    type="button"
                >
                    Investor Mode
                </button>
            </div>

            <section className="rp-section rp-section-verdict">
                <div className="rp-verdict-label">STARTUP VIABILITY VERDICT</div>
                <div className={'rp-verdict-badge ' + verdict.cls}>{verdict.label}</div>
                <div className="rp-confidence-row">
                    <span className="rp-confidence-label">Confidence Score</span>
                    <span className="rp-confidence-value">
                        <AnimNum value={confidenceScore} suffix="%" />
                    </span>
                </div>
                {investorMode && (
                    <div className="rp-investor-strip">
                        <div className="rp-inv-item">
                            <span className="rp-inv-label">Risk</span>
                            <span className="rp-inv-val">{riskScore < 40 ? 'High' : riskScore < 65 ? 'Moderate' : 'Low'}</span>
                        </div>
                        <div className="rp-inv-item">
                            <span className="rp-inv-label">Survival Probability</span>
                            <span className="rp-inv-val"><AnimNum value={survProb} suffix="%" /></span>
                        </div>
                        <div className="rp-inv-item">
                            <span className="rp-inv-label">ROI Outlook</span>
                            <span className="rp-inv-val">{roiOutlook}</span>
                        </div>
                    </div>
                )}
            </section>

            {!investorMode && (
                <section className="rp-section">
                    <div className="rp-section-title">ANALYST INSIGHTS</div>
                    <div className="rp-insights-list">
                        {insights.map(function (text, i) {
                            return (
                                <div key={i} className="rp-insight-row">
                                    <div className="rp-insight-dot" />
                                    <p className="rp-insight-text">{text}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {!investorMode && (
                <section className="rp-section">
                    <div className="rp-section-title">FUTURE TIMELINE</div>
                    <div className="rp-timeline">
                        <div className="rp-tl-line" />
                        {TIMELINE_MONTHS.map(function (month, i) {
                            var status = timelineStatus(month, metrics, survProb);
                            return (
                                <div
                                    key={month}
                                    className={'rp-tl-node' + (tlVisible ? ' rp-tl-visible' : '')}
                                    style={{ transitionDelay: (i * 120) + 'ms' }}
                                >
                                    <div className={'rp-tl-dot ' + status.cls} />
                                    <div className="rp-tl-month">Mo {month}</div>
                                    <div className={'rp-tl-status ' + status.cls}>{status.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {!investorMode && (
                <section className="rp-section">
                    <div className="rp-section-title">DIAGNOSTIC ANALYSIS</div>
                    <div className="rp-diagnostic-split">
                        <div className="rp-diag-left">
                            <div className="rp-diag-subtitle">Performance Radar</div>
                            <RadarChart data={radarData} />
                        </div>
                        <div className="rp-diag-right">
                            <div className="rp-diag-subtitle">Risk Detector</div>
                            {warnings.length === 0
                                ? <p className="rp-no-warnings">No critical risks detected.</p>
                                : warnings.map(function (w, i) {
                                    return (
                                        <div key={i} className="rp-warning-item">
                                            <span className="rp-warning-dot" />
                                            <span className="rp-warning-text">{w}</span>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </section>
            )}

            {!investorMode && (
                <section className="rp-section">
                    <div className="rp-section-title">STRATEGIC OUTPUT</div>

                    <div className="rp-strat-subtitle">SCENARIO COMPARISON</div>
                    <div className="rp-scenarios">
                        {scenarios.map(function (sc) {
                            return (
                                <div key={sc.label} className="rp-scenario-card">
                                    <div className="rp-scenario-label">{sc.label}</div>
                                    <div className="rp-scenario-prob">
                                        <AnimNum value={sc.survival} suffix="%" />
                                        <span className="rp-scenario-prob-label"> survival</span>
                                    </div>
                                    <p className="rp-scenario-outcome">{sc.outcome}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="rp-strat-subtitle">ACTION ROADMAP</div>
                    <div className="rp-actions">
                        {actions.length === 0
                            ? <p className="rp-no-warnings">Complete simulation to generate recommendations.</p>
                            : actions.map(function (act, i) {
                                return (
                                    <div key={i} className="rp-action-item">
                                        <span className="rp-action-num">{i + 1}</span>
                                        <span className="rp-action-text">{act}</span>
                                    </div>
                                );
                            })
                        }
                    </div>

                    <div className="rp-strat-subtitle">DECISION IMPACT MAP</div>
                    <div className="rp-impact-map">
                        {impacts.map(function (imp, i) {
                            return (
                                <div key={i} className="rp-impact-row">
                                    <span className="rp-impact-decision">{imp.decision}</span>
                                    <span className="rp-impact-arrow">→</span>
                                    <span className="rp-impact-effect">{imp.effect}</span>
                                    <span className="rp-impact-arrow">→</span>
                                    <span className="rp-impact-metric">{imp.metric}</span>
                                </div>
                            );
                        })}
                    </div>

                </section>
            )}

        </div>
    );
}

export default ResultPage;
