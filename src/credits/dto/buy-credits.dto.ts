import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class BuyCreditsDto {
  @ApiProperty({ example: '10', description: 'ID do pacote: 10, 50 ou 100' })
  @IsString({ message: 'ID do pacote deve ser um texto' })
  @IsNotEmpty({ message: 'ID do pacote é obrigatório' })
  @IsIn(['10', '50', '100'], { message: 'Pacote inválido. Use 10, 50 ou 100' })
  packageId: string;
}
