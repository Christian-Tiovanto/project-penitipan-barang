import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UserSeeder } from './seeder/user.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const seeder = app.get(UserSeeder);
  await seeder.run();

  // const environment = process.env.NODE_ENV || 'DEVELOPMENT';
  // const domainUrl = process.env.DOMAIN_URL || 'http://localhost:5173';

  // let corsOptions = {};

  // if (environment === 'PRODUCTION') {
  //   corsOptions = {
  //     origin: domainUrl, // hanya domain produksi yang diizinkan
  //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //     allowedHeaders: 'Content-Type, Accept, Authorization',
  //     credentials: true, // jika pakai cookie/token
  //   };
  // } else {
  //   corsOptions = {
  //     origin: true, // izinkan semua origin saat development
  //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //     allowedHeaders: 'Content-Type, Accept, Authorization',
  //     credentials: true,
  //   };
  // }

  app.enableCors();
  // app.enableCors({
  //   origin: '*', // Izinkan semua origin
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   allowedHeaders: 'Content-Type, Accept, Authorization',
  //   credentials: true, // Jika menggunakan cookies atau token
  // });

  const config = new DocumentBuilder()
    .setTitle('Endpoint Penitipan Barang')
    .setDescription('List Endpoint Penitipan Barang')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory);
  await app.listen(8000, '0.0.0.0'); // <-- PENTING BANGET!
}
bootstrap();
