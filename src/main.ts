import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/validation.pipe';
import * as cookieParser from 'cookie-parser';

async function start() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule, {cors: true});
  //app.useGlobalPipes(new ValidationPipe());
  await app.use(cookieParser());
  app.enableCors({
    origin: process.env.ORIGIN_URL,
    credentials: true
  });

  await app.listen(PORT, () => console.log(`Server started on port = ${PORT}`));
  
}
start();
