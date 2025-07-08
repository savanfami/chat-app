import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GroupModule } from './group/group.module';
import { ChatModule } from './chat/chat.module';
import { GlobalModule } from './common/global.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),    

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }), 
  
    AuthModule,
    GroupModule,
    ChatModule,
    GlobalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
