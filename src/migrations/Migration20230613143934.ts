import { Migration } from '@mikro-orm/migrations'

export class Migration20230613143934 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "user" add column "msg_token" varchar(255) null;')
    }

    async down(): Promise<void> {
        this.addSql('alter table "user" drop column "msg_token";')
    }
}
