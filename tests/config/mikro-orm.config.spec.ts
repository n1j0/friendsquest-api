import mikroOrmConfig from '../../src/config/mikro-orm.config'

describe('MikroORM config', () => {
    it('sets the correct entity ts path', () => {
        expect(mikroOrmConfig.entitiesTs).toHaveLength(1)
        expect(mikroOrmConfig.entitiesTs![0]).toBe('./src/entities')
    })

    it('sets the correct entity js path', () => {
        expect(mikroOrmConfig.entities).toHaveLength(1)
        expect(mikroOrmConfig.entities![0]).toBe('./.out/entities')
    })

    it('sets the correct migration information', () => {
        const migrations = {
            path: './.out/migrations',
            pathTs: './src/migrations',
            tableName: 'migrations',
            transactional: true,
        }
        expect(mikroOrmConfig.migrations).toStrictEqual(migrations)
    })

    it('sets the correct seeder information', () => {
        const seeder = {
            path: './.out/seeders',
            pathTs: './src/seeders',
            defaultSeeder: 'DatabaseSeeder',
            glob: '!(*.d).{js,ts}',
            emit: 'ts',
            fileName: expect.any(Function),
        }
        expect(mikroOrmConfig.seeder).toStrictEqual(seeder)
    })

    it('sets postgresql as the database type', () => {
        expect(mikroOrmConfig.type).toBe('postgresql')
    })
})
