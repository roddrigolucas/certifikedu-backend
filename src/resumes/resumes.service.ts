import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { listResumeQuery, resumeWithDetails } from './queries/resume.queries';
import { TResumeCreateInput, TResumeOutput, TResumeUpdateInput, TResumeWithDetailsOutput } from './types/resumes.types';

@Injectable()
export class ResumesService {
  constructor(private readonly prismaService: PrismaService) {}

  async getResume(resumeId: string): Promise<TResumeWithDetailsOutput> {
    return this.prismaService.resume.findUnique({
      where: { resumeId },
      select: resumeWithDetails,
    });
  }

  async createResume(data: TResumeCreateInput): Promise<TResumeWithDetailsOutput> {
    return this.prismaService.resume.create({
      data,
      select: resumeWithDetails,
    });
  }

  async listResumes(idPF: string): Promise<TResumeOutput[]> {
    return this.prismaService.resume.findMany({
      where: { idPF },
      select: listResumeQuery,
    });
  }

  async deleteResume(resumeId: string) {
    return this.prismaService.resume.delete({
      where: { resumeId },
    });
  }
  async updateResumeV2(resumeId: string, data: TResumeUpdateInput): Promise<TResumeWithDetailsOutput> {
    return this.prismaService.resume.update({
      where: { resumeId },
      data,
      select: resumeWithDetails,
    });
  }

  async updateResume(resumeId: string, updateData: TResumeUpdateInput): Promise<TResumeWithDetailsOutput> {
    return this.prismaService.resume.update({
      where: { resumeId },
      data: updateData,
      select: resumeWithDetails,
    });
  }
}
