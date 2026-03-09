import { Controller, Get, Param, Post, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CanvasJwtService } from '../canvas-jwt.service';
import { ResponseCanvasJwtDto } from '../dtos/jwt/canvas-jwt-response.dto';

@ApiTags('Canvas Platform -- JWT')
@Controller('canvas-platform')
export class CanvasJwtController {
  constructor(private readonly canvasJwtService: CanvasJwtService) {}

  @Get('/get-token/:state')
  async getCanvasJwtToken(@Param('state') state: string): Promise<ResponseCanvasJwtDto> {
    return { token: await this.canvasJwtService.createJwtTokenFromState(state) };
  }

  @Post('/refresh-token')
  refreshCanvasJwtToken(@Headers('Authorization') authHeader: string): ResponseCanvasJwtDto {
    const token = authHeader.replace('Bearer ', '');
    return { token: this.canvasJwtService.refreshJwtToken(token) };
  }
}
