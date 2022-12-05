import { Migration } from '@mikro-orm/migrations'

export class Migration20221205174609 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "user" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));')
        this.addSql('alter table "user" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));')

        this.addSql('alter table "friendship" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));')
        this.addSql('alter table "friendship" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));')

        this.addSql('alter table "footprint" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));')
        this.addSql('alter table "footprint" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));')

        this.addSql('alter table "footprint_reaction" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));')
        this.addSql('alter table "footprint_reaction" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));')
    }

    async down(): Promise<void> {
        this.addSql('alter table "footprint" alter column "created_at" type varchar using ("created_at"::varchar);')
        this.addSql('alter table "footprint" alter column "updated_at" type varchar using ("updated_at"::varchar);')

        this.addSql('alter table "footprint_reaction" alter column "created_at" type varchar using ("created_at"::varchar);')
        this.addSql('alter table "footprint_reaction" alter column "updated_at" type varchar using ("updated_at"::varchar);')

        this.addSql('alter table "friendship" alter column "created_at" type varchar using ("created_at"::varchar);')
        this.addSql('alter table "friendship" alter column "updated_at" type varchar using ("updated_at"::varchar);')

        this.addSql('alter table "user" alter column "created_at" type varchar using ("created_at"::varchar);')
        this.addSql('alter table "user" alter column "updated_at" type varchar using ("updated_at"::varchar);')
    }
}
