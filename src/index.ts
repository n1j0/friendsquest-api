import { config } from 'dotenv'
import Application from './application.js'
import { ORM } from './orm.js'

config()

try {
    const orm = await ORM.init()
    const application = new Application(orm)
    await application.connect()
    application.init()
} catch (error: any) {
    console.error(error)
}
