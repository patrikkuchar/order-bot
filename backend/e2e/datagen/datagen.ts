import { randomUUID } from 'node:crypto'

const ALPHANUMERIC =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const NUMERIC = '0123456789'

const randomFrom = (chars: string, length: number): string => {
    let result = ''
    for (let i = 0; i < length; i++) {
        const idx = Math.floor(Math.random() * chars.length)
        result += chars[idx]
    }
    return result
}

const randomNumeric = (length: number): string => randomFrom(NUMERIC, length)

const randomNumber = (n: number): number => Math.floor(Math.random() * n) + 1

class DataGen {
    email(domain = 'example.com'): string {
        const local = randomUUID().replace(/-/g, '')
        return `${local}@${domain}`
    }

    str(length: number = 10): string {
        return randomFrom(ALPHANUMERIC, length)
    }

    password(length = 16): string {
        return randomFrom(ALPHANUMERIC, length)
    }

    phoneNumber(prefix = '+421', length = 9): string {
        return `${prefix}${randomNumeric(length)}`
    }

    ico(): string {
        return randomNumeric(8)
    }

    int(min = 0, max = 100): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    pickNRandom<T>(vals: T[], count: number): T[] {
        const res: T[] = []

        for (let i = 0; i < count; i++) {
            const idx = randomNumber(vals.length - 1)
            const p = vals[idx]
            res.push(p)
        }

        return res
    }
}

export const dataGen = new DataGen()