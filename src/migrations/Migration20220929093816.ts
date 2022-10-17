import { Migration } from '@mikro-orm/migrations'

export class Migration20220929093816 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "footprint" alter column "latitude" type double precision using ("latitude"::double precision);')
        this.addSql('alter table "footprint" alter column "longitude" type double precision using ("longitude"::double precision);')
        this.addSql('alter table "footprint" drop column "reactions_count";')
    }

    async down(): Promise<void> {
        this.addSql('alter table "footprint" add column "reactions_count" int not null;')
        this.addSql('alter table "footprint" alter column "latitude" type int using ("latitude"::int);')
        this.addSql('alter table "footprint" alter column "longitude" type int using ("longitude"::int);')
    }
}
