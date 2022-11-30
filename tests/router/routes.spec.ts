import { routes } from '../../src/router/routes'
import { UserRouter } from '../../src/router/userRouter'
import { FootprintRouter } from '../../src/router/footprintRouter'
import { FriendshipRouter } from '../../src/router/friendshipRouter'

jest.mock('../../src/router/userRouter.js', () => ({
    UserRouter: {},
}))

jest.mock('../../src/router/footprintRouter.js', () => ({
    FootprintRouter: {},
}))

jest.mock('../../src/router/friendshipRouter.js', () => ({
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
