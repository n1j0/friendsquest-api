import { config } from 'dotenv'
import express from 'express'
import Application from './application.js'
import { ORM } from './orm.js'

// possible: outsource and test the function
// http request to /health router and check for "up"
config()

try {
    const orm = await ORM.init()
    const server = express()
    const application = new Application(orm, server)
    await application.migrate()
    application.init()
} catch (error: any) {
    console.error(error)
}
