import { Router } from 'express'
import { ORM } from '../orm.js'
import { RouterInterface } from '../routes/routerInterface'

export interface Route {
    path: string
    // eslint-disable-next-line no-unused-vars
    routerClass: new (argument0: Router, argument1: ORM) => RouterInterface
}
