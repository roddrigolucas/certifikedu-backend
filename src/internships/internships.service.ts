import { Injectable } from '@nestjs/common';
import { AuxService } from '../aux/aux.service';
import { PrismaService } from '../prisma/prisma.service';
import { ICreateInternship } from './interfaces/internships.interfaces';
import {
  TInternshipCreateInput,
  TInternshipCreateManyInput,
  TInternshipUpdateInput,
  TInternshipWhereInput,
  TIntershipWithCurriculumOutput,
} from './types/internships.types';

@Injectable()
export class InternshipsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auxService: AuxService,
  ) {}

  async checkInternshipsByIds(ids: Array<string>): Promise<Array<{internshipId: string, hoursWorkload: number}>> {
    const internshipsIds = await this.prismaService.internships.findMany({
      where: { internshipId: { in: ids } },
      select: { internshipId: true, hoursWorkload: true },
    });

    return internshipsIds
  }

  async getInternshipById(internshipId: string): Promise<TIntershipWithCurriculumOutput> {
    return await this.prismaService.internships.findUnique({
      where: { internshipId: internshipId },
      include: { curriculums: true },
    });
  }

  async getUserInternship(idPj: string): Promise<Array<TIntershipWithCurriculumOutput>> {
    return await this.prismaService.internships.findMany({
      where: { userId: idPj },
      include: { curriculums: true },
    });
  }

  async checkInternship(data: TInternshipWhereInput): Promise<TIntershipWithCurriculumOutput> {
    return await this.prismaService.internships.findFirst({
      where: data,
      include: { curriculums: true },
    });
  }

  async createInternship(data: TInternshipCreateInput): Promise<TIntershipWithCurriculumOutput> {
    return await this.prismaService.internships.create({
      data: data,
      include: { curriculums: true },
    });
  }

  async editInternship(internshipId: string, data: TInternshipUpdateInput): Promise<TIntershipWithCurriculumOutput> {
    return await this.prismaService.internships.update({
      where: { internshipId: internshipId },
      data: data,
      include: { curriculums: true },
    });
  }

  async deleteInternship(internshipId: string) {
    await this.prismaService.internships.delete({
      where: { internshipId: internshipId },
    });
  }

  async getCreateInternshipsFromArray(internshipData: Array<ICreateInternship>) {
    const internships: Array<TInternshipCreateManyInput> = (
      await Promise.all(
        internshipData.map(async (internshipInfo) => {
          const { studyField, idPj, ...rest } = internshipInfo;

          const internshipData = await this.checkInternship({
            name: rest.name,
            description: rest.description,
            userId: idPj,
            hoursWorkload: rest.hoursWorkload,
          });

          if (internshipData) {
            return null;
          }

          const data: TInternshipCreateManyInput = {
            name: rest.name,
            description: rest.description,
            userId: idPj,
            hoursWorkload: rest.hoursWorkload,
          };

          if (studyField) {
            const validStudyField = await this.auxService.getValidStudyFieldsIds([studyField]);
            if (validStudyField.length > 0) {
              data.studyFieldId = validStudyField.at(0);
            }
          }

          return data;
        }),
      )
    ).filter((x) => x != null);

    return internships;
    // await this.prismaService.internships.createMany({
    //   data: internships,
    // });
  }
}
