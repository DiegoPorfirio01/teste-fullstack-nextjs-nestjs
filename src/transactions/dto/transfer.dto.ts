import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class TransferDto {
  @ApiProperty({ example: 'receiver@example.com' })
  @IsEmail({}, { message: 'E-mail do destinatário inválido' })
  @IsNotEmpty({ message: 'E-mail do destinatário é obrigatório' })
  receiverEmail: string;

  @ApiProperty({ example: 50 })
  @IsNumber({}, { message: 'Valor deve ser um número' })
  @IsPositive({ message: 'Valor deve ser positivo' })
  amount: number;
}
