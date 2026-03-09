import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '../../../users/users.service';
import { CanvasGetUser } from '../decorators/get-user-canvas.decorator';
import { ResponseCanvasPlatformStudentsDto } from '../dtos/students/canvas-students-response.dto';
import { CanvasJwtGuard } from '../guards/canvas-jwk.guard';

@ApiTags('Canvas Platform -- Students')
@Controller('canvas-platform')
@UseGuards(CanvasJwtGuard)
export class CanvasStudentsController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/students')
  async getCanvasStudents(@CanvasGetUser('courseId') courseId: string): Promise<ResponseCanvasPlatformStudentsDto> {
    const students = await this.usersService.getAllCoursesStudents([courseId]);
    return {
      students: students.map((student) => {
        return {
          userId: student.id,
          email: student.email,
          isTemp: student.tempCourse === courseId,
          name: student.pessoaFisica.nome,
          document: student.numeroDocumento,
        };
      }),
    };
  }
}
