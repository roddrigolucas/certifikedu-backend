import { EducationLevelEnum } from "@prisma/client";

export interface ICourseToInstEvent {
  name: string;
  description: string;
  level: EducationLevelEnum;
  isAcademic?: boolean;
}
