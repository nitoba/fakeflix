import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1724016267408 implements MigrationInterface {
  name = 'Migration1724016267408'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "thumbnails" ("id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "url" character varying NOT NULL, CONSTRAINT "PK_306432757731ef0ffcee65c995c" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "tv_shows" ("id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "content_id" uuid, "thumbnail_id" uuid, CONSTRAINT "REL_a29fa27bded9c7a8834da7723b" UNIQUE ("content_id"), CONSTRAINT "REL_853203dbddf4a93b92132f27b3" UNIQUE ("thumbnail_id"), CONSTRAINT "PK_73f43819bb5017c6d38883c53bc" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "episodes" ("id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "description" character varying NOT NULL, "season" integer NOT NULL, "number" integer NOT NULL, "tv_show_id" uuid, "thumbnail_id" uuid, CONSTRAINT "REL_a39393466321f742107321a906" UNIQUE ("thumbnail_id"), CONSTRAINT "PK_6a003fda8b0473fffc39cb831c7" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "videos" ("id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "url" character varying NOT NULL, "sizeInKb" integer NOT NULL, "duration" integer NOT NULL, "movie_id" uuid, "episode_id" uuid, CONSTRAINT "REL_a872cc7686d3b7d74f52f1d249" UNIQUE ("movie_id"), CONSTRAINT "REL_16fb4816caaa65fdc858b0cad2" UNIQUE ("episode_id"), CONSTRAINT "PK_e4c86c0cf95aff16e9fb8220f6b" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "movies" ("id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "content_id" uuid, "thumbnail_id" uuid, CONSTRAINT "REL_ed776942f1b513afc9c4289e67" UNIQUE ("content_id"), CONSTRAINT "REL_17b51391172522389cb79a0164" UNIQUE ("thumbnail_id"), CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."contents_type_enum" AS ENUM('MOVIE', 'TV_SHOW')`,
    )
    await queryRunner.query(
      `CREATE TABLE "contents" ("id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "type" "public"."contents_type_enum" NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_b7c504072e537532d7080c54fac" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "tv_shows" ADD CONSTRAINT "FK_a29fa27bded9c7a8834da7723b4" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "tv_shows" ADD CONSTRAINT "FK_853203dbddf4a93b92132f27b3b" FOREIGN KEY ("thumbnail_id") REFERENCES "thumbnails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "episodes" ADD CONSTRAINT "FK_45b3776fb784474e663413bd21c" FOREIGN KEY ("tv_show_id") REFERENCES "tv_shows"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "episodes" ADD CONSTRAINT "FK_a39393466321f742107321a9061" FOREIGN KEY ("thumbnail_id") REFERENCES "thumbnails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "videos" ADD CONSTRAINT "FK_a872cc7686d3b7d74f52f1d249d" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "videos" ADD CONSTRAINT "FK_16fb4816caaa65fdc858b0cad29" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "movies" ADD CONSTRAINT "FK_ed776942f1b513afc9c4289e672" FOREIGN KEY ("content_id") REFERENCES "contents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "movies" ADD CONSTRAINT "FK_17b51391172522389cb79a01649" FOREIGN KEY ("thumbnail_id") REFERENCES "thumbnails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movies" DROP CONSTRAINT "FK_17b51391172522389cb79a01649"`,
    )
    await queryRunner.query(
      `ALTER TABLE "movies" DROP CONSTRAINT "FK_ed776942f1b513afc9c4289e672"`,
    )
    await queryRunner.query(
      `ALTER TABLE "videos" DROP CONSTRAINT "FK_16fb4816caaa65fdc858b0cad29"`,
    )
    await queryRunner.query(
      `ALTER TABLE "videos" DROP CONSTRAINT "FK_a872cc7686d3b7d74f52f1d249d"`,
    )
    await queryRunner.query(
      `ALTER TABLE "episodes" DROP CONSTRAINT "FK_a39393466321f742107321a9061"`,
    )
    await queryRunner.query(
      `ALTER TABLE "episodes" DROP CONSTRAINT "FK_45b3776fb784474e663413bd21c"`,
    )
    await queryRunner.query(
      `ALTER TABLE "tv_shows" DROP CONSTRAINT "FK_853203dbddf4a93b92132f27b3b"`,
    )
    await queryRunner.query(
      `ALTER TABLE "tv_shows" DROP CONSTRAINT "FK_a29fa27bded9c7a8834da7723b4"`,
    )
    await queryRunner.query(`DROP TABLE "contents"`)
    await queryRunner.query(`DROP TYPE "public"."contents_type_enum"`)
    await queryRunner.query(`DROP TABLE "movies"`)
    await queryRunner.query(`DROP TABLE "videos"`)
    await queryRunner.query(`DROP TABLE "episodes"`)
    await queryRunner.query(`DROP TABLE "tv_shows"`)
    await queryRunner.query(`DROP TABLE "thumbnails"`)
  }
}
