import { Router } from 'express'
import { RouterInterface } from './routerInterface.js'
import { ORM } from '../orm.js'
import { FootprintService } from '../services/footprintService.js'
import { UserService } from '../services/userService.js'
import { DeletionService } from '../services/deletionService.js'
import { UserRepositoryInterface } from '../repositories/user/userRepositoryInterface.js'
import { UserPostgresRepository } from '../repositories/user/userPostgresRepository.js'
import { FriendshipRepositoryInterface } from '../repositories/friendship/friendshipRepositoryInterface.js'
import { FriendshipPostgresRepository } from '../repositories/friendship/friendshipPostgresRepository.js'
import { FootprintRepositoryInterface } from '../repositories/footprint/footprintRepositoryInterface.js'
import { FootprintPostgresRepository } from '../repositories/footprint/footprintPostgresRepository.js'
import { FootprintController } from '../controller/footprintController.js'
import { UserController } from '../controller/userController.js'

export class SchnitzeljagdRouter implements RouterInterface {
    readonly router: Router

    private readonly userController: UserController

    private readonly footprintService: FootprintService

    private readonly footprintController: FootprintController

    constructor(
        router: Router,
        orm: ORM,
        footprintService: FootprintService = new FootprintService(),
        userService: UserService = new UserService(),
        deletionService: DeletionService = new DeletionService(),
        userRepository: UserRepositoryInterface = new UserPostgresRepository(userService, deletionService, orm),
        userController: UserController = new UserController(userRepository),
        friendshipRepository: FriendshipRepositoryInterface = new FriendshipPostgresRepository(userRepository, orm),
        footprintRepository: FootprintRepositoryInterface = new FootprintPostgresRepository(
            footprintService,
            deletionService,
            userRepository,
            friendshipRepository,
            orm,
        ),
        footprintController: FootprintController = new FootprintController(footprintRepository),
    ) {
        this.router = router
        this.userController = userController
        this.footprintService = footprintService
        this.footprintController = footprintController
    }

    generateRoute = () => {
        this.router.get('/', async (request, response) => {
            const { fc } = request.query
            if (!fc) {
                return response.status(400).send('No fc provided')
            }
            /* eslint-disable max-len */
            const footprintsOfSchnitzelJagdUser = await this.footprintController.getFootprintsOfSpecificUser({ fc: '00001' }, response)
            const userToCheck = await this.userController.getUserByFriendsCode({ fc: fc.toString().toUpperCase() } as any, response)
            /* eslint-enable max-len */
            if (!userToCheck) {
                return response.status(404).send('User not found')
            }
            return userToCheck
        })
    }

    createAndReturnRoutes = () => {
        this.generateRoute()
        return this.router
    }
}
