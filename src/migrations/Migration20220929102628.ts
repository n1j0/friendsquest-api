import { Migration } from '@mikro-orm/migrations'

export class Migration20220929102628 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "footprint" alter column "image_url" type varchar(255) using ("image_url"::varchar(255));')
        this.addSql('alter table "footprint" alter column "image_url" set not null;')
    }

    async down(): Promise<void> {
        this.addSql('alter table "footprint" alter column "image_url" type varchar(255) using ("image_url"::varchar(255));')
        this.addSql('alter table "footprint" alter column "image_url" drop not null;')
    }
}
