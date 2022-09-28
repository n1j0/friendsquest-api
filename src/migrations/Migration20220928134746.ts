import { Migration } from '@mikro-orm/migrations'

export class Migration20220928134746 extends Migration {
    async up(): Promise<void> {
        this.addSql('alter table "user" rename column "user_name" to "username";')
    }

    async down(): Promise<void> {
        this.addSql('alter table "user" rename column "username" to "user_name";')
    }
}
