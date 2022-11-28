import { Route } from '../types/routes'
import { UserRouter } from './user.js'
import { FootprintRouter } from './footprint.js'
import { FriendshipRouter } from './friendship.js'

export const routes: Route[] = [
    {
        path: '/users',
        routerClass: UserRouter,
    },
    {
        path: '/footprints',
        routerClass: FootprintRouter,
    },
    {
        path: '/friendships',
        routerClass: FriendshipRouter,
    },
]
