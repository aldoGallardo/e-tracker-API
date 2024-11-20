import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Clase auxiliar para definir cada objeto en el array evidence
class EvidenceItemDto {
  @IsString()
  @IsNotEmpty()
  evidence: string; // Nombre o tipo de la evidencia

  @IsString()
  @IsNotEmpty()
  url: string; // URL de la evidencia
}

// DTO principal que incluye el campo evidence como un array de EvidenceItemDto
export class CompleteActivityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceItemDto)
  evidence: EvidenceItemDto[]; // Array de evidencias
}
