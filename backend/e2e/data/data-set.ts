export type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

const alice: User = {
    id: '72439bb7-a739-42bd-8327-0bae849f0656',
    email: 'alice@email.com',
    firstName: 'Alice',
    lastName: 'Doe'
}

const bob: User = {
    id: '45a91d97-f252-4688-bbff-4ad3ed169a20',
    email: 'bob@email.com',
    firstName: 'Bob',
    lastName: 'Doe'
}

const admin: User = {
    id: 'd3b07384-d9a1-4f5d-8c2d-6c8e0f2f4f5a',
    email: 'admin@email.com',
    firstName: 'Admin',
    lastName: 'Adminovic'
}

const password = 'pass123';

export const userDs = {
    alice,
    bob,
    admin,
    password
}

