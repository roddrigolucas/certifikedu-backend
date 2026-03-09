import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuxService } from '../../aux/aux.service';
import {
  TStudyFieldAllOutput,
  TStudyFieldCreateInput,
  TStudyFieldUpdateInput,
} from '../../studyfields/types/studyfields.types';
import { GetUser } from '../../auth/decorators';
import { StudyFieldsService } from '../../studyfields/studyfields.service';
import {
  AbilitiesToFieldAPIDto,
  ActivityToFieldAPIDto,
  CreateStudyFieldAPIDto,
  EditStudyFieldAPIDto,
  InternshipsToFieldAPIDto,
  SubjectsToFieldAPIDto,
} from '../dtos/studyfields/studyfields-input.dto';
import { ResponseStudyFieldAPIDto } from '../dtos/studyfields/studyfields-response.dto';
import { ApiKeyGuard } from '../guards/api_secret.guard';

@ApiTags('API Study Fields')
@UseGuards(ApiKeyGuard)
@Controller('api/v1')
export class StudyFieldsAPIController {
  constructor(private readonly studyFieldsService: StudyFieldsService, private readonly auxService: AuxService) {}

  @Get('fields')
  async getStudyFields(@GetUser('id') userId: string): Promise<Array<ResponseStudyFieldAPIDto>> {
    const pj = await this.auxService.getPjInfo(userId);

    const studyFields = await this.studyFieldsService.getPjStudyFields(pj.idPJ);

    return studyFields.map((studyField) => this.getStudyFieldResponse(studyField));
  }

