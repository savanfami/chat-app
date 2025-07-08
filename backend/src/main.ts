import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { RedisIoAdapter } from "./redis/redis.adapter";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
 
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  
  const port = configService.get<number>('PORT') ?? 3001;
  console.log(`server running on port http://localhost:${port}`);
  
  app.useWebSocketAdapter(redisIoAdapter);
  await app.listen(port);  
}

bootstrap();