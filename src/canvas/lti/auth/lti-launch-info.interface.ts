interface LTIContext {
  id: string;
  label: string;
  title: string;
  type: string[];
}

interface CanvasCustomParameters {
  canvasUserId: string;
  canvasCourseId: string;
  canvasCourseStartAt: string | null;
  canvasCourseEndAt: string | null;
  canvasCoursegradingScheme: string | null;
  canvasApiDomain: string;
  canvasMembershipRoles: string[];
}

export interface LTILaunchInfo {
  ltiClientId: string;
  email: string;
  name: string;
  picture: string;
  placement: string;
  context: LTIContext;
  roles: string[];
  canvasCustomParameters: CanvasCustomParameters;
  toolPlatformName: string;
}
