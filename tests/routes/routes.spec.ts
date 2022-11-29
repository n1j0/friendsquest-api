import { routes } from '../../src/routes/routes'
import { UserRouter } from '../../src/routes/user'
import { FootprintRouter } from '../../src/routes/footprint'
import { FriendshipRouter } from '../../src/routes/friendship'

jest.mock('../../src/routes/user.js', () => ({
    UserRouter: {},
}))

jest.mock('../../src/routes/footprint.js', () => ({
    FootprintRouter: {},
}))

jest.mock('../../src/routes/friendship.js', () => ({
    FriendshipRouter: {},
}))

describe('routes', () => {
    it('returns routes with path and routerClass', () => {
        expect(routes).toBeInstanceOf(Array)
        expect(routes).toHaveProperty('length', 3)
        expect(routes[0]).toHaveProperty('path')
        expect(routes[0]).toHaveProperty('routerClass')
    })

    it.each([
        [ '/users', UserRouter ],
        [ '/footprints', FootprintRouter ],
        [ '/friendships', FriendshipRouter ],
    ])('returns "%s" route with router class', (path: string, routerClass: any) => {
        expect(routes).toEqual(
            expect.arrayContaining([
                {
                    path,
                    routerClass,
                },
            ]),
        )
    })
})
