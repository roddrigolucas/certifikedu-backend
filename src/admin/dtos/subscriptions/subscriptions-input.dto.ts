import { IsNumber, IsOptional, IsString } from "class-validator";


export class ListUsersSubscriptionsAdminDto {
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
