import { Migration } from '@mikro-orm/migrations'

export class Migration20221024143541 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "user" alter column "username" type varchar(255) using ("username"::varchar(255));')
        this.addSql('alter table "user" alter column "username" set not null;')
        this.addSql('alter table "user" drop column "first_name";')
        this.addSql('alter table "user" drop column "last_name";')
        this.addSql('alter table "user" drop column "email_verified";')
        this.addSql('alter table "user" drop column "birthday";')
        this.addSql('alter table "user" drop column "terms_accepted";')
        this.addSql('alter table "user" drop column "account_activated";')
        this.addSql('alter table "user" drop column "homeland";')
    }

    async down(): Promise<void> {
        this.addSql('alter table "user" add column "first_name" varchar(255) null, add column "last_name" varchar(255) null, add column "email_verified" boolean not null, add column "birthday" timestamptz(0) null, add column "terms_accepted" boolean not null, add column "account_activated" boolean not null, add column "homeland" varchar(255) null;')
        this.addSql('alter table "user" alter column "username" type varchar(255) using ("username"::varchar(255));')
        this.addSql('alter table "user" alter column "username" drop not null;')
    }
}
