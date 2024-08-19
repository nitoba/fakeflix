import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1724029356839 implements MigrationInterface {
  name = 'Migration1724029356839'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movies" ADD "external_rating" double precision`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movies" DROP COLUMN "external_rating"`,
    )
  }

  s
}
