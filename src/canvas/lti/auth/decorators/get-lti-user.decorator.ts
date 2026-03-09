import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LTILaunchInfo } from '../lti-launch-info.interface';

export const GetLTILaunchInfo = createParamDecorator((data, ctx: ExecutionContext): LTILaunchInfo => {
  const request = ctx.switchToHttp().getRequest();
  if (!request.ltiLaunchInfo) {
    throw new Error('LTI Launch Info not found in request');
  }
  const ltiLaunchInfo = request.ltiLaunchInfo;
  const customParameters = ltiLaunchInfo['https://purl.imsglobal.org/spec/lti/claim/custom'];
  const context = ltiLaunchInfo['https://purl.imsglobal.org/spec/lti/claim/context'];
  console.log(`customParameters: ${JSON.stringify(customParameters)}`);
  return {
    ltiClientId: ltiLaunchInfo.aud,
    email: ltiLaunchInfo.email,
    name: ltiLaunchInfo.name,
    picture: ltiLaunchInfo.picture,
    placement: ltiLaunchInfo['https://www.instructure.com/placement'],
    roles: ltiLaunchInfo['https://purl.imsglobal.org/spec/lti/claim/roles'],
    canvasCustomParameters: {
      canvasApiDomain: customParameters.canvas_api_domain,
      canvasUserId: customParameters.canvas_user_id,
      canvasCourseId: customParameters.canvas_course_id,
      canvasCourseStartAt: customParameters.canvas_course_start_at,
      canvasCourseEndAt: customParameters.canvas_course_end_at,
      canvasCoursegradingScheme: customParameters.canvas_course_grading_scheme,
      canvasMembershipRoles: customParameters.canvas_membership_roles,
    },
    context: {
      id: context.id,
      label: context.label,
      title: context.title,
      type: context.type,
    },
    toolPlatformName: ltiLaunchInfo['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].name,
  };
});
