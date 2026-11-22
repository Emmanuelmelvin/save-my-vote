import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1795364809485 implements MigrationInterface {
  name = 'InitialSchema1795364809485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "email" character varying(255) NOT NULL,
                "fullName" character varying(255) NOT NULL,
                "passwordHash" character varying(255),
                "googleId" character varying(255),
                "isVerified" boolean NOT NULL DEFAULT false,
                "verificationEmailSentAt" TIMESTAMP WITH TIME ZONE,
                "passwordChangedAt" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_users_email" ON "users" ("email")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_users_google_id" ON "users" ("googleId")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."election_status" AS ENUM('draft', 'launched')
        `);
    await queryRunner.query(`
            CREATE TABLE "elections" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "ownerId" uuid NOT NULL,
                "title" character varying(200) NOT NULL,
                "description" text NOT NULL DEFAULT '',
                "startAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "endAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "status" "public"."election_status" NOT NULL DEFAULT 'draft',
                "launchedAt" TIMESTAMP WITH TIME ZONE,
                "logoUrl" text,
                "primaryColor" character varying(7) NOT NULL DEFAULT '#1050ff',
                "heroImageUrl" text,
                CONSTRAINT "PK_21abca6e4191b830d1eb8379cf0" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_elections_status_start" ON "elections" ("status", "startAt")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_elections_owner_created" ON "elections" ("ownerId", "createdAt")
        `);
    await queryRunner.query(`
            CREATE TABLE "positions" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "electionId" uuid NOT NULL,
                "title" character varying(150) NOT NULL,
                "sortOrder" integer NOT NULL DEFAULT '0',
                CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_positions_election_order" ON "positions" ("electionId", "sortOrder")
        `);
    await queryRunner.query(`
            CREATE TABLE "candidates" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "electionId" uuid NOT NULL,
                "positionId" uuid NOT NULL,
                "name" character varying(150) NOT NULL,
                "description" text,
                "photoUrl" text,
                "sortOrder" integer NOT NULL DEFAULT '0',
                CONSTRAINT "PK_140681296bf033ab1eb95288abb" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_candidates_election" ON "candidates" ("electionId")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_candidates_position_order" ON "candidates" ("positionId", "sortOrder")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."email_template_type" AS ENUM('invitation', 'reminder', 'confirmation')
        `);
    await queryRunner.query(`
            CREATE TABLE "email_templates" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "electionId" uuid NOT NULL,
                "type" "public"."email_template_type" NOT NULL,
                "fromName" character varying(100) NOT NULL,
                "subject" character varying(200) NOT NULL,
                "body" text NOT NULL,
                CONSTRAINT "UQ_email_templates_election_type" UNIQUE ("electionId", "type"),
                CONSTRAINT "PK_06c564c515d8cdb40b6f3bfbbb4" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "voters" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "electionId" uuid NOT NULL,
                "email" character varying(255) NOT NULL,
                "fullName" character varying(255),
                "otpHash" character varying(64),
                "otpIssuedAt" TIMESTAMP WITH TIME ZONE,
                "failedOtpAttempts" integer NOT NULL DEFAULT '0',
                "invitationSentAt" TIMESTAMP WITH TIME ZONE,
                "invitationFailures" integer NOT NULL DEFAULT '0',
                "hasVoted" boolean NOT NULL DEFAULT false,
                "votedAt" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_voters_election_email" UNIQUE ("electionId", "email"),
                CONSTRAINT "PK_a58842a42a7c48bc3efebb0a305" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_voters_election_invitation" ON "voters" ("electionId", "invitationSentAt")
        `);
    await queryRunner.query(`
            CREATE TABLE "votes" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "electionId" uuid NOT NULL,
                "positionId" uuid NOT NULL,
                "candidateId" uuid NOT NULL,
                CONSTRAINT "PK_f3d9fd4a0af865152c3f59db8ff" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_votes_election_candidate" ON "votes" ("electionId", "candidateId")
        `);
    await queryRunner.query(`
            ALTER TABLE "elections"
            ADD CONSTRAINT "FK_1eb8757c9199c75a426bd6e6b6f" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "positions"
            ADD CONSTRAINT "FK_334ac6c9dbba3ee0efd8a5e3137" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "candidates"
            ADD CONSTRAINT "FK_a5c9743cdb2b629ccc67fb860f1" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "candidates"
            ADD CONSTRAINT "FK_43a4c8efc690d663b5ad815d8cf" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "email_templates"
            ADD CONSTRAINT "FK_19f1d1c8c9ae7cf45cb19d6fdc4" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "voters"
            ADD CONSTRAINT "FK_8b47dc3d0ec21aa9070491adc75" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "votes"
            ADD CONSTRAINT "FK_d14fb685d5eb890c5ee1aae1118" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "votes"
            ADD CONSTRAINT "FK_557eb5f5a69d6776c85a46357a4" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "votes"
            ADD CONSTRAINT "FK_298bec07d3e3d5b91c79ff3e0fd" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "votes" DROP CONSTRAINT "FK_298bec07d3e3d5b91c79ff3e0fd"
        `);
    await queryRunner.query(`
            ALTER TABLE "votes" DROP CONSTRAINT "FK_557eb5f5a69d6776c85a46357a4"
        `);
    await queryRunner.query(`
            ALTER TABLE "votes" DROP CONSTRAINT "FK_d14fb685d5eb890c5ee1aae1118"
        `);
    await queryRunner.query(`
            ALTER TABLE "voters" DROP CONSTRAINT "FK_8b47dc3d0ec21aa9070491adc75"
        `);
    await queryRunner.query(`
            ALTER TABLE "email_templates" DROP CONSTRAINT "FK_19f1d1c8c9ae7cf45cb19d6fdc4"
        `);
    await queryRunner.query(`
            ALTER TABLE "candidates" DROP CONSTRAINT "FK_43a4c8efc690d663b5ad815d8cf"
        `);
    await queryRunner.query(`
            ALTER TABLE "candidates" DROP CONSTRAINT "FK_a5c9743cdb2b629ccc67fb860f1"
        `);
    await queryRunner.query(`
            ALTER TABLE "positions" DROP CONSTRAINT "FK_334ac6c9dbba3ee0efd8a5e3137"
        `);
    await queryRunner.query(`
            ALTER TABLE "elections" DROP CONSTRAINT "FK_1eb8757c9199c75a426bd6e6b6f"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_votes_election_candidate"
        `);
    await queryRunner.query(`
            DROP TABLE "votes"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_voters_election_invitation"
        `);
    await queryRunner.query(`
            DROP TABLE "voters"
        `);
    await queryRunner.query(`
            DROP TABLE "email_templates"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."email_template_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_candidates_position_order"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_candidates_election"
        `);
    await queryRunner.query(`
            DROP TABLE "candidates"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_positions_election_order"
        `);
    await queryRunner.query(`
            DROP TABLE "positions"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_elections_owner_created"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_elections_status_start"
        `);
    await queryRunner.query(`
            DROP TABLE "elections"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."election_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_users_google_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."UQ_users_email"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
  }
}
