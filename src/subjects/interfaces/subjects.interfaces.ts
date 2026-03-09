import { SubjectTypeEnum } from "@prisma/client";

export interface ICreateSubject {
  subjectId: string;
  idPj: string;
  name: string;
  description: string;
  totalHoursWorkload: number;
  praticalHoursWorkload?: number;
  teoricHoursWorkload?: number;
  complementaryHoursWorkload?: number;
  eadHoursWorkload?: number;
  type: SubjectTypeEnum;
}

