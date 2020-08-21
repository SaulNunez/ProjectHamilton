export const Items = [
    {
        name: "Pistola",
        needsThrow: true,
        affectsOtherPlayer: true, 
        statsChange: {
            sanity: 0,
            physical: -1,
            inteligence: 0,
            balls: 0
        },
        singleUse: true
    },
    {
        name: "Piedra con poderes mágicos",
        singleUse: true,
        needsThrow: true
    },
    {
        name: "Totém pequeño",
        statsChange: {
            sanity: -1,
            physical: 0,
            inteligence: 0,
            balls: 0
        }
    },
    {
        name: "Daga sacrificial",
        needsThrow: true,
        customThrow: {
            shitsUsed: 3,
        },
        statsChange: {
            sanity: 0,
            physical: -1,
            inteligence: 0,
            balls: 0
        }
    },
    {
        name: "Llave del mayordomo",
        useAs: 'key',
        singleUse: true
    },
    {
        name: "Cuerda",
        useAs: 'ladder'
    },
    {
        name: "Injección de adrenalina",
        singleUse: true,
        statsChange: {
            sanity: -1,
            physical: 1,
            inteligence: 0,
            balls: 2
        }
    }
];