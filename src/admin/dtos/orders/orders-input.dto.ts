import { IsNumber, IsOptional, IsString } from "class-validator";

export class ListUsersOrdersAdminDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  size?: number;
}
