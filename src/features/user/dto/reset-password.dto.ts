import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'newPasswordsMatch', async: false })
class NewPasswordsMatchConstraint implements ValidatorConstraintInterface {
  validate(confirmNewPassword: string, args: ValidationArguments): boolean {
    const object = args.object as ResetPasswordDto;
    return confirmNewPassword === object.newPassword;
  }

  defaultMessage(): string {
    return 'Passwords do not match';
  }
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Reset token is required' })
  @IsString()
  token: string;

  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(64, { message: 'Password must be at most 64 characters' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  @Matches(/[@$!%*?&#^()_\-+=]/, { message: 'Password must contain at least one special character' })
  newPassword: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  @Validate(NewPasswordsMatchConstraint)
  confirmNewPassword: string;
}
