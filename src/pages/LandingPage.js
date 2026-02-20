import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStartup } from '../context/StartupContext';
import { phases } from '../data/phases';
import { analyzeStartup } from '../services/analysisEngine';
import { predictOutcomes } from '../services/projectionEngine';

var TABS = ['Revenue', 'Growth', 'Risk', 'Market', 'Strategy'];

function getInsightContent(tab, state, hasStartup) {
  var metrics = state.metrics;
  var startup = state.startup;

  if (tab === 'Revenue') {
    var revenue = hasStartup ? metrics.revenue : 0;
    var capital = hasStartup ? startup.capital : 0;
    var runway = hasStartup ? metrics.runway : 0;
    return {
      title: 'Revenue Intelligence',
      sections: [
        {
          heading: 'Calculation Model',
          text: 'Revenue is projected using a compounding growth model factored by market fit, team efficiency, and capital deployment rate.'
        },
        {
          heading: 'Formula Logic',
          text: 'Base Revenue × (1 + Growth Rate) × Market Fit Coefficient − Burn Rate = Net Revenue Projection'
        },
        {
          heading: 'Key Factors',
          text: 'Capital allocation efficiency, customer acquisition cost, product-market alignment, and pricing strategy directly influence revenue trajectory.'
        },
        {
          heading: 'Current Snapshot',
          text: hasStartup
            ? 'Revenue: $' + revenue + 'K · Capital: $' + capital + 'K · Runway: ' + runway + ' months'
            : 'Start a simulation to see live revenue data.'
        }
      ]
    };
  }

  if (tab === 'Growth') {
    var growth = hasStartup ? metrics.growth : 0;
    return {
      title: 'Growth Analysis',
      sections: [
        {
          heading: 'Growth Drivers',
          text: 'User acquisition velocity, organic reach, network effects, and product stickiness are the primary drivers of sustainable growth.'
        },
        {
          heading: 'Scaling Logic',
          text: 'Growth follows an S-curve model — slow initial traction, rapid scaling phase, then market saturation. Strategy timing is critical.'
        },
        {
          heading: 'Forecast Model',
          text: hasStartup
            ? 'Current growth rate: ' + growth + '%. The engine projects trajectory based on historical decision patterns and market conditions.'
            : 'Start a simulation to see growth forecasts.'
        }
      ]
    };
  }

  if (tab === 'Risk') {
    var risk = hasStartup ? metrics.risk : 0;
    var projections = hasStartup ? predictOutcomes(metrics) : null;
    return {
      title: 'Risk Assessment',
      sections: [
        {
          heading: 'Risk Score Logic',
          text: 'Risk is computed as a weighted composite of financial instability, market volatility, competitive pressure, and execution uncertainty.'
        },
        {
          heading: 'Risk Factors',
          text: 'Low runway, high burn rate, weak market fit, undiversified revenue streams, and aggressive scaling without validation increase risk.'
        },
        {
          heading: 'Failure Probability',
          text: hasStartup
            ? 'Current risk: ' + risk + '% · Worst-case outcome: ' + Math.round(projections.worstCase) + '% viability. The model accounts for cascading failure scenarios.'
            : 'Start a simulation to see risk analysis.'
        }
      ]
    };
  }

  if (tab === 'Market') {
    var marketFit = hasStartup ? metrics.marketFit : 0;
    return {
      title: 'Market Intelligence',
      sections: [
        {
          heading: 'Demand Analysis',
          text: 'Market demand is evaluated through industry growth rate, total addressable market size, and customer willingness-to-pay signals.'
        },
        {
          heading: 'Competition Impact',
          text: 'Competitive density reduces market opportunity. The model factors in market share distribution, entry barriers, and differentiation strength.'
        },
        {
          heading: 'Opportunity Score',
          text: hasStartup
            ? 'Market fit: ' + marketFit + '%. Higher fit indicates stronger product-market alignment and greater opportunity capture.'
            : 'Start a simulation to see market analysis.'
        }
      ]
    };
  }

  if (tab === 'Strategy') {
    var analysis = hasStartup ? analyzeStartup(state) : null;
    return {
      title: 'Strategic Insights',
      sections: [
        {
          heading: 'Recommended Actions',
          text: hasStartup && analysis.strengths.length > 0
            ? 'Leverage: ' + analysis.strengths.join(', ') + '.'
            : 'Complete a simulation to receive strategic recommendations.'
        },
        {
          heading: 'Optimization Areas',
          text: hasStartup && analysis.weaknesses.length > 0
            ? 'Improve: ' + analysis.weaknesses.join(', ') + '.'
            : 'No weaknesses detected yet — start a simulation.'
        },
        {
          heading: 'Strategic Direction',
          text: hasStartup
            ? 'Health: ' + analysis.healthStatus + '. Focus on maximizing strengths while mitigating identified risk factors for optimal trajectory.'
            : 'Start a simulation to unlock strategy engine.'
        }
      ]
    };
  }

  return { title: '', sections: [] };
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function animateScrollTo(targetY, duration) {
  var startY = window.scrollY;
  var distance = targetY - startY;
  var startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var elapsed = timestamp - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var eased = easeOutExpo(progress);
    window.scrollTo(0, startY + distance * eased);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function LandingPage() {
  var { state } = useStartup();
  var navigate = useNavigate();
  var hasStartup = state.startup.name !== '';

  var activeTabState = React.useState('Revenue');
  var activeTab = activeTabState[0];
  var setActiveTab = activeTabState[1];

  var animatingState = React.useState(false);
  var animating = animatingState[0];
  var setAnimating = animatingState[1];

  var contentState = React.useState(function () {
    return getInsightContent('Revenue', state, hasStartup);
  });
  var content = contentState[0];
  var setContent = contentState[1];

  React.useEffect(function () {
    var alreadyPlayed = sessionStorage.getItem('introPlayed');

    if (alreadyPlayed) {
      
      window.scrollTo(0, window.innerHeight);
      return;
    }

    window.scrollTo(0, 0);

    var timer = setTimeout(function () {
      sessionStorage.setItem('introPlayed', 'yes');
      animateScrollTo(window.innerHeight, 900);
    }, 7000);

    return function () { clearTimeout(timer); };
  }, []);

  function handleTabClick(tab) {
    if (tab === activeTab) return;
    setAnimating(true);
    setTimeout(function () {
      setActiveTab(tab);
      setContent(getInsightContent(tab, state, hasStartup));
      setAnimating(false);
    }, 200);
  }

  return (
    <div className="hp-root">

      <div className="hp-hero">
        <h1 className="hp-hero-title">VentureSim</h1>
        <p className="hp-hero-tagline">Predict your startup's future before you launch.</p>
        <button
          className="hp-hero-btn"
          onClick={function () { navigate(hasStartup ? '/dashboard' : '/setup'); }}
        >
          {hasStartup ? 'Go to Dashboard' : 'Start Simulation'}
        </button>
      </div>

      <div className="hp-main-content">
        <div className="hp-switcher-bar">
          {TABS.map(function (tab) {
            return (
              <button
                key={tab}
                className={'hp-switcher-tab' + (activeTab === tab ? ' hp-switcher-active' : '')}
                onClick={function () { handleTabClick(tab); }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className={'hp-insight-panel' + (animating ? ' hp-insight-exit' : '')}>
          <h2 className="hp-insight-title">{content.title}</h2>
          {content.sections.map(function (sec, i) {
            return (
              <div className="hp-insight-block" key={i}>
                <h3 className="hp-insight-heading">{sec.heading}</h3>
                <p className="hp-insight-text">{sec.text}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default LandingPage;