  @Get('field/:id')
  async getFieldsById(@GetUser('id') userId: string, @Param('id') fieldId: string): Promise<ResponseStudyFieldAPIDto> {
    const studyField = await this.studyFieldsService.getStudyFieldById(fieldId);

    if (!studyField) {
      throw new NotFoundException('Study Field not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (studyField.userId != pj.idPJ) {
      throw new ForbiddenException('Forbidden Resource');
    }

    return this.getStudyFieldResponse(studyField);
  }

  @Post('fields')
  async createStudyFields(
    @GetUser('id') userId: string,
    @Body() dto: CreateStudyFieldAPIDto,
  ): Promise<ResponseStudyFieldAPIDto> {
    const abilitiesIds = await this.auxService.getValidAbilityIds(dto.abilities);

    if (abilitiesIds.length === 0) {
      throw new BadRequestException('No valid Abilities Ids');
    }

    const pj = await this.auxService.getPjInfo(userId);

    const studyFieldData: TStudyFieldCreateInput = {
      name: dto.name,
      field: dto.field,
      user: { connect: { idPJ: pj.idPJ } },
      abilities: {
        create: abilitiesIds.map((abilityId) => {
          return { abilityId: abilityId };
        }),
      },
    };

    if (dto?.activities?.length > 0) {
      const activitiesIds = await this.auxService.getValidActivityIds(dto.activities);
      studyFieldData.activities.connect = activitiesIds.map((activityId) => {
        return { activityId: activityId };
      });
    }

    if (dto?.internships?.length > 0) {
      const internshipsIds = await this.auxService.getValidInternshipIds(dto.internships);
      studyFieldData.internships.connect = internshipsIds.map((internshipId) => {
        return { internshipId: internshipId };
      });
    }

    if (dto?.subjects?.length > 0) {
      const subjectsIds = await this.auxService.getValidSubjectIds(dto.subjects);
      studyFieldData.subjects.connect = subjectsIds.map((subjectId) => {
        return { subjectId: subjectId };
      });
    }

    const studyField = await this.studyFieldsService.createStudyField(studyFieldData);

    return this.getStudyFieldResponse(studyField);
  }

  @Patch('field/:id')
  async editStudyFields(
    @GetUser('id') userId: string,
    @Param('id') fieldId: string,
    @Body() dto: EditStudyFieldAPIDto,
  ): Promise<ResponseStudyFieldAPIDto> {
    if ((Object(dto).length = 0)) {
      throw new BadRequestException('No fields to Update');
    }

    const studyFieldInfo = await this.studyFieldsService.getStudyFieldById(fieldId);

    if (!studyFieldInfo) {
      throw new NotFoundException('Study Field not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (studyFieldInfo.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this resourse');
    }

    const studyFieldData: TStudyFieldUpdateInput = {
      name: dto?.name ?? studyFieldInfo.name,
      field: dto?.field ?? studyFieldInfo.field,
    };

    const studyField = await this.studyFieldsService.editStudyField(fieldId, studyFieldData);

    return this.getStudyFieldResponse(studyField);
  }

  @Delete('field/:id')
  async deleteStudyFields(@GetUser('id') userId: string, @Param('id') fieldId: string): Promise<{ success: boolean }> {
    const studyFieldInfo = await this.studyFieldsService.getStudyFieldById(fieldId);

    if (!studyFieldInfo) {
      throw new NotFoundException('Study Field not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (studyFieldInfo.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this resourse');
    }

    await this.studyFieldsService.deleteStudyField(fieldId);

    return { success: true };
  }

  @Patch('field/:id/abilities')
  async addAbilitiesToField(
    @GetUser('id') userId: string,
    @Param('id') fieldId: string,
    @Body() dto: AbilitiesToFieldAPIDto,
  ): Promise<ResponseStudyFieldAPIDto> {
    const studyFieldInfo = await this.studyFieldsService.getStudyFieldById(fieldId);

    if (!studyFieldInfo) {
      throw new NotFoundException('Study Field not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (studyFieldInfo.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this resourse');
    }

    const abilities = await this.auxService.getValidAbilityIds(dto.abilities);

    if (abilities.length === 0) {
      throw new BadRequestException('No Valid Abilities to include');
    }

    const studyField = await this.studyFieldsService.addAbilitiesToField(fieldId, abilities);

    return this.getStudyFieldResponse(studyField);
  }

  @Delete('field/:id/abilities/')
  async removeAbilitiesFromField(
    @GetUser('id') userId: string,
    @Param('id') fieldId: string,
    @Body() dto: AbilitiesToFieldAPIDto,
  ): Promise<ResponseStudyFieldAPIDto> {
    const abilities = await this.auxService.getValidAbilityIds(dto.abilities);

    if (abilities.length === 0) {
      throw new BadRequestException('No Valid Abilities to remove');
    }

    const studyFieldInfo = await this.studyFieldsService.getStudyFieldById(fieldId);

    if (!studyFieldInfo) {
      throw new NotFoundException('Study Field not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (studyFieldInfo.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this resourse');
    }

    const studyFieldsAbilities = studyFieldInfo.abilities.map((ability) => ability.abilityId);

    const existingAbilities = this.studyFieldsService.verifyIds(abilities, studyFieldsAbilities);

    if (existingAbilities.length === 0) {
      throw new BadRequestException('No valid ability to remove.');
    }

    const studyField = await this.studyFieldsService.removeAbilitiesFromField(fieldId, abilities);

    return this.getStudyFieldResponse(studyField);
  }

  @Patch('field/:id/activities')
  async addActivitiesToField(
    @GetUser('id') userId: string,
    @Param('id') fieldId: string,
    @Body() dto: ActivityToFieldAPIDto,
  ): Promise<ResponseStudyFieldAPIDto> {
    const activitiesIds = await this.auxService.getValidActivityIds(dto.activities);

    if (activitiesIds.length === 0) {
      throw new BadRequestException('No valid activity to add.');
    }

    const studyFieldInfo = await this.studyFieldsService.getStudyFieldById(fieldId);

    if (!studyFieldInfo) {
      throw new NotFoundException('Resource Not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (studyFieldInfo.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this resource');
    }

    const studyField = await this.studyFieldsService.addActivitiesToField(fieldId, activitiesIds);

    return this.getStudyFieldResponse(studyField);
  }

  @Delete('field/:id/activities/')
  async removeActivitiesFromField(
    @GetUser('id') userId: string,
    @Param('id') fieldId: string,
    @Body() dto: ActivityToFieldAPIDto,
  ): Promise<ResponseStudyFieldAPIDto> {
    const activitiesIds = await this.auxService.getValidActivityIds(dto.activities);

    if (activitiesIds.length === 0) {
      throw new BadRequestException('No valid activity to remove.');
    }

    const studyFieldInfo = await this.studyFieldsService.getStudyFieldById(fieldId);

    if (!studyFieldInfo) {
      throw new NotFoundException('Resource Not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (studyFieldInfo.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this resource');
    }

    const studyFieldsAbilities = studyFieldInfo.activities.map((activity) => activity.activityId);

    const existingAbilities = this.studyFieldsService.verifyIds(activitiesIds, studyFieldsAbilities);

    if (existingAbilities.length === 0) {
      throw new BadRequestException('No valid activity to remove.');
    }

    const studyField = await this.studyFieldsService.removeActivitiesFromField(fieldId, existingAbilities);

    return this.getStudyFieldResponse(studyField);
  }

  @Patch('field/:id/subjects')
  async addSubjectToField(
    @GetUser('id') userId: string,
    @Param('id') fieldId: string,
    @Body() dto: SubjectsToFieldAPIDto,
  ): Promise<ResponseStudyFieldAPIDto> {
    const subjectIds = await this.auxService.getValidSubjectIds(dto.subjects);

    if (subjectIds.length === 0) {
      throw new BadRequestException('No valid subjects to add.');
    }

    const studyFieldInfo = await this.studyFieldsService.getStudyFieldById(fieldId);

    if (!studyFieldInfo) {
      throw new NotFoundException('Resource Not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (studyFieldInfo.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this resource');
    }

    const studyField = await this.studyFieldsService.addSubjectsToField(fieldId, subjectIds);

    return this.getStudyFieldResponse(studyField);
  }

  @Delete('field/:id/subjects')
  async removeSubjectFromField(
    @GetUser('id') userId: string,
    @Param('id') fieldId: string,
    @Body() dto: SubjectsToFieldAPIDto,
  ): Promise<ResponseStudyFieldAPIDto> {
    const subjectsIds = await this.auxService.getValidSubjectIds(dto.subjects);

    if (subjectsIds.length === 0) {
      throw new BadRequestException('No valid subject to remove.');
    }

    const studyFieldInfo = await this.studyFieldsService.getStudyFieldById(fieldId);

    if (!studyFieldInfo) {
      throw new NotFoundException('Resource Not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (studyFieldInfo.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this resource');
    }

    const studyFieldsSubjects = studyFieldInfo.subjects.map((subject) => subject.subjectId);

    const existingSubjects = this.studyFieldsService.verifyIds(subjectsIds, studyFieldsSubjects);

    if (existingSubjects.length === 0) {
      throw new BadRequestException('No valid subject to remove.');
    }

    const studyField = await this.studyFieldsService.removeSubjectsFromField(fieldId, existingSubjects);

    return this.getStudyFieldResponse(studyField);
  }

  @Patch('field/:id/internships')
  async addInternshipsToField(
    @GetUser('id') userId: string,
    @Param('id') fieldId: string,
    @Body() dto: InternshipsToFieldAPIDto,
  ): Promise<ResponseStudyFieldAPIDto> {
    const intershipsIds = await this.auxService.getValidInternshipIds(dto.internships);

    if (intershipsIds.length === 0) {
      throw new BadRequestException('No valid internship to add.');
    }

    const studyFieldInfo = await this.studyFieldsService.getStudyFieldById(fieldId);

    if (!studyFieldInfo) {
      throw new NotFoundException('Resource Not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (studyFieldInfo.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this resource');
    }

    const studyField = await this.studyFieldsService.addInternshipsToField(fieldId, intershipsIds);

    return this.getStudyFieldResponse(studyField);
  }

  @Delete('field/:id/internships')
  async removeInternshipsFromField(
    @GetUser('id') userId: string,
    @Param('id') fieldId: string,
    @Body() dto: InternshipsToFieldAPIDto,
  ): Promise<ResponseStudyFieldAPIDto> {
    const internshipsIds = await this.auxService.getValidInternshipIds(dto.internships);

    if (internshipsIds.length === 0) {
      throw new BadRequestException('No valid internship to remove.');
    }

    const studyFieldInfo = await this.studyFieldsService.getStudyFieldById(fieldId);

    if (!studyFieldInfo) {
      throw new NotFoundException('Resource Not Found');
    }

    const pj = await this.auxService.getPjInfo(userId);

    if (studyFieldInfo.userId != pj.idPJ) {
      throw new ForbiddenException('This user does not own this resource');
    }

    const studyFieldsInternships = studyFieldInfo.internships.map((internships) => internships.internshipId);

    const existingSubjects = this.studyFieldsService.verifyIds(internshipsIds, studyFieldsInternships);

    if (existingSubjects.length === 0) {
      throw new BadRequestException('No valid intership to remove.');
    }

    const studyField = await this.studyFieldsService.removeInternshipsFromField(fieldId, existingSubjects);

    return this.getStudyFieldResponse(studyField);
  }

  private getStudyFieldResponse(studyField: TStudyFieldAllOutput): ResponseStudyFieldAPIDto {
    return {
      fieldId: studyField.studyFieldId,
      createdAt: studyField.createdAt,
      updatedAt: studyField.updatedAt,
      field: studyField.field,
      abilities: studyField.abilities.map((abilitie) => {
        return {
          abilityId: abilitie.abilities.habilidadeId,
          ability: abilitie.abilities.habilidade,
          category: abilitie.abilities.tema,
        };
      }),
      name: studyField.name,
      activities: studyField.activities.map((actvity) => {
        return actvity.activityId;
      }),
      subjects: studyField.subjects.map((subject) => {
        return subject.subjectId;
      }),
      internships: studyField.internships.map((internship) => {
        return internship.internshipId;
      }),
    };
  }
}
