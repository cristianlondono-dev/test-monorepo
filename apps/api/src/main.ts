import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle("Task Management API")
    .setDescription("CRUD API for users and tasks assigned between them.")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  // Railway's private network (used by apps/web to reach this service) is IPv6-only;
  // binding to "::" listens dual-stack so both the public proxy (IPv4) and
  // private networking (IPv6) can reach it.
  await app.listen(process.env.PORT ?? 4000, "::");
}
bootstrap();
