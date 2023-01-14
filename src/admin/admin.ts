import { Request, Response, Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'
import { ORM } from '../orm.js'
import { openapiSpecification } from '../docs/swagger.js'

export class AdminRouter {
    private readonly router: Router

    private readonly orm: ORM

    constructor(router: Router, orm: ORM) {
        this.router = router
        this.orm = orm
    }

    createAndReturnRoutes = () => {
        this.router.get(
            '/',
            (_request: Request, response: Response) => response.render('index', { title: 'Admin Panel' }),
        )

        this.router.use('/docs', swaggerUi.serve)
        this.router.get('/docs', swaggerUi.setup(openapiSpecification))

        this.router.get(
            '/tables',
            (_request: Request, response: Response) => {
                const em = this.orm.forkEm()
                const tables = em.getMetadata().getAll()
                return response.render('tables', { title: 'Tables', tables: Object.values(tables) })
            },
        )

        this.router.get(
            '/tables/get/:table',
            async (request: Request, response: Response) => {
                const em = this.orm.forkEm()
                const { table } = request.params
                let entities: any[]
                try {
                    if (table.includes('_')) {
                        entities = await em.execute(`SELECT * FROM ${table}`)
                    } else {
                        const repository = em.getRepository(table)
                        entities = await repository.findAll()
                    }
                } catch (error) {
                    return response.status(500).json(error)
                }
                return response.render('table', { title: 'Table Panel', table, entities })
            },
        )

        this.router.get('/tables/delete', async (request: Request, response: Response) => {
            const em = this.orm.forkEm()
            const { table } = request.query as { table: string }
            let entities: any[]
            try {
                if (table.includes('_')) {
                    // just working for user_footprints table right now
                    const { entity } = request.query as { entity: string }
                    const parsedEntity = JSON.parse(entity) as { user_id: string, footprint_id: string }
                    await em.execute(`
                        DELETE FROM ${table}
                        WHERE user_id = ${parsedEntity.user_id}
                        AND footprint_id = ${parsedEntity.footprint_id}
                    `)
                    entities = await em.execute(`SELECT * FROM ${table}`)
                } else {
                    const { id } = request.query as { id: string }
                    const repository = em.getRepository(table)
                    const repositoryItem = await repository.findOne(id)
                    if (repositoryItem) {
                        await repository.removeAndFlush(repositoryItem)
                        if (table === 'User') {
                            const { uid } = repositoryItem as { uid: string }
                            const bucket = getStorage().bucket()
                            await Promise.all([
                                bucket.deleteFiles({ prefix: `audios/${uid}/` }),
                                bucket.deleteFiles({ prefix: `images/${uid}/` }),
                            ])
                            await getAuth().deleteUser(uid)
                        }
                    }
                    entities = await repository.findAll()
                }
                return response.render('table', { title: 'Table Panel', table, entities })
            } catch (error) {
                return response.status(500).json(error)
            }
        })

        return this.router
    }
}
