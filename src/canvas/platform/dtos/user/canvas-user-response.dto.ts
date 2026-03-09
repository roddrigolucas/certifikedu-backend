import { Type } from "class-transformer";
import { IsNumber, IsString, ValidateNested } from "class-validator";
import { ResponseCanvasPlatformTemplatesInfoDto } from "../templates/canvas-templates-response.dto";

export class ResponseCanvasPlatformUserInfoDto {
  @IsString()
  courseName: string;

  @IsNumber()
  totalStudents: number;

  @IsNumber()
  verifiedStudents: number;

  @IsNumber()
  rawStudents: number;

  @IsNumber()
  numberOfEmmitedCertificates: number;

  @ValidateNested({ each: true })
  @Type(() => ResponseCanvasPlatformTemplatesInfoDto)
  createdCertificates: Array<ResponseCanvasPlatformTemplatesInfoDto>;
}
