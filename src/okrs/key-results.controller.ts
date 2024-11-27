import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { KeyResultsService } from './key-results.service';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@ApiTags('Key Results')
@Controller('key-results')
export class KeyResultsController {
  constructor(private readonly keyResultService: KeyResultsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Key Result' })
  @ApiResponse({ status: 201, description: 'Key Result created successfully.' })
  async createKeyResult(@Body() createKeyResultDto: CreateKeyResultDto) {
    return this.keyResultService.createKeyResult(createKeyResultDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Key Results' })
  @ApiResponse({ status: 200, description: 'Returns a list of Key Results.' })
  async getKeyResults() {
    return this.keyResultService.getKeyResults();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific Key Result by ID' })
  @ApiParam({ name: 'id', description: 'Key Result ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the specified Key Result.',
  })
  async getKeyResultById(@Param('id') id: string) {
    return this.keyResultService.getKeyResultById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a specific Key Result by ID' })
  @ApiParam({ name: 'id', description: 'Key Result ID' })
  @ApiResponse({ status: 200, description: 'Key Result updated successfully.' })
  async updateKeyResult(
    @Param('id') id: string,
    @Body() updateKeyResultDto: UpdateKeyResultDto,
  ) {
    return this.keyResultService.updateKeyResult(id, updateKeyResultDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific Key Result by ID' })
  @ApiParam({ name: 'id', description: 'Key Result ID' })
  @ApiResponse({ status: 200, description: 'Key Result deleted successfully.' })
  async removeKeyResult(@Param('id') id: string) {
    return this.keyResultService.removeKeyResult(id);
  }
}
