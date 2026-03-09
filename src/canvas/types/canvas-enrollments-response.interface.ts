enum CanvasEnrollmentRoleEnum {
  Student = 'StudentEnrollment',
  Teacher = 'TeacherEnrollment',
}

enum CanvasEnrollmentStateEnum {
  Active = 'active',
  Invited = 'invited',
}

export interface ICanvasEnrollmentsResponse {
  user_id: number;
  role: CanvasEnrollmentRoleEnum;
  user: {
    id: number;
    name: string;
    sortable_name: string;
    short_name: string;
  };
  grades: {
    html_url: string;
    current_grade: string | null;
    current_score: number | null;
    final_grade: string | null;
    final_score: number | null;
  };
  enrollment_state: CanvasEnrollmentStateEnum;
}
