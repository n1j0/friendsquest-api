import { Migration } from '@mikro-orm/migrations'

export class Migration20221205175122 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "user" add column "points" int not null default 0;')
    }

    async down(): Promise<void> {
        this.addSql('alter table "user" drop column "points";')
    }
}
