import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Book {
    @PrimaryKey()
    public id!: number

    @Property()
    public name: string

    constructor(name: string) {
        this.name = name
    }
}
