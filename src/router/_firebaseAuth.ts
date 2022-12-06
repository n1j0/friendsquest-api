import express, { Request, Response } from 'express'
import fetch from 'node-fetch'
import ErrorController from '../controller/errorController.js'
import { InternalServerError } from '../errors/InternalServerError.js'

const router = express.Router()

/**
 * @openapi
 * /firebase/token:
 *   get:
 *     summary: Receive a firebase token for a specified test user
 *     parameters:
 *       - in: header
 *         name: userid
 *         schema:
 *           type: string
 *           required: true
 *           description: Number of the test user (1 or 2)
 *     responses:
 *       200:
 *         description: Returns the idToken
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/token', async (request: Request, response: Response) => {
    const user = request.headers.userid as string
    if (![ '1', '2' ].includes(user)) {
        return ErrorController.sendError(response, InternalServerError.getErrorDocument('Test user not specified'))
    }
    const body = {
        email: user === '1' ? process.env.FIREBASE_TEST_USER1 : process.env.FIREBASE_TEST_USER2,
        password: user === '1' ? process.env.FIREBASE_TEST_PASSWORD1 : process.env.FIREBASE_TEST_PASSWORD2,
    }
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
                    ...body,
                    returnSecureToken: true,
                }),
            },
        )
        return response.status(200).json((await token.json() as any).idToken)
    } catch (error: any) {
        return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
    }
})

export const firebaseRoutes = router
