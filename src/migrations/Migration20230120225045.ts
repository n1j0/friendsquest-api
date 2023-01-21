import { Migration } from '@mikro-orm/migrations'

export class Migration20230120225045 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "footprint" add column "temperature" int null;')
    }

    async down(): Promise<void> {
        this.addSql('alter table "footprint" drop column "temperature";')
    }
}
