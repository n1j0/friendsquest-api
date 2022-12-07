import { Migration } from '@mikro-orm/migrations'

export class Migration20221206144430 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "footprint" drop column "view_count";')
    }

    async down(): Promise<void> {
        this.addSql('alter table "footprint" add column "view_count" int4 not null default null;')
    }
}
