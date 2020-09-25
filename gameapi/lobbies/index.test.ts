import db from "../../database";
import { createLobby } from "./handling";

beforeAll(() => {
    db.migrate.latest();
})

test('Creates lobby', async () => {
    expect(await createLobby()).toHaveReturned();
});