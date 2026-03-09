export interface ICanvasUserAuthPayload {
  userId: string;
  courseId: string;
  schoolId: string;
}

export interface ICanvasUserVerifiedPayload {
  userId: string;
  courseId: string;
  schoolId: string;
  iat: number;
  exp: number;
}

export interface ICanvasUserData {
  userId: string;
  email: string;
  courseId: string;
  schoolId: string;
}
