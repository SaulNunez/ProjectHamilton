import { type } from "os";
import { Stats } from "../rooms/rooms";

export type Character = {
    id: string,
    name: string,
    description: string,
    stats: Stats
}