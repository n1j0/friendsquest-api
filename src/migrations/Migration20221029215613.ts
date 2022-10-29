import { Migration } from '@mikro-orm/migrations'

export class Migration20221029215613 extends Migration {
    async up(): Promise<void> {
        this.addSql('create table "user" ("id" serial primary key, "created_at" varchar(255) not null, "updated_at" varchar(255) not null, "username" varchar(255) not null, "email" varchar(255) not null, "uid" varchar(255) not null, "image_url" varchar(255) null);')
        this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");')
        this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");')
        this.addSql('alter table "user" add constraint "user_uid_unique" unique ("uid");')

        this.addSql('create table "footprint" ("id" serial primary key, "created_at" varchar(255) not null, "updated_at" varchar(255) not null, "title" varchar(255) not null, "description" varchar(255) null, "created_by_id" int not null, "latitude" double precision not null, "longitude" double precision not null, "view_count" int not null, "image_url" varchar(255) not null, "audio_url" varchar(255) not null);')

        this.addSql('create table "footprint_reaction" ("id" serial primary key, "created_at" varchar(255) not null, "updated_at" varchar(255) not null, "created_by_id" int not null, "message" varchar(255) not null, "footprint_id" int not null);')

        this.addSql('alter table "footprint" add constraint "footprint_created_by_id_foreign" foreign key ("created_by_id") references "user" ("id") on update cascade;')

        this.addSql('alter table "footprint_reaction" add constraint "footprint_reaction_created_by_id_foreign" foreign key ("created_by_id") references "user" ("id") on update cascade;')
        this.addSql('alter table "footprint_reaction" add constraint "footprint_reaction_footprint_id_foreign" foreign key ("footprint_id") references "footprint" ("id") on update cascade;')
    }

    async down(): Promise<void> {
        this.addSql('alter table "footprint" drop constraint "footprint_created_by_id_foreign";')

        this.addSql('alter table "footprint_reaction" drop constraint "footprint_reaction_created_by_id_foreign";')

        this.addSql('alter table "footprint_reaction" drop constraint "footprint_reaction_footprint_id_foreign";')

        this.addSql('drop table if exists "user" cascade;')

        this.addSql('drop table if exists "footprint" cascade;')

        this.addSql('drop table if exists "footprint_reaction" cascade;')
    }
}
