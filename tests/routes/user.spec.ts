import { usersRoutes } from '../../src/routes/user'

jest.mock('../../src/$app', () => {})
jest.mock('../../src/controller/userController')
jest.mock('express', () => ({
    Router: () => ({
        delete: jest.fn(),
        get: jest.fn(),
        patch: jest.fn(),
        post: jest.fn(),
    }),
}))

describe('UsersRoutes', () => {
    it('has route to get all users', () => {
        expect(usersRoutes.get).toEqual(expect.any(Function))
        expect(usersRoutes.get).toHaveBeenNthCalledWith(1, '/', expect.any(Function))
    })

    it('has route to get a specific user', () => {
        expect(usersRoutes.get).toEqual(expect.any(Function))
        expect(usersRoutes.get).toHaveBeenNthCalledWith(2, '/:id', expect.any(Function))
    })

    it('has route to get a specific user by uid', () => {
        expect(usersRoutes.get).toEqual(expect.any(Function))
        expect(usersRoutes.get).toHaveBeenNthCalledWith(3, '/uid/:uid', expect.any(Function))
    })

    it('has route to create a new user', () => {
        expect(usersRoutes.post).toEqual(expect.any(Function))
        expect(usersRoutes.post).toHaveBeenNthCalledWith(1, '/', expect.any(Function))
    })

    it('has route to update an user - with middleware', () => {
        expect(usersRoutes.patch).toEqual(expect.any(Function))
        expect(usersRoutes.patch).toHaveBeenNthCalledWith(1, '/:id', expect.any(Function), expect.any(Function))
    })

    it('has route to delete an user - with middleware', () => {
        expect(usersRoutes.delete).toEqual(expect.any(Function))
        expect(usersRoutes.delete).toHaveBeenNthCalledWith(1, '/:id', expect.any(Function), expect.any(Function))
    })
})
