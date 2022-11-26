import mikroOrmConfig from '../../src/config/mikro-orm.config'

// @see <rootDir>/jest.setup.ts

describe('MikroORM config', () => {
    it('sets the correct entity ts path', () => {
        expect(mikroOrmConfig.entitiesTs).toHaveLength(1)
        expect(mikroOrmConfig.entitiesTs![0]).toBe('./src/entities')
    })

    it('sets the correct entity js path', () => {
        expect(mikroOrmConfig.entities).toHaveLength(1)
        expect(mikroOrmConfig.entities![0]).toBe('./.out/src/entities')
    })

    it('sets the correct migration information', () => {
        const migrations = {
            path: './.out/src/migrations',
            pathTs: './src/migrations',
            tableName: 'migrations',
            transactional: true,
        }
        expect(mikroOrmConfig.migrations).toStrictEqual(migrations)
    })

    it('sets the correct seeder information', () => {
        const seeder = {
            path: './.out/src/seeders',
            pathTs: './src/seeders',
            defaultSeeder: 'DatabaseSeeder',
            glob: '!(*.d).{js,ts}',
            emit: 'ts',
            fileName: expect.any(Function),
        }
        expect(mikroOrmConfig.seeder).toStrictEqual(seeder)
        // @ts-ignore
        expect(mikroOrmConfig.seeder.fileName('test')).toBe('test')
    })

    it('sets postgresql as the database type', () => {
        expect(mikroOrmConfig.type).toBe('postgresql')
    })

    it('sets correct database connection information', () => {
        expect(mikroOrmConfig.user).toBe('user')
        expect(mikroOrmConfig.password).toBe('password')
        expect(mikroOrmConfig.dbName).toBe('dbName')
        expect(mikroOrmConfig.host).toBe('111.222.111')
        expect(mikroOrmConfig.port).toBe(1234)
    })
})
