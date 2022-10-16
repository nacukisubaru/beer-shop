import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskManagerService } from './tasks-manager.service';


@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [TaskManagerService],
  exports: [TaskManagerService]
})

export class TaskManagerModule {}
