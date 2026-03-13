import { Module } from '@nestjs/common';

//MODULES
import { SchoolsModule } from '../schools/schools.module';
import { AbilitiesModule } from '../abilities/abilities.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { CurriculumsModule } from '../curriculums/curriculums.module';
import { TemplatesModule } from '../templates/templates.module';
import { SemestersModule } from '../semesters/semesters.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { ActivitiesModule } from '../activities/activities.module';
import { InternshipsModule } from '../internships/internships.module';
import { CoursesModule } from '../courses/courses.module';
import { StudyFieldsModule } from '../studyfields/studyfields.module';
import { AuthModule } from '../auth/auth.module';
import { AuxModule } from '../_aux/_aux.module';
import { AcademicCredentialsModule } from '../academic-credentials/academic-credentials.module';
import { AWSModule } from '../aws/aws.module';
import { CredentialsModule } from '../credentials-api/credentials.module';
import { RequestsModule } from '../requests/requests.module';
import { BackgroundsModule } from '../backgrounds/backgrounds.module';

//CONTROLLERS
import { AbilitiesAPIController } from './controllers/abilities.controller';
import { ActivitiesAPIController } from './controllers/activities.controller';
import { CertificatesAPIController } from './controllers/certificates.controller';
import { CoursesAPIController } from './controllers/courses.controller';
import { CurriculumsAPIController } from './controllers/curriculums.controller';
import { InternshipsAPIController } from './controllers/internships.controller';
import { SchoolsAPIController } from './controllers/schools.controller';
import { SemestersAPIController } from './controllers/semesters.controller';
import { StudyFieldsAPIController } from './controllers/studyfields.controller';
import { SubjectsAPIController } from './controllers/subjects.controller';
import { TemplatesAPIController } from './controllers/templates.controller';
import { UsersAPIController } from './controllers/user.controller';
import { CredentialsAPIController } from './controllers/credentials.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    AuxModule,
    AWSModule,
    SchoolsModule,
    BackgroundsModule,
    AbilitiesModule,
    CertificatesModule,
    TemplatesModule,
    CurriculumsModule,
    SemestersModule,
    SubjectsModule,
    ActivitiesModule,
    InternshipsModule,
    CoursesModule,
    RequestsModule,
    UsersModule,
    StudyFieldsModule,
    AuthModule,
    AcademicCredentialsModule,
    CredentialsModule,
  ],
  controllers: [
    CredentialsAPIController,
    AbilitiesAPIController,
    ActivitiesAPIController,
    CertificatesAPIController,
    CoursesAPIController,
    CurriculumsAPIController,
    InternshipsAPIController,
    SchoolsAPIController,
    SemestersAPIController,
    StudyFieldsAPIController,
    SubjectsAPIController,
    TemplatesAPIController,
    UsersAPIController,
  ],
  providers: [],
})
export class ApiModule { }
