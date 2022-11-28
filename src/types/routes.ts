import { Router } from 'express'
import { ORM } from '../orm.js'

export interface Route {
    path: string
    // eslint-disable-next-line no-unused-vars
    routerClass: new (argument0: Router, argument1: ORM) => {
        createAndReturnRoutes: () => Router,
    },
}
