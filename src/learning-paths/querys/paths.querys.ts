import { Prisma } from '@prisma/client';

export const QLearningPaths = Prisma.validator<Prisma.LearningPathsSelect>()({
  pjId: true,
  pathId: true,
  name: true,
  createdAt: true,
  description: true,
  totalHoursWorkload: true,
  templateId: true,
  participants: {
    select: {
      createdAt: true,
      completed: true,
      completedAt: true,
      student: {
        select: {
          nome: true,
          idPF: true,
        },
      },
      modules: {
        select: {
          completed: true,
          completedAt: true,
          moduleId: true,
        },
      },
    },
  },
  modules: {
    select: {
      moduleId: true,
      moduleIndex: true,
      templateId: true,
      subjects: {
        select: {
          subject: {
            select: {
              students: {
                select: {
                  completedAt: true,
                  completed: true,
                  idPf: true,
                  student: {
                    select: {
                      nome: true,
                    },
                  },
                },
              },
              subjectId: true,
              name: true,
              description: true,
              totalHoursWorkload: true,
              templateId: true,
            },
          },
        },
      },
      internships: {
        select: {
          internship: {
            select: {
              students: {
                select: {
                  completed: true,
                  completedAt: true,
                  idPf: true,
                  student: {
                    select: {
                      nome: true,
                    },
                  },
                },
              },
              internshipId: true,
              name: true,
              description: true,
              hoursWorkload: true,
              templateId: true,
            },
          },
        },
      },
      activities: {
        select: {
          activity: {
            select: {
              students: {
                select: {
                  completed: true,
                  completedAt: true,
                  idPf: true,
                  student: {
                    select: {
                      nome: true,
                    },
                  },
                },
              },
              activityId: true,
              name: true,
              description: true,
              hoursWorkload: true,
              templateId: true,
            },
          },
        },
      },
      institutionalEvents: {
        select: {
          institutionalEvents: {
            select: {
              students: {
                select: {
                  completed: true,
                  completedAt: true,
                  idPf: true,
                  student: {
                    select: {
                      nome: true,
                    },
                  },
                },
              },
              institutionalEventId: true,
              name: true,
              description: true,
              hoursWorkload: true,
              templateId: true,
            },
          },
        },
      },
    },
  },
});

export const QPublicLearningPaths = Prisma.validator<Prisma.LearningPathsSelect>()({
  name: true,
  createdAt: true,
  description: true,
  totalHoursWorkload: true,
  modules: {
    select: {
      moduleId: true,
      moduleIndex: true,
      subjects: {
        select: {
          subject: {
            select: {
              name: true,
              description: true,
              totalHoursWorkload: true,
            },
          },
        },
      },
      internships: {
        select: {
          internship: {
            select: {
              name: true,
              description: true,
              hoursWorkload: true,
            },
          },
        },
      },
      activities: {
        select: {
          activity: {
            select: {
              name: true,
              description: true,
              hoursWorkload: true,
            },
          },
        },
      },
      institutionalEvents: {
        select: {
          institutionalEvents: {
            select: {
              name: true,
              description: true,
              hoursWorkload: true,
            },
          },
        },
      },
    },
  },
});
