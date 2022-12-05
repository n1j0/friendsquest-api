import { Route } from '../types/routes'
import { UserRouter } from './userRouter.js'
import { FootprintRouter } from './footprintRouter.js'
import { FriendshipRouter } from './friendshipRouter.js'
import { LeaderboardRouter } from './leaderboardRouter.js'

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
    {
        path: '/leaderboard',
        routerClass: LeaderboardRouter,
    },
]
