import { Migration } from '@mikro-orm/migrations'

export class Migration20220928132419 extends Migration {
    async up(): Promise<void> {
        this.addSql('create table "footprint" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" varchar(255) not null, "description" varchar(255) null, "user_id" int not null, "latitude" int not null, "longitude" int not null, "view_count" int not null, "reactions_count" int not null, "image_url" varchar(255) null, "audio_url" varchar(255) null);')

        this.addSql('alter table "footprint" add constraint "footprint_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;')

        this.addSql('alter table "user" add column "created_at" timestamptz(0) not null, add column "updated_at" timestamptz(0) not null, add column "first_name" varchar(255) null, add column "last_name" varchar(255) null, add column "user_name" varchar(255) null, add column "email_verified" boolean not null, add column "birthday" timestamptz(0) null, add column "terms_accepted" boolean not null, add column "account_activated" boolean not null, add column "homeland" varchar(255) null, add column "image_url" varchar(255) null;')
        this.addSql('alter table "user" rename column "name" to "email";')
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "footprint" cascade;')

        this.addSql('alter table "user" drop column "created_at";')
        this.addSql('alter table "user" drop column "updated_at";')
        this.addSql('alter table "user" drop column "first_name";')
        this.addSql('alter table "user" drop column "last_name";')
        this.addSql('alter table "user" drop column "user_name";')
        this.addSql('alter table "user" drop column "email_verified";')
        this.addSql('alter table "user" drop column "birthday";')
        this.addSql('alter table "user" drop column "terms_accepted";')
        this.addSql('alter table "user" drop column "account_activated";')
        this.addSql('alter table "user" drop column "homeland";')
        this.addSql('alter table "user" drop column "image_url";')
        this.addSql('alter table "user" rename column "email" to "name";')
    }
}
