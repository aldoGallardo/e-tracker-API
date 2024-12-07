import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { KeyResultsService } from './key-results.service';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { KeyResult } from './key-result.entity';

@Controller('key-results')
export class KeyResultsController {
  constructor(private readonly keyResultsService: KeyResultsService) {}

  @Post()
  createKeyResult(
    @Body() createKeyResultDto: CreateKeyResultDto,
  ): Promise<KeyResult> {
    return this.keyResultsService.createKeyResult(createKeyResultDto);
  }

  @Get()
  getAllKeyResults(): Promise<KeyResult[]> {
    return this.keyResultsService.getAllKeyResults();
  }

  @Get(':id')
  getKeyResultById(@Param('id') id: number): Promise<KeyResult> {
    return this.keyResultsService.getKeyResultById(id);
  }

  @Patch(':id')
  updateKeyResult(
    @Param('id') id: number,
    @Body() updateKeyResultDto: UpdateKeyResultDto,
  ): Promise<KeyResult> {
    return this.keyResultsService.updateKeyResult(id, updateKeyResultDto);
  }

  @Delete(':id')
  deleteKeyResult(@Param('id') id: number): Promise<void> {
    return this.keyResultsService.deleteKeyResult(id);
  }


}
