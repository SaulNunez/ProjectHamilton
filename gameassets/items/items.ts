import { Stats } from "../rooms/rooms";

export type Items = {
    id: string,
    name: string,
    needsThrow: boolean,
    affectOtherPlayer: true,
    statsChange: Stats,
    singleUse: boolean,
    moves?: boolean
};