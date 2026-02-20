import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';

var allIndustries = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'saas', label: 'SaaS' },
    { value: 'retail', label: 'Retail' },
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'fintech', label: 'Fintech' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'ai', label: 'AI' },
    { value: 'ecommerce', label: 'Ecommerce' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'travel', label: 'Travel' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'real estate', label: 'Real Estate' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'consulting', label: 'Consulting' }
];

var experienceLevels = [
    { value: 0, label: '0 — No Experience' },
    { value: 1, label: '1 — Beginner' },
    { value: 2, label: '2 — Basic Knowledge' },
    { value: 3, label: '3 — Some Experience' },
    { value: 4, label: '4 — Intermediate' },
    { value: 5, label: '5 — Skilled' },
    { value: 6, label: '6 — Advanced' },
    { value: 7, label: '7 — Expert' },
    { value: 8, label: '8 — Specialist' },
    { value: 9, label: '9 — Veteran' },
    { value: 10, label: '10 — Serial Founder' }
];

var industryBenchmarks = {
    restaurant: 40000,
    saas: 150000,
    retail: 60000,
    ai: 200000,
    fintech: 180000,
    marketplace: 120000,
    healthcare: 160000,
    education: 50000,
    ecommerce: 80000,
    logistics: 100000,
    travel: 90000,
    entertainment: 70000,
    'real estate': 150000,
    manufacturing: 200000,
    consulting: 30000
};

var STEPS = ['Identity', 'Capital', 'Founder', 'Risk', 'Review'];

function clamp(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
}

function getRiskLabel(value) {
    if (value <= 25) return 'Low Risk';
    if (value <= 50) return 'Moderate';
    if (value <= 75) return 'High';
    return 'Aggressive';
}

function getCapitalInsight(cap, industry) {
    var benchmark = industryBenchmarks[industry] || 0;
    if (cap === 0) return 'Enter starting capital to estimate runway.';
    if (benchmark > 0 && cap < benchmark) return 'Below industry average — consider increasing.';
    return 'Strong starting position for this sector.';
}

function getExperienceInsight(exp) {
    if (exp <= 2) return 'Low experience increases early-stage failure risk.';
    if (exp <= 5) return 'Moderate experience — solid foundation.';
    if (exp <= 8) return 'Strong experience improves decision stability.';
    return 'Veteran-level — maximum strategic advantage.';
}

