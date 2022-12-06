import { PrimaryKey, Property, types } from '@mikro-orm/core'

export abstract class BaseEntity {
    @PrimaryKey()
    public id!: number

    @Property({ type: types.datetime })
    public createdAt = new Date()

    @Property({ type: types.datetime, onUpdate: () => new Date() })
    public updatedAt = new Date()
}
