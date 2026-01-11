import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ResourcesModule } from './modules/resource/resources.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TechnologiesModule } from './modules/technolgoies/technologies.module';
import { TestModule } from './modules/technolgoies copy/test.module';
import { TopicsModule } from './modules/topics/topics.module';
import { ContentModule } from './modules/content/content.module';
import { BlogModule } from './modules/blogs/blog.module';
import { CronExpression, ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ResourcesModule,
    TechnologiesModule,
    TestModule,
    TopicsModule,
    ContentModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
