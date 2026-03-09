import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PJAdminRoleEnum } from '@prisma/client';
import { TPessoaJuridicaUpdateInput, TUserPfOutput } from '../users/types/user.types';
import {
  TCorporateAdminsWithPfOutput,
  TPessoaJuridicaWithSociosOutput,
  TPjAdminsWithPfOutput,
} from './types/pjusers.types';

@Injectable()
export class PJUsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getPartnerId(userId: string): Promise<number> {
    return (
      await this.prismaService.socios.findFirst({
        where: { userId: userId },
        select: { sociosId: true },
      })
    ).sociosId;
  }

  async getUserByEmailOrDocument(info: string): Promise<TUserPfOutput> {
    return await this.prismaService.user.findFirst({
      where: { OR: [{ email: info }, { numeroDocumento: info }] },
      include: { pessoaFisica: true },
    });
  }

  async getPjUserById(userId: string): Promise<TPessoaJuridicaWithSociosOutput> {
    return await this.prismaService.pessoaJuridica.findUnique({
      where: { userId: userId },
      include: { socios: true, user: true },
    });
  }

  async editPjInfo(userId: string, data: TPessoaJuridicaUpdateInput): Promise<TPessoaJuridicaWithSociosOutput> {
    return await this.prismaService.pessoaJuridica.update({
      where: { userId: userId },
      data: data,
      include: { socios: true },
    });
  }

  async getInstitutionalAdmin(idPJ: string, idPF: string): Promise<TPjAdminsWithPfOutput> {
    return await this.prismaService.pJAdmins.findFirst({
      where: { AND: [{ idPJ: idPJ }, { idPF: idPF }] },
      include: { pf: { include: { user: true } } },
    });
  }

  async getCorporateAdmin(idPJ: string, idPF: string): Promise<TCorporateAdminsWithPfOutput> {
    return await this.prismaService.corporateAdmins.findFirst({
      where: { AND: [{ idPJ: idPJ }, { idPF: idPF }] },
      include: { pf: { include: { user: true } } },
    });
  }

  async updateInstitutionalAdminStatus(idAdmin: string) {
    return await this.prismaService.pJAdmins.update({
      where: { idAdmin: idAdmin },
      data: { status: 'ENABLED' },
    });
  }

  async updateCorporateAdminStatus(idCorporateAdmin: string) {
    return await this.prismaService.corporateAdmins.update({
      where: { idCorporateAdmin: idCorporateAdmin },
      data: { status: 'ENABLED' },
    });
  }

  async associateInstutitionalAdminRecord(
    idPJ: string,
    idPF: string,
    role: PJAdminRoleEnum,
  ): Promise<TPjAdminsWithPfOutput> {
    return await this.prismaService.pJAdmins.create({
      data: {
        idPJ: idPJ,
        idPF: idPF,
        role: role,
      },
      include: { pf: { include: { user: true } } },
    });
  }

  async associateCorporateAdminRecord(
    idPj: string,
    idPf: string,
    role: PJAdminRoleEnum,
  ): Promise<TCorporateAdminsWithPfOutput> {
    return await this.prismaService.corporateAdmins.create({
      data: {
        idPJ: idPj,
        idPF: idPf,
        role: role,
      },
      include: { pf: { include: { user: true } } },
    });
  }

  async getValidInstitutionalAdminsIds(idPj: string, ids: Array<string>): Promise<Array<string>> {
    const admins = await this.prismaService.pJAdmins.findMany({
      where: { AND: [{ idAdmin: { in: ids } }, { idPJ: idPj }] },
      select: { idAdmin: true },
    });

    return admins.map((id) => id.idAdmin);
  }

  async getValidCorporateAdminsIds(idPj: string, ids: Array<string>): Promise<Array<string>> {
    const admins = await this.prismaService.corporateAdmins.findMany({
      where: { AND: [{ idCorporateAdmin: { in: ids } }, { idPJ: idPj }] },
      select: { idCorporateAdmin: true },
    });

    return admins.map((id) => id.idCorporateAdmin);
  }

  async deleteInstitutionalAdmins(ids: Array<string>) {
    await this.prismaService.pJAdmins.deleteMany({
      where: { idAdmin: { in: ids } },
    });
  }

  async deleteCorporateAdmins(ids: Array<string>) {
    await this.prismaService.corporateAdmins.deleteMany({
      where: { idCorporateAdmin: { in: ids } },
    });
  }

  async updateInstitutionalAdminRole(admins: Array<{ adminId: string; role: PJAdminRoleEnum }>) {
    const querys = admins.map((admin) => {
      return this.prismaService.pJAdmins.update({
        where: { idAdmin: admin.adminId },
        data: { role: admin.role },
      });
    });

    await this.prismaService.$transaction(querys);
  }

  async updateCorporateAdminRole(admins: Array<{ adminId: string; role: PJAdminRoleEnum }>) {
    const querys = admins.map((admin) => {
      return this.prismaService.corporateAdmins.update({
        where: { idCorporateAdmin: admin.adminId },
        data: { role: admin.role },
      });
    });

    await this.prismaService.$transaction(querys);
  }
}
