import { Migration } from '@mikro-orm/migrations'

export class Migration20220929114348 extends Migration {
    async up(): Promise<void> {
        this.addSql('create table "footprint_reaction" ("id" serial primary key, "created_at" varchar(255) not null, "updated_at" varchar(255) not null, "created_by_id" int not null, "message" varchar(255) not null, "footprint_id" int not null);')

        this.addSql('alter table "footprint_reaction" add constraint "footprint_reaction_created_by_id_foreign" foreign key ("created_by_id") references "user" ("id") on update cascade;')
        this.addSql('alter table "footprint_reaction" add constraint "footprint_reaction_footprint_id_foreign" foreign key ("footprint_id") references "footprint" ("id") on update cascade;')
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "footprint_reaction" cascade;')
    }
}
