import express, { Request, Response } from 'express'
import fetch from 'node-fetch'

const router = express.Router()

/**
 * @openapi
 * /firebase/token:
 *   get:
 *     description: Receive a firebase token for test user
 *     responses:
 *       200:
 *         description: Returns the idToken
 */
router.get('/token', async (_request: Request, response: Response) => {
    const token = await fetch(
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
})

export const firebaseRoutes = router
