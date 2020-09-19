export const Items = [
    {
        id: 'pewpew',
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
        id: 'magic_stone',
        name: "Piedra con poderes mágicos",
        singleUse: true,
        needsThrow: true
    },
    {
        id: 'totem',
        name: "Totém pequeño",
        statsChange: {
            sanity: -1,
            physical: 0,
            inteligence: 0,
            balls: 0
        }
    },
    {
        id: 'daga',
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
        id: 'key',
        name: "Llave del mayordomo",
        useAs: 'key',
        singleUse: true
    },
    {
        name: "Cuerda",
        moves: true
    },
    {
        id: 'adrenaline',
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