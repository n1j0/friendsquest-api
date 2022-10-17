import { Migration } from '@mikro-orm/migrations'

export class Migration20220930174513 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "user" add column "uid" varchar(255) not null;')
        this.addSql('alter table "user" add constraint "user_uid_unique" unique ("uid");')
    }

    async down(): Promise<void> {
        this.addSql('alter table "user" drop constraint "user_uid_unique";')
        this.addSql('alter table "user" drop column "uid";')
    }
}
