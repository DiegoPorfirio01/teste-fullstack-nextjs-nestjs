import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

const PASSWORD_RULES =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PASSWORD_MESSAGE =
  'Nova senha deve ter 8+ caracteres, incluindo maiúscula, minúscula, número e caractere especial';

export class UpdatePasswordDto {
  @ApiProperty()
  @IsString({ message: 'Senha atual deve ser um texto' })
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  currentPassword: string;

  @ApiProperty({
    description: 'Mín. 8 caracteres: maiúscula, minúscula, número e especial',
  })
  @IsString({ message: 'Nova senha deve ser um texto' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(8, { message: 'Nova senha deve ter no mínimo 8 caracteres' })
  @Matches(PASSWORD_RULES, { message: PASSWORD_MESSAGE })
  newPassword: string;
}
