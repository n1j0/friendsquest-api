import { PrimaryKey, Property } from '@mikro-orm/core'

export abstract class BaseEntity {
    @PrimaryKey()
    public id!: number

    @Property()
    public createdAt = new Date().toISOString()

    @Property({ onUpdate: () => new Date().toISOString() })
    public updatedAt = new Date().toISOString()
}
