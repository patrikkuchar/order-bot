import { it, expect, describe } from 'vitest'
import {publicUser} from "../../client/users";
import {userDs} from "../../data/data-set";

describe('auth', () => {
    it('login', async () => {
        const user = userDs.alice;

        const res = await publicUser.authApi.login({
            email: user.email,
            password: userDs.password
        });

        expect(res).toHaveProperty('data')
        const loginRes = res.data
        //console.log(loginRes.token); // Uncomment to see the token

        expect(loginRes.userInfo).toMatchObject({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        })
    })
})
