import { Migration } from '@mikro-orm/migrations'

export class Migration20221206133757 extends Migration {
    async up(): Promise<void> {
        this.addSql('create table "user_footprints" ("user_id" int not null, "footprint_id" int not null, constraint "user_footprints_pkey" primary key ("user_id", "footprint_id"));')

        this.addSql('alter table "user_footprints" add constraint "user_footprints_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;')
        this.addSql('alter table "user_footprints" add constraint "user_footprints_footprint_id_foreign" foreign key ("footprint_id") references "footprint" ("id") on update cascade on delete cascade;')
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "user_footprints" cascade;')
    }
}
