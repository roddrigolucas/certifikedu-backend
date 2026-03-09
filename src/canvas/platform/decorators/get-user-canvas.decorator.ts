import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CanvasGetUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  if (data) {
    return request.user.userInfo[data];
  }

  return request.user.userInfo;
});
