import { config } from 'dotenv'
import Application from './application'

if (process.env.NODE_ENV !== 'production') {
    config()
}

const application = new Application()
await application.connect()
application.init()