function SetupPage() {
    var { state, setState } = useStartup();
    var navigate = useNavigate();

    var [step, setStep] = useState(0);
    
    var [visible, setVisible] = useState(0);
    var [fading, setFading] = useState(false);

    var [name, setName] = useState('');
    var [industry, setIndustry] = useState('restaurant');
    var [capital, setCapital] = useState(0);
    var [experience, setExperience] = useState(0);
    var [riskTolerance, setRiskTolerance] = useState(50);

    var tabRefs = useRef([]);
    var [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    useEffect(function () {
        var el = tabRefs.current[step];
        if (el) {
            var parent = el.parentElement;
            var parentRect = parent.getBoundingClientRect();
            var rect = el.getBoundingClientRect();
            setIndicatorStyle({
                left: rect.left - parentRect.left,
                width: rect.width
            });
        }
    }, [step]);

    function switchStep(index) {
        if (index === step) return;
        
        setFading(true);
        setTimeout(function () {
            setStep(index);
            setVisible(index);
            setFading(false);
        }, 200);
    }

    useEffect(function () {
        document.body.classList.add('sp-no-scroll');
        return function () {
            document.body.classList.remove('sp-no-scroll');
        };
    }, []);

    var cap = Number(capital) || 0;
    var exp = Number(experience) || 0;
    var riskT = Number(riskTolerance) || 0;

    var capitalScore;
    if (cap < 10000) capitalScore = 20;
    else if (cap < 50000) capitalScore = 40;
    else if (cap < 200000) capitalScore = 60;
    else capitalScore = 80;

    var experienceScore = exp * 10;
    var riskScore;
    if (riskT <= 30) riskScore = 60;
    else if (riskT <= 70) riskScore = 80;
    else riskScore = 50;

    var feasibility = clamp(Math.round((capitalScore + experienceScore + riskScore) / 3), 0, 100);

    var highDifficulty = ['ai', 'fintech', 'manufacturing'];
    var medDifficulty = ['saas', 'marketplace', 'healthcare'];
    var industryDifficulty;
    if (highDifficulty.indexOf(industry) !== -1) industryDifficulty = 'High';
    else if (medDifficulty.indexOf(industry) !== -1) industryDifficulty = 'Medium';
    else industryDifficulty = 'Low';

    function handleSubmit() {
        setState({
            ...state,
            startup: {
                ...state.startup,
                name: name,
                industry: industry,
                capital: cap,
                experience: exp,
                riskTolerance: riskT,
                status: 'active'
            },
            metrics: {
                ...state.metrics,
                teamStrength: clamp(exp * 10, 0, 100),
                risk: clamp(riskT, 0, 100),
                runway: cap > 0 ? Math.min(Math.round(cap / 10000), 100) : 0,
                marketFit: 0,
                growth: 0,
                revenue: 0,
                burnRate: 0,
                brand: 0,
                scalability: 0
            },
            currentPhase: 0,
            history: [],
            insights: [],
            futureEffects: []
        });
        navigate('/market');
    }

    var industryLabel = allIndustries.find(function (i) { return i.value === industry; }).label;

    function renderContent() {
        
        if (visible === 0) {
            return (
                <div className="sp-form-content">
                    <div className="sp-field">
                        <label className="sp-label">Startup Name</label>
                        <input
                            className="sp-input"
                            type="text"
                            value={name}
                            placeholder="e.g. NovaTech Solutions"
                            onChange={function (e) { setName(e.target.value); }}
                        />
                    </div>
                    <div className="sp-field">
                        <label className="sp-label">Industry</label>
                        <select
                            className="sp-select"
                            value={industry}
                            onChange={function (e) { setIndustry(e.target.value); }}
                        >
                            {allIndustries.map(function (ind) {
                                return <option key={ind.value} value={ind.value}>{ind.label}</option>;
                            })}
                        </select>
                        <span className="sp-hint">Industry affects cost models, risk levels, and growth difficulty.</span>
                    </div>
                </div>
            );
        }

        if (visible === 1) {
            return (
                <div className="sp-form-content">
                    <div className="sp-field sp-field-center">
                        <label className="sp-label">Starting Capital ($)</label>
                        <input
                            className="sp-input sp-input-large"
                            type="number"
                            value={capital}
                            placeholder="500000"
                            onChange={function (e) { setCapital(e.target.value); }}
                        />
                        <span className="sp-insight">{getCapitalInsight(cap, industry)}</span>
                    </div>
                </div>
            );
        }

        if (visible === 2) {
            return (
                <div className="sp-form-content">
                    <div className="sp-field sp-field-center">
                        <label className="sp-label">Experience Level</label>
                        <select
                            className="sp-select"
                            value={experience}
                            onChange={function (e) { setExperience(Number(e.target.value)); }}
                        >
                            {experienceLevels.map(function (lvl) {
                                return <option key={lvl.value} value={lvl.value}>{lvl.label}</option>;
                            })}
                        </select>
                        <span className="sp-insight">{getExperienceInsight(exp)}</span>
                    </div>
                </div>
            );
        }

        if (visible === 3) {
            return (
                <div className="sp-form-content">
                    <div className="sp-field sp-field-center">
                        <label className="sp-label">Risk Tolerance — {riskTolerance}</label>
                        <input
                            className="sp-range"
                            type="range"
                            min="0"
                            max="100"
                            value={riskTolerance}
                            onChange={function (e) { setRiskTolerance(Number(e.target.value)); }}
                        />
                        <span className="sp-risk-label">{getRiskLabel(riskTolerance)}</span>
                        <span className="sp-hint">Determines how aggressively your startup operates.</span>
                    </div>
                </div>
            );
        }

        if (visible === 4) {
            return (
                <div className="sp-form-content">
                    <div className="sp-review">
                        <div className="sp-review-row">
                            <span className="sp-review-label">Name</span>
                            <span className="sp-review-value">{name || '—'}</span>
                        </div>
                        <div className="sp-review-row">
                            <span className="sp-review-label">Industry</span>
                            <span className="sp-review-value">{industryLabel}</span>
                        </div>
                        <div className="sp-review-row">
                            <span className="sp-review-label">Capital</span>
                            <span className="sp-review-value">${cap.toLocaleString()}</span>
                        </div>
                        <div className="sp-review-row">
                            <span className="sp-review-label">Risk Level</span>
                            <span className="sp-review-value">{getRiskLabel(riskTolerance)}</span>
                        </div>
                        <div className="sp-review-row">
                            <span className="sp-review-label">Difficulty</span>
                            <span className="sp-review-value">{industryDifficulty}</span>
                        </div>
                        <div className="sp-review-row">
                            <span className="sp-review-label">Feasibility</span>
                            <span className="sp-review-value">{feasibility}%</span>
                        </div>
                    </div>
                    <button className="sp-launch" type="button" onClick={handleSubmit}>
                        Launch Simulation
                    </button>
                </div>
            );
        }

        return null;
    }

    return (
        <div className="sp-root">
            
            <div className="sp-card">

                <div className="sp-card-header">
                    <h1 className="sp-title">Setup</h1>
                    <p className="sp-subtitle">Configure your simulation parameters</p>
                </div>

                <div className="sp-tabbar">
                    {STEPS.map(function (label, i) {
                        return (
                            <button
                                key={label}
                                ref={function (el) { tabRefs.current[i] = el; }}
                                className={'sp-tab' + (step === i ? ' sp-tab-active' : '')}
                                onClick={function () { switchStep(i); }}
                                type="button"
                            >
                                {label}
                            </button>
                        );
                    })}
                    
                    <div
                        className="sp-tab-indicator"
                        style={{
                            left: indicatorStyle.left + 'px',
                            width: indicatorStyle.width + 'px'
                        }}
                    />
                </div>

                <div className="sp-divider" />

                <div className="sp-scroll-area">
                    <div className={'sp-content-inner' + (fading ? ' sp-content-fading' : '')}>
                        {renderContent()}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default SetupPage;
