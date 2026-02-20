const decisions = [
    {
        id: "hire_senior_dev",
        title: "Hire a Senior Developer",
        effects: {
            teamStrength: 15,
            burnRate: 12,
            scalability: 10
        }
    },
    {
        id: "launch_ad_campaign",
        title: "Launch Paid Ad Campaign",
        effects: {
            brand: 20,
            growth: 10,
            burnRate: 8,
            revenue: 5
        }
    },
    {
        id: "pivot_product",
        title: "Pivot the Product",
        effects: {
            marketFit: 25,
            risk: 15,
            growth: -10,
            brand: -5
        }
    },
    {
        id: "raise_funding",
        title: "Raise a Funding Round",
        effects: {
            growth: 15,
            scalability: 12,
            risk: 10,
            burnRate: 5
        }
    },
    {
        id: "cut_costs",
        title: "Cut Operational Costs",
        effects: {
            burnRate: -20,
            teamStrength: -10,
            risk: -5
        }
    },
    {
        id: "expand_market",
        title: "Expand to New Market",
        effects: {
            marketFit: 10,
            growth: 20,
            risk: 18,
            revenue: 12,
            brand: 8
        }
    },
    {
        id: "build_partnerships",
        title: "Build Strategic Partnerships",
        effects: {
            brand: 12,
            scalability: 15,
            revenue: 8,
            risk: -5
        }
    },
    {
        id: "improve_product",
        title: "Invest in Product Quality",
        effects: {
            marketFit: 18,
            brand: 10,
            burnRate: 6,
            growth: 5,
            scalability: 8
        }
    }
];

export { decisions };
