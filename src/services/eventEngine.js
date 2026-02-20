function generateRandomEvent() {
    var roll = Math.floor(Math.random() * 100) + 1;

    if (roll > 20) return null;

    var events = [
        {
            name: 'Competitor Entered Market',
            effects: { risk: 10 }
        },
        {
            name: 'Viral Growth',
            effects: { growth: 15 }
        },
        {
            name: 'Supplier Cost Increase',
            effects: { burnRate: 10 }
        }
    ];

    var index = Math.floor(Math.random() * events.length);
    return events[index];
}

export { generateRandomEvent };
