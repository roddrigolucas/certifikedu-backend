import { EducationLevelEnum } from '@prisma/client';
import { CreateNewAbilitieAPIDto } from 'src/api/dtos/abilities/abilities-input.dto';
import { CreateNewCertificateAPIDto } from 'src/api/dtos/certificates/certificates-input.dto';
import { CreateCourseAPIDto } from 'src/api/dtos/courses/courses-input.dto';
import { CreateNewSchoolAPIDto, UpdateSchoolAPIDto } from 'src/api/dtos/schools/schools-input.dto';
import { AddUserToSchoolAPIDto, CreateNewUserAPIDto } from 'src/api/dtos/user/user-input.dto';

export const schoolInfo: CreateNewSchoolAPIDto = {
  schoolCnpj: '04989912000199',
  homepageUrl: 'https://www.certifikedu.com',
  phoneNumber: '54999999999',
  description: 'Escola teste e2e',
  email: 'certifikedu@certifikedu.com',
  name: 'Escola Teste',
};

export const updateSchool: UpdateSchoolAPIDto = {
  homepageUrl: 'https://www.certifikedu.editado',
  phoneNumber: '54988888888',
  description: 'Escola Editada e2e',
  email: 'editada@certifikedu.com',
  name: 'Escola Teste Editada',
};

export const courseInfo: CreateCourseAPIDto = {
  name: 'Curso Teste',
  description: 'Curso Teste',
  educationLevel: EducationLevelEnum.Doutorado,
};

export const updateCourse: CreateCourseAPIDto = {
  name: 'Curso Teste Editado',
  description: 'Curso Teste Editado',
  educationLevel: EducationLevelEnum.Mestrado,
};

export const studentInfo: CreateNewUserAPIDto = {
  documentNumber: '07455823037',
  email: 'guilherme.dendena@certifikedu.com',
  schoolCnpj: '04989912000199',
  pfInfo: {
    name: 'Usuario Teste',
    phoneNumber: '54977777777',
    DOB: '12/12/2000',
    cepNumber: '90690100',
    state: 'PB',
    city: 'Paraiba',
    region: 'Paraibana',
    street: 'Paraiba',
    houseNumber: '32',
    complement: 'fundos',
  },
};

export const addUserToSchool: AddUserToSchoolAPIDto = {
  documentNumbers: ['07455823037'],
  schoolId: '',
};

export const abilityInfo: CreateNewAbilitieAPIDto = {
  ability: 'Abilidade Teste 1',
  category: 'Teste',
};

export const abilityInfo2: CreateNewAbilitieAPIDto = {
  ability: 'Abilidade Teste 2',
  category: 'Categoria',
};

export const existingAbility: CreateNewAbilitieAPIDto = {
  ability: 'Abilidade Teste 2',
  category: 'Categoria',
};

export const certificateInfo: CreateNewCertificateAPIDto = {
  receptorDoc: '07455823037',
  name: 'Certificado Teste',
  description: 'Certificado Teste e2e',
  hoursWorkload: '10',
  abilities: [
    {
      ability: 'Abilidade Criada via certificado',
      category: 'API',
    },
  ],
  issuedAt: '12/12/2000',
  expiresAt: '12/12/2010',
  schoolCnpj: '04989912000199',
};
