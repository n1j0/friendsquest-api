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
})
