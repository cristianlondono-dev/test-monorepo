import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersAndTasks1782272109048 implements MigrationInterface {
    name = 'CreateUsersAndTasks1782272109048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM('pending', 'completed')`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "due_date" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'pending', CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'manager', 'member')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "indicative_country" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tasks_assignees" ("tasksId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_e1d09d96a5b9156feaf47932f16" PRIMARY KEY ("tasksId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_895ef195cc24bd7066e6c8af29" ON "tasks_assignees" ("tasksId") `);
        await queryRunner.query(`CREATE INDEX "IDX_38660c4b2ddd233aae634ca2fe" ON "tasks_assignees" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "tasks_assignees" ADD CONSTRAINT "FK_895ef195cc24bd7066e6c8af29b" FOREIGN KEY ("tasksId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tasks_assignees" ADD CONSTRAINT "FK_38660c4b2ddd233aae634ca2fee" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks_assignees" DROP CONSTRAINT "FK_38660c4b2ddd233aae634ca2fee"`);
        await queryRunner.query(`ALTER TABLE "tasks_assignees" DROP CONSTRAINT "FK_895ef195cc24bd7066e6c8af29b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_38660c4b2ddd233aae634ca2fe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_895ef195cc24bd7066e6c8af29"`);
        await queryRunner.query(`DROP TABLE "tasks_assignees"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    }

}
