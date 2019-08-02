import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { CommonModule } from '../common';

@Module({
  imports: [CommonModule],
  controllers: [ProjectController],
})
export class ProjectModule {}
