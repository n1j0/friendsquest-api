import { PrimaryKey, Property } from '@mikro-orm/core'

export abstract class BaseEntity {
    @PrimaryKey()
    public id!: number

    @Property()
    public createdAt = new Date()

    @Property({ onUpdate: () => new Date() })
    public updatedAt = new Date()
}
