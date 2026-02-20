import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function fmt(n) { return '$' + Math.abs(Math.round(n)).toLocaleString(); }

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
            var p = Math.min((ts - startTime) / duration, 1);
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

function AnimNum({ value, prefix, suffix }) {
    var d = useAnimatedNumber(Math.round(value), 300);
    return <span>{prefix}{Math.abs(d).toLocaleString()}{suffix}</span>;
}

function StatusDot({ level }) {

    var colors = { stable: '#6b7280', warning: '#9ca3af', critical: '#d1d5db' };
    var labels = { stable: 'STABLE', warning: 'WARNING', critical: 'CRITICAL' };
    return (
        <span className={'fp-status fp-status-' + level}>
            <span className="fp-status-dot" style={{ background: colors[level] }} />
            {labels[level]}
        </span>
    );
}

function MetricBar({ pct, level }) {
    var bg = level === 'stable' ? '#9ca3af' : level === 'warning' ? '#6b7280' : '#4b5563';
    return (
        <div className="fp-bar-track">
            <div className="fp-bar-fill" style={{ width: clamp(pct, 0, 100) + '%', background: bg }} />
        </div>
    );
}

function InputBlock({ title, children, defaultOpen }) {
    var [open, setOpen] = useState(defaultOpen || false);
    return (
        <div className="fp-input-block">
            <button
                className="fp-block-toggle"
                onClick={function () { setOpen(function (v) { return !v; }); }}
                type="button"
            >
                <span className="fp-block-title">{title}</span>
                <span className={'fp-block-arrow' + (open ? ' fp-block-arrow-open' : '')}>›</span>
            </button>
            {open && <div className="fp-block-body">{children}</div>}
        </div>
    );
}

function UInput({ label, value, onChange, placeholder }) {
    return (
        <div className="fp-field">
            <label className="fp-label">{label}</label>
            <input
                className="fp-input"
                type="number"
                value={value}
                placeholder={placeholder || '0'}
                onChange={function (e) { onChange(e.target.value); }}
            />
        </div>
    );
}

