import { Migration } from '@mikro-orm/migrations'

export class Migration20221109091811 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "friendship" drop constraint if exists "friendship_status_check";')

        this.addSql('alter table "user" alter column "friends_code" type varchar(255) using ("friends_code"::varchar(255));')
        this.addSql('alter table "user" alter column "friends_code" drop not null;')
        this.addSql('create index "user_friends_code_index" on "user" ("friends_code");')

        this.addSql('alter table "friendship" alter column "status" type text using ("status"::text);')
        this.addSql('alter table "friendship" add constraint "friendship_status_check" check ("status" in (\'invited\', \'accepted\'));')
    }

    async down(): Promise<void> {
        this.addSql('alter table "friendship" drop constraint if exists "friendship_status_check";')

        this.addSql('alter table "user" alter column "friends_code" type varchar(255) using ("friends_code"::varchar(255));')
        this.addSql('alter table "user" alter column "friends_code" set not null;')
        this.addSql('drop index "user_friends_code_index";')

        this.addSql('alter table "friendship" alter column "status" type smallint using ("status"::smallint);')
    }
}
