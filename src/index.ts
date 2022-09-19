import express, { Request, Response, Application } from 'express'
import { config } from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
    config()
}

const app: Application = express()
const port: number = Number.parseInt(process.env.PORT as string, 10) || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get(
    '/',
    (_request: Request, response: Response) => response.status(200).json('Hello World'),
)

try {
    app.listen(port, (): void => {
        console.log(`Connected successfully on port ${port}`)
    })
} catch (error: any) {
    console.error(`Error occurred: ${error.message}`)
}
