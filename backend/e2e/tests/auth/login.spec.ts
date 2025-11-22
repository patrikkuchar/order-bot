import { it, expect, describe } from 'vitest'
import {publicUser} from "../../client/users";

describe('auth', () => {
    it('login', async () => {
        const email = 'alice@email.com';
        const password = 'pass123';

        const res = await publicUser.authApi.login({
            email, password
        });

        expect(res.data).toBeDefined();
    })
})
