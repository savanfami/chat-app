import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const redisUrl = configService.get<string>('REDIS_URL');
    const client = createClient({ url: redisUrl });

    client.on('error', (err) => {
      console.error(' Redis client error:', err);
    });

    await client.connect();
    console.log('Redis client connected');
    return client;
  },
};
