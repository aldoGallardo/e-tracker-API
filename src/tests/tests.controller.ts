import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TestsService } from './tests.service';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post('generate-daily-activities')
  async generateDailyActivities(
    @Query('userId') userId: string,
    @Query('date') date: string,
  ) {
    const parsedDate = new Date(date);
    const result =
      await this.testsService.generateDailyActivitiesAndAssignments(
        userId,
        parsedDate,
      );
    return result;
  }

  @Post('generate-multiple-users-activities')
  async generateMultipleUsersActivities() {
    const startDate = new Date('2024-10-20');
    const endDate = new Date('2024-10-31');

    return await this.testsService.generateActivitiesForMultipleUsers(
      startDate,
      endDate,
    );
  }
}
