import { ORM } from '../src/orm'

jest.mock('../src/config/mikro-orm.config.js', () => ({}))

jest.mock('@mikro-orm/core', () => ({
    MikroORM: {
        init: jest.fn().mockResolvedValue({
            em: {
                fork: jest.fn().mockReturnValue({ foo: 'bar' }),
            },
        }),
    },
}))

describe('ORM', () => {
    it('has a static method to initialize and return the orm', async () => {
        expect(ORM.init).toBeDefined()
        expect(await ORM.init() instanceof ORM).toBe(true)
    })

    it('returns a fork of the entity manager', async () => {
        const orm = await ORM.init()
        expect(orm.forkEm()).toStrictEqual({ foo: 'bar' })
    })
})
