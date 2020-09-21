import { createLobby } from ".";
import db from "../../database";

beforeAll(() => {
    db.migrate.latest();
})

test('Creates lobby', async () => {
    expect(await createLobby()).toHaveReturned();
});