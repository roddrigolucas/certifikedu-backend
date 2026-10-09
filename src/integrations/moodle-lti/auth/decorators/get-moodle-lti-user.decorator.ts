import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetMoodleLtiLaunchInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.ltiLaunchInfo;
});

export const GetMoodleLtiConfig = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.moodleConfig;
});
