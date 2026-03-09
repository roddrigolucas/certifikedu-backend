import { Module } from '@nestjs/common';
import { BackgroundsModule } from '../backgrounds/backgrounds.module';
import { AuthModule } from '../auth/auth.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { CoursesModule } from '../courses/courses.module';
import { EmailsModule } from '../emails/emails.module';
import { SchoolsModule } from '../schools/schools.module';
import { TemplatesModule } from '../templates/templates.module';
import { UsersModule } from '../users/users.module';
import { AuxModule } from '../aux/aux.module';
import { FontsModule } from 'src/fonts/fonts.module';
import { BackgroundsInstitutionalController } from './controllers/backgrounds.controller';
import { CertificatesInstitutionalController } from './controllers/certificates.controller';
import { CoursesInstitutionalController } from './controllers/courses.controller';
import { PJUsersInstitutionalController } from './controllers/pjuser.controller';
import { SchoolsInstitutionalController } from './controllers/schools.controller';
import { StudentsInstitutionalController } from './controllers/students.controller';
import { TemplatesInstitutionalController } from './controllers/templates.controller';
import { PJUsersModule } from '../pjusers/pjusers.module';
import { AWSModule } from '../aws/aws.module';
import { SubjectsPjInfoController } from './controllers/academic-structure/subjects.controller';
import { CurriculumsPjInfoController } from './controllers/academic-structure/curriculum.controller';
import { SemestersPjInfoController } from './controllers/academic-structure/semester.controler';
import { InternshipsPjInfoController } from './controllers/academic-structure/internships.controller';
import { ActivitiesPjInfoController } from './controllers/academic-structure/activities.controller';
import { CurriculumsModule } from 'src/curriculums/curriculums.module';
import { SemestersModule } from 'src/semesters/semesters.module';
import { SubjectsModule } from 'src/subjects/subjects.module';
import { InternshipsModule } from 'src/internships/internships.module';
import { ActivitiesModule } from 'src/activities/activities.module';
import { LearningPathPjInfoController } from './controllers/paths.controller';
import { LearningPathsModule } from 'src/learning-paths/path.module';
import { InstitutionalEventsModule } from 'src/institutional-events/inst-events.module';
import { InstitutionalEventsPjInfoController } from './controllers/inst-events.controller';
import { MetabaseModule } from 'src/metabase/metabase.module';
import { MetabasePjInfoController } from './controllers/metabase.controller';
import { InverseModule } from 'src/inverse/inverse.module';
import { InversePjInfoController } from './controllers/inverse.controller';
import { FontsInstitutionalController } from './controllers/fonts.controller';

@Module({
  imports: [
    AWSModule,
    AuxModule,
    SchoolsModule,
    CoursesModule,
    CurriculumsModule,
    LearningPathsModule,
    SemestersModule,
    SubjectsModule,
    InternshipsModule,
    ActivitiesModule,
    EmailsModule,
    TemplatesModule,
    CertificatesModule,
    PJUsersModule,
    AuthModule,
    UsersModule,
    BackgroundsModule,
    FontsModule,
    InstitutionalEventsModule,
    MetabaseModule,
    InverseModule,
  ],
  controllers: [
    BackgroundsInstitutionalController,
    CertificatesInstitutionalController,
    CoursesInstitutionalController,
    PJUsersInstitutionalController,
    SchoolsInstitutionalController,
    StudentsInstitutionalController,
    TemplatesInstitutionalController,
    CurriculumsPjInfoController,
    SemestersPjInfoController,
    SubjectsPjInfoController,
    InternshipsPjInfoController,
    ActivitiesPjInfoController,
    LearningPathPjInfoController,
    InstitutionalEventsPjInfoController,
    FontsInstitutionalController,
    MetabasePjInfoController,
    InversePjInfoController,
  ],
  providers: [],
  exports: [],
})
export class PJInfoModule {}
