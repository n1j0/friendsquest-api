import { Migration } from '@mikro-orm/migrations'

export class Migration20221108081629 extends Migration {
    async up(): Promise<void> {
        this.addSql('create table "friendship" ("id" serial primary key, "created_at" varchar(255) not null, "updated_at" varchar(255) not null, "invitor_id" int not null, "invitee_id" int not null, "status" smallint null);')

        this.addSql('alter table "friendship" add constraint "friendship_invitor_id_foreign" foreign key ("invitor_id") references "user" ("id") on update cascade;')
        this.addSql('alter table "friendship" add constraint "friendship_invitee_id_foreign" foreign key ("invitee_id") references "user" ("id") on update cascade;')
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "friendship" cascade;')
    }
}
