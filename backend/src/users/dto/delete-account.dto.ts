import { IsString, IsOptional, MaxLength } from "class-validator";

export class DeleteAccountDto {
  @IsString()
  @MaxLength(128)
  @IsOptional()
  password?: string;

  @IsString()
  @MaxLength(2048)
  @IsOptional()
  oidcIdToken?: string;
}
