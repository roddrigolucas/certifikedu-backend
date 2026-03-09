import { EducationLevelEnum } from "@prisma/client";

export interface ICreateCourse {
  courseId: string;
  name: string;
  description: string;
  //educationLevel: EducationLevelEnum;
  level: EducationLevelEnum;
  idPj: string;
}
