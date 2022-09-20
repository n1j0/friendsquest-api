import { Migration } from '@mikro-orm/migrations'

export class Migration20220920154704 extends Migration {
    async up(): Promise<void> {
        this.addSql('create table "book" ("id" serial primary key, "name" varchar(255) not null);')
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "book" cascade;')
    }
}
