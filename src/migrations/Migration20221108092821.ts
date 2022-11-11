import { Migration } from '@mikro-orm/migrations'

export class Migration20221108092821 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "user" add column "friends_code" varchar(255) not null;')
        this.addSql('alter table "user" add constraint "user_friends_code_unique" unique ("friends_code");')
    }

    async down(): Promise<void> {
        this.addSql('alter table "user" drop constraint "user_friends_code_unique";')
        this.addSql('alter table "user" drop column "friends_code";')
    }
}
