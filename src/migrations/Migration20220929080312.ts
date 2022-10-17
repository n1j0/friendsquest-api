import { Migration } from '@mikro-orm/migrations'

export class Migration20220929080312 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "footprint" drop constraint "footprint_user_id_foreign";')

        this.addSql('alter table "footprint" rename column "user_id" to "created_by_id";')
        this.addSql('alter table "footprint" add constraint "footprint_created_by_id_foreign" foreign key ("created_by_id") references "user" ("id") on update cascade;')
    }

    async down(): Promise<void> {
        this.addSql('alter table "footprint" drop constraint "footprint_created_by_id_foreign";')

        this.addSql('alter table "footprint" rename column "created_by_id" to "user_id";')
        this.addSql('alter table "footprint" add constraint "footprint_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;')
    }
}
