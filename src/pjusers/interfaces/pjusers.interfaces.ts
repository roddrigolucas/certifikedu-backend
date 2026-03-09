import { PJAdminRoleEnum, PJAssociationStatus } from "@prisma/client";
import { EnvironmentEnum } from "../dtos/pjusers-input.dto";


export interface IUserCompanies {
  name: string;
  pjId: string;
  statusAssociation: PJAssociationStatus;
  role: PJAdminRoleEnum;
  environment: EnvironmentEnum,
}
