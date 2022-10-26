import express, { Request, Response } from 'express'
import fetch from 'node-fetch'
import ErrorController from '../controller/errorController.js'

const router = express.Router()

/**
 * @openapi
 * /firebase/token:
 *   get:
 *     summary: Receive a firebase token for test user
 *     responses:
 *       200:
 *         description: Returns the idToken
 *       500:
 *         description: Internal server error
 */
router.get('/token', async (_request: Request, response: Response) => {
    try {
        const token = await fetch(
            // eslint-disable-next-line max-len
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_WEB_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: process.env.FIREBASE_TEST_USER,
                    password: process.env.FIREBASE_TEST_PASSWORD,
                    returnSecureToken: true,
                }),
            },
        )
        return response.status(200).json((await token.json() as any).idToken)
    } catch (error: any) {
        return ErrorController.sendError(response, 500, error)
    }
})

export const firebaseRoutes = router
