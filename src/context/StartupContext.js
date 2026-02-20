import React, { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'venture_sim_state';

const initialState = {
    startup: {
        name: "",
        industry: "",
        capital: 0,
        experience: 0,
        riskTolerance: 0,
        status: "active"
    },

    metrics: {
        marketFit: 0,
        teamStrength: 0,
        growth: 0,
        revenue: 0,
        risk: 0,
        burnRate: 0,
        runway: 0,
        brand: 0,
        scalability: 0
    },

    currentPhase: 0,

    history: [],

    insights: [],

    futureEffects: []
};

function loadState() {
    try {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        
    }
    return initialState;
}

function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        
    }
}

const StartupContext = createContext();

function StartupProvider({ children }) {
    const [state, setStateInternal] = useState(loadState);

    const setState = useCallback(function (newState) {
        setStateInternal(newState);
        saveState(newState);
    }, []);

    return (
        <StartupContext.Provider value={{ state, setState }}>
            {children}
        </StartupContext.Provider>
    );
}

function useStartup() {
    return useContext(StartupContext);
}

export { StartupContext, StartupProvider, useStartup };
