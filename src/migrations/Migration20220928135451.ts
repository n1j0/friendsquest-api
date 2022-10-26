import { Migration } from '@mikro-orm/migrations'

export class Migration20220928135451 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "user" alter column "created_at" type varchar(255) using ("created_at"::varchar(255));')
        this.addSql('alter table "user" alter column "updated_at" type varchar(255) using ("updated_at"::varchar(255));')

        this.addSql('alter table "footprint" alter column "created_at" type varchar(255) using ("created_at"::varchar(255));')
        this.addSql('alter table "footprint" alter column "updated_at" type varchar(255) using ("updated_at"::varchar(255));')
    }

    async down(): Promise<void> {
        this.addSql('alter table "user" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));')
        this.addSql('alter table "user" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));')

        this.addSql('alter table "footprint" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));')
        this.addSql('alter table "footprint" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));')
    }
}
