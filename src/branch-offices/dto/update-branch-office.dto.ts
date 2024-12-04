import { PartialType } from '@nestjs/mapped-types';
import { CreateBranchOfficeDto } from './create-branch-office.dto';

export class UpdateBranchOfficeDto extends PartialType(CreateBranchOfficeDto) {}