function FinancePage() {
    var { state, setState } = useStartup();
    var navigate = useNavigate();
    var capital = state.startup.capital || 0;
    var riskTolerance = state.startup.riskTolerance || 50;
    var growthFromState = state.metrics.growth || 0;
    var marketFit = state.metrics.marketFit || 0;

    var [rent, setRent] = useState('');
    var [salaries, setSalaries] = useState('');
    var [utilities, setUtilities] = useState('');
    var [tools, setTools] = useState('');
    var [inventory, setInventory] = useState('');
    var [marketing, setMarketing] = useState('');

    var [pricePerUnit, setPricePerUnit] = useState('');
    var [customersPerMonth, setCustomersPerMonth] = useState('');
    var [growthRate, setGrowthRate] = useState('');
    var [retentionRate, setRetentionRate] = useState('');

    var [loanAmount, setLoanAmount] = useState('');
    var [interestRate, setInterestRate] = useState('');

    var [churnRate, setChurnRate] = useState('');
    var [costInflation, setCostInflation] = useState('');
    var [scalingMultiplier, setScalingMultiplier] = useState('');

    var [advancedMode, setAdvancedMode] = useState(false);
    var [pricingFlex, setPricingFlex] = useState(50);
    var [supplierStability, setSupplierStability] = useState(70);
    var [hiringSpeed, setHiringSpeed] = useState(50);
    var [demandVolatility, setDemandVolatility] = useState(30);
    var [competitorPressure, setCompetitorPressure] = useState(50);
    var [marketMaturity, setMarketMaturity] = useState(50);
    var [expansionFriction, setExpansionFriction] = useState(30);
    var [opEfficiency, setOpEfficiency] = useState(70);

    var r = Number(rent) || 0;
    var sal = Number(salaries) || 0;
    var util = Number(utilities) || 0;
    var tls = Number(tools) || 0;
    var inv = Number(inventory) || 0;
    var mkt = Number(marketing) || 0;
    var cpu = Number(pricePerUnit) || 0;
    var cpm = Number(customersPerMonth) || 0;
    var gr = Number(growthRate) || 0;
    var ret = Number(retentionRate) || 80;
    var loan = Number(loanAmount) || 0;
    var ir = Number(interestRate) || 0;
    var churn = Number(churnRate) || 20;
    var ci = Number(costInflation) || 0;
    var sm = Number(scalingMultiplier) || 1;

    var monthlyInterest = loan > 0 ? (loan * (ir / 100)) / 12 : 0;

    var advMod = 1;
    if (advancedMode) {
        var advScore = (pricingFlex + supplierStability + opEfficiency - demandVolatility - competitorPressure - expansionFriction) / 600;
        advMod = 1 + advScore * 0.4;
    }

    var baseRevenue = cpu * cpm;

    var retFactor = ret / 100;
    var churnFactor = 1 - (churn / 100) * 0.5;
    var monthlyRevenue = baseRevenue * retFactor * churnFactor * advMod;

    var operatingCost = r + sal + util + tls + inv + mkt;
    var inflationAdj = operatingCost * (1 + ci / 100);
    var scaledCost = inflationAdj * (sm || 1);
    var totalCost = scaledCost + monthlyInterest;

    var monthlyProfit = monthlyRevenue - totalCost;
    var burnRate = monthlyProfit < 0 ? Math.abs(monthlyProfit) : 0;

    var runway = burnRate > 0 ? capital / burnRate : (capital > 0 ? 999 : 0);
    var runwayCapped = Math.min(runway, 120);

    var breakevenMonth = monthlyProfit < 0 && monthlyRevenue > 0
        ? Math.ceil(capital / burnRate)
        : monthlyProfit > 0 ? 0 : null;

    var survProb = clamp(
        Math.round(
            (runwayCapped / 120) * 30 +
            (growthFromState / 100) * 20 +
            ((100 - riskTolerance) / 100) * 15 +
            (monthlyProfit > 0 ? 25 : 0) +
            (marketFit / 100) * 10
        ), 0, 100
    );

    var scalingMonth = monthlyRevenue > 0 && totalCost > 0
        ? Math.max(1, Math.ceil((totalCost * 1.5) / (monthlyRevenue / 12 + 1)))
        : null;

    function runwayLevel() {
        if (runway === 0) return 'critical';
        if (runway < 6) return 'critical';
        if (runway < 12) return 'warning';
        return 'stable';
    }

    function burnLevel() {
        if (burnRate === 0) return 'stable';
        if (burnRate > capital * 0.2) return 'critical';
        if (burnRate > capital * 0.1) return 'warning';
        return 'stable';
    }

    function profitLevel() {
        if (monthlyProfit > 0) return 'stable';
        if (monthlyProfit > -totalCost * 0.5) return 'warning';
        return 'critical';
    }

    function survLevel() {
        if (survProb >= 60) return 'stable';
        if (survProb >= 35) return 'warning';
        return 'critical';
    }

    function generateInsights() {
        var ins = [];

        if (burnRate > 0 && capital > 0) {
            if (runway < 3) ins.push({ type: 'critical', text: 'Runway critically low. Immediate capital injection or cost reduction required.' });
            else if (runway < 6) ins.push({ type: 'warning', text: 'Runway below safe threshold. Model indicates 6-month minimum for stability.' });
            else if (runway > 24) ins.push({ type: 'stable', text: 'Runway is strong. Capital reserves support extended operations.' });
        }

        if (burnRate > 0) {
            ins.push({ type: 'critical', text: 'Burn rate at ' + fmt(burnRate) + '/month. Revenue expansion is the primary mitigation path.' });
        } else if (monthlyProfit > 0) {
            ins.push({ type: 'stable', text: 'Monthly operations are profitable at ' + fmt(monthlyProfit) + '/month. Scaling conditions are met.' });
        }

        if (growthRate && gr > 0) {
            var monthsToOffset = Math.ceil(Math.abs(monthlyProfit) / (monthlyRevenue * gr / 100 + 1));
            if (monthlyProfit < 0 && gr > 5) {
                ins.push({ type: 'warning', text: 'Growth at ' + gr + '% can offset losses in approximately ' + monthsToOffset + ' months given current trajectory.' });
            }
        }

        if (ret < 60) {
            ins.push({ type: 'critical', text: 'Retention below 60% signals structural churn risk. Revenue cohort decay accelerates.' });
        }

        if (scalingMonth && scalingMonth > 0 && scalingMonth <= 24) {
            ins.push({ type: 'stable', text: 'Scaling threshold projected at month ' + scalingMonth + ' based on current revenue and cost trajectory.' });
        }

        if (mkt > operatingCost * 0.4) {
            ins.push({ type: 'warning', text: 'Marketing represents ' + Math.round((mkt / operatingCost) * 100) + '% of operating costs. Monitor CAC efficiency.' });
        }

        if (survProb < 30) {
            ins.push({ type: 'critical', text: 'Survival probability below viable threshold. Model suggests structural redesign.' });
        } else if (survProb > 75) {
            ins.push({ type: 'stable', text: 'Model shows high viability. Financial architecture supports near-term growth phase.' });
        }

        if (ins.length === 0) {
            ins.push({ type: 'stable', text: 'Enter cost and revenue inputs to activate the intelligence engine.' });
        }

        return ins;
    }

    var insights = generateInsights();

    useEffect(function () {
        var revenueScore = totalCost > 0 ? Math.min(Math.round((monthlyRevenue / totalCost) * 50), 100) : (monthlyRevenue > 0 ? 100 : 0);
        setState({
            ...state,
            metrics: {
                ...state.metrics,
                burnRate: Math.round(burnRate),
                runway: Math.min(Math.round(runwayCapped), 100),
                revenue: revenueScore
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [burnRate, runwayCapped, monthlyRevenue, totalCost]);

    return (
        <div className="fp-root">

            <div className="fp-col fp-col-left">
                <div className="fp-col-header">
                    <span className="fp-col-label">INPUTS</span>
                    <span className="fp-col-sublabel">Financial Engine</span>
                </div>
                <div className="fp-scroll-zone">

                    <InputBlock title="Operating Costs" defaultOpen={true}>
                        <UInput label="Rent / Office" value={rent} onChange={setRent} placeholder="3000" />
                        <UInput label="Salaries" value={salaries} onChange={setSalaries} placeholder="15000" />
                        <UInput label="Utilities" value={utilities} onChange={setUtilities} placeholder="500" />
                        <UInput label="Tools / Software" value={tools} onChange={setTools} placeholder="800" />
                        <UInput label="Inventory / COGS" value={inventory} onChange={setInventory} placeholder="5000" />
                        <UInput label="Marketing Spend" value={marketing} onChange={setMarketing} placeholder="2000" />
                    </InputBlock>

                    <InputBlock title="Revenue Model">
                        <UInput label="Price Per Unit ($)" value={pricePerUnit} onChange={setPricePerUnit} placeholder="99" />
                        <UInput label="Customers / Month" value={customersPerMonth} onChange={setCustomersPerMonth} placeholder="200" />
                        <UInput label="Monthly Growth Rate (%)" value={growthRate} onChange={setGrowthRate} placeholder="5" />
                        <UInput label="Retention Rate (%)" value={retentionRate} onChange={setRetentionRate} placeholder="80" />
                    </InputBlock>

                    <InputBlock title="Capital Structure">
                        <div className="fp-field fp-field-readonly">
                            <label className="fp-label">Starting Capital</label>
                            <span className="fp-readonly-val">{fmt(capital)}</span>
                        </div>
                        <UInput label="Loan Amount ($)" value={loanAmount} onChange={setLoanAmount} placeholder="0" />
                        <UInput label="Annual Interest Rate (%)" value={interestRate} onChange={setInterestRate} placeholder="0" />
                    </InputBlock>

                    <InputBlock title="Advanced Variables">
                        <UInput label="Churn Rate (%/month)" value={churnRate} onChange={setChurnRate} placeholder="20" />
                        <UInput label="Cost Inflation (%/year)" value={costInflation} onChange={setCostInflation} placeholder="0" />
                        <UInput label="Scaling Cost Multiplier" value={scalingMultiplier} onChange={setScalingMultiplier} placeholder="1" />
                    </InputBlock>

                    <div className="fp-accuracy-toggle">
                        <button
                            className={'fp-accuracy-btn' + (advancedMode ? ' fp-accuracy-btn-on' : '')}
                            onClick={function () { setAdvancedMode(function (v) { return !v; }); }}
                            type="button"
                        >
                            {advancedMode ? 'Advanced Mode ON' : 'Advanced Accuracy Mode'}
                        </button>
                    </div>

                    {advancedMode && (
                        <div className="fp-advanced-sliders">
                            {[
                                ['Pricing Flexibility', pricingFlex, setPricingFlex],
                                ['Supplier Stability', supplierStability, setSupplierStability],
                                ['Hiring Speed', hiringSpeed, setHiringSpeed],
                                ['Demand Volatility', demandVolatility, setDemandVolatility],
                                ['Competitor Pressure', competitorPressure, setCompetitorPressure],
                                ['Market Maturity', marketMaturity, setMarketMaturity],
                                ['Expansion Friction', expansionFriction, setExpansionFriction],
                                ['Operational Efficiency', opEfficiency, setOpEfficiency],
                            ].map(function (item) {
                                var label = item[0]; var val = item[1]; var setter = item[2];
                                return (
                                    <div key={label} className="fp-adv-slider">
                                        <div className="fp-adv-slider-header">
                                            <span className="fp-label">{label}</span>
                                            <span className="fp-adv-val">{val}</span>
                                        </div>
                                        <input
                                            className="fp-range"
                                            type="range" min="0" max="100" value={val}
                                            onChange={function (e) { setter(Number(e.target.value)); }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>

            <div className="fp-col fp-col-center">
                <div className="fp-col-header">
                    <span className="fp-col-label">LIVE MODEL</span>
                    <span className="fp-col-sublabel">Financial Engine</span>
                </div>
                <div className="fp-scroll-zone">

                    <div className="fp-metrics-grid">

                        <div className="fp-metric-card">
                            <div className="fp-metric-top">
                                <span className="fp-metric-label">Monthly P/L</span>
                                <StatusDot level={profitLevel()} />
                            </div>
                            <div className={'fp-metric-value' + (monthlyProfit < 0 ? ' fp-val-neg' : ' fp-val-pos')}>
                                <AnimNum value={monthlyProfit} prefix={monthlyProfit >= 0 ? '+$' : '-$'} suffix="" />
                            </div>
                            <MetricBar pct={clamp(((monthlyRevenue / (totalCost + 1)) * 50), 0, 100)} level={profitLevel()} />
                        </div>

                        <div className="fp-metric-card">
                            <div className="fp-metric-top">
                                <span className="fp-metric-label">Runway</span>
                                <StatusDot level={runwayLevel()} />
                            </div>
                            <div className="fp-metric-value">
                                <AnimNum value={runway === 999 ? 999 : runwayCapped} prefix="" suffix=" mo" />
                            </div>
                            <MetricBar pct={(runwayCapped / 120) * 100} level={runwayLevel()} />
                        </div>

                        <div className="fp-metric-card">
                            <div className="fp-metric-top">
                                <span className="fp-metric-label">Burn Rate</span>
                                <StatusDot level={burnLevel()} />
                            </div>
                            <div className="fp-metric-value">
                                <AnimNum value={burnRate} prefix="$" suffix="/mo" />
                            </div>
                            <MetricBar pct={capital > 0 ? clamp((burnRate / capital) * 100 * 5, 0, 100) : 0} level={burnLevel()} />
                        </div>

                        <div className="fp-metric-card">
                            <div className="fp-metric-top">
                                <span className="fp-metric-label">Break-even</span>
                                <StatusDot level={breakevenMonth === 0 ? 'stable' : breakevenMonth && breakevenMonth < 18 ? 'warning' : 'critical'} />
                            </div>
                            <div className="fp-metric-value">
                                {breakevenMonth === 0
                                    ? <span>Now</span>
                                    : breakevenMonth
                                        ? <AnimNum value={breakevenMonth} prefix="Mo " suffix="" />
                                        : <span className="fp-val-na">—</span>
                                }
                            </div>
                            <MetricBar pct={breakevenMonth === 0 ? 100 : breakevenMonth ? clamp((24 - breakevenMonth) / 24 * 100, 0, 100) : 0} level={breakevenMonth === 0 ? 'stable' : 'warning'} />
                        </div>

                        <div className="fp-metric-card">
                            <div className="fp-metric-top">
                                <span className="fp-metric-label">Survival Prob.</span>
                                <StatusDot level={survLevel()} />
                            </div>
                            <div className="fp-metric-value">
                                <AnimNum value={survProb} prefix="" suffix="%" />
                            </div>
                            <MetricBar pct={survProb} level={survLevel()} />
                        </div>

                        <div className="fp-metric-card">
                            <div className="fp-metric-top">
                                <span className="fp-metric-label">Scale Threshold</span>
                                <StatusDot level={scalingMonth && scalingMonth <= 12 ? 'stable' : 'warning'} />
                            </div>
                            <div className="fp-metric-value">
                                {scalingMonth
                                    ? <AnimNum value={scalingMonth} prefix="Mo " suffix="" />
                                    : <span className="fp-val-na">—</span>
                                }
                            </div>
                            <MetricBar pct={scalingMonth ? clamp((24 - scalingMonth) / 24 * 100, 0, 100) : 0} level="warning" />
                        </div>

                    </div>

                    {totalCost > 0 && (
                        <div className="fp-breakdown">
                            <div className="fp-breakdown-title">COST BREAKDOWN</div>
                            <div className="fp-breakdown-row">
                                <span>Operating</span>
                                <span>{fmt(operatingCost)}</span>
                            </div>
                            <div className="fp-breakdown-row">
                                <span>Debt Service</span>
                                <span>{fmt(monthlyInterest)}</span>
                            </div>
                            <div className="fp-breakdown-row fp-breakdown-total">
                                <span>Total Monthly Cost</span>
                                <span>{fmt(totalCost)}</span>
                            </div>
                            <div className="fp-breakdown-row">
                                <span>Monthly Revenue</span>
                                <span>{fmt(monthlyRevenue)}</span>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <div className="fp-col fp-col-right">
                <div className="fp-col-header">
                    <span className="fp-col-label">INTELLIGENCE</span>
                    <span className="fp-col-sublabel">Analyst Engine</span>
                </div>
                <div className="fp-scroll-zone">

                    <div className="fp-insights-list">
                        {insights.map(function (ins, i) {
                            return (
                                <div key={i} className={'fp-insight-item fp-insight-' + ins.type}>
                                    <div className="fp-insight-marker" />
                                    <p className="fp-insight-text">{ins.text}</p>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        className="fp-continue-btn"
                        type="button"
                        onClick={function () { navigate('/dashboard'); }}
                    >
                        Continue to Dashboard →
                    </button>

                </div>
            </div>

        </div>
    );
}

export default FinancePage;
