import { NestFactory } from "@nestjs/core";
import { RedisIoAdapter } from "./redis/redis.adapter";
import { AppModule } from "./app.module";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
 
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  console.log(`server running on port http://localhost:${process.env.PORT}`);
  app.useWebSocketAdapter(redisIoAdapter);
  await app.listen(process.env.PORT ?? 3001);  
}

bootstrap();