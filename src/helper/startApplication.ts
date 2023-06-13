import { config } from 'dotenv'
import express from 'express'
import { ORM } from '../orm.js'
import Application from '../application.js'

export const startApplication = async (): Promise<express.Application | undefined> => {
    config()

    try {
        const orm = await ORM.init()
        const server = express()
        const application = new Application(orm, server)
        return application.init()
    } catch (error: any) {
        console.error(error)
        return undefined
    }
}
