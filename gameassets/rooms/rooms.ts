export type Room = {
    id: string,
    name: string,
    adjacentRooms: AdjacentRooms,
    specialEvent?: string | null,
    statsEffects?: Stats | null,
    movesToFloor: number[]
}

export type AdjacentRooms = {
    left: boolean,
    right: boolean,
    bottom: boolean,
    top: boolean
}

export type Stats = {
    sanity: number,
    physical: number,
    intelligence: number,
    bravery: number
}