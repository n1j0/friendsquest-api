import { Router } from 'express'

export interface RouterInterface {
    createAndReturnRoutes(): Router
}
