import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString({ message: 'Nome completo deve ser um texto' })
  @IsNotEmpty({ message: 'Nome completo é obrigatório' })
  fullName: string;
}
