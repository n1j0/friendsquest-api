import express, { Request, Response } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { $app } from '../application.js'
import FootprintController from '../controller/footprintController.js'

const upload = multer()
const router = express.Router()
const storageReference = $app.firebase.storage().ref('gs://friends-quest.appspot.com')
const footprintController = new FootprintController()

// TODO better openapi documentation

/**
 * @openapi
 * /footprints:
 *   get:
 *     description: Returns all footprints
 *     responses:
 *       200:
 *         description: Returns footprints
 *       500:
 *         description: Error
 */
router.get(
    '/',
    (_request: Request, response: Response) => footprintController.getAllFootprints(response),
)

// TODO user information needs to be added

/**
 * @openapi
 * /footprints/{id}:
 *   post:
 *     description: Create a new reaction
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Numeric ID of the footprint the reaction is for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message of the reaction
 *                 required: true
 *     responses:
 *       204:
 *         description: OK
 *       500:
 *         description: Error
 */
router.post(
    '/:id',
    (request: Request, response: Response) => footprintController.createFootprintReaction(request, response),
)

/**
 * @openapi
 * /footprints/{id}:
 *   get:
 *     description: Get a footprint by uid
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the footprint to get
 *     responses:
 *       200:
 *         description: Returns a footprint by ID
 */
router.get(
    '/:id',
    (request: Request, response: Response) => footprintController.getFootprintById(request, response),
)

/**
 * @openapi
 * /footprints/{id}/reactions:
 *   get:
 *     description: Returns all reactions to the specified footprint
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the footprint reactions to get
 *     responses:
 *       200:
 *         description: Returns reactions
 *       500:
 *         description: Error
 */
router.get(
    '/:id/reactions',
    (request: Request, response: Response) => footprintController.getFootprintReactions(request, response),
)

// TODO documentation for post
// TODO picture compression
// TODO audio compression

/**
 * @openapi
 * /footprints:
 *   post:
 *     description: Create a footprint
*      consumes:
*        - multipart/form-data
*      parameters:
*        - in: formData
*          name: upfile
*          type: file
*          description: The file to upload.
*/
router.post('/', upload.single('test'), async (request: Request, response: Response) => {
    if (!request.body.title && !request.body.latitude && !request.body.longitude && !request.body.createdBy) {
        return response.status(400).json({ message: 'Missing required fields' })
    }

    // TODO maybe reduce the size of the image ( or in the frontend )
    // TODO upload the image to firebase storage
    // get maybe compressed blob file --> upload to firebase storage --> get url --> save to db

    if (request.file) {
        const image = request.body.files.image[0]

        const storage = await storageReference.upload(image, {
            public: true,
            destination: `/images/${uuidv4()}`,
            metadata: {
                firebaseStorageDownloadTokens: uuidv4(),
            },
        })

        // Link to file
        console.log(storage[0].metadata.mediaLink)
        return response.status(201).json(storage[0].metadata.mediaLink)
    }

    try {
        const footprint = await $app.footprintRepository.create(request.body)
        return response.status(201).json(footprint)
    } catch (error: any) {
        return response.status(500).json({ message: error.message })
    }
})

export const footprintRoutes = router
