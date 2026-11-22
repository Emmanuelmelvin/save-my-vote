import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationToUsers1795367015716 implements MigrationInterface {
  name = 'AddOrganizationToUsers1795367015716';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."organization_type" AS ENUM('institution', 'organisation')
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "organizationType" "public"."organization_type"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "organizationName" character varying(200)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "organizationName"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "organizationType"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."organization_type"
        `);
  }
}
