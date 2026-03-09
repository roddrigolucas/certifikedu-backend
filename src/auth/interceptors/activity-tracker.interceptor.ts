import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityTrackerInterceptor implements NestInterceptor {
    constructor(private readonly prismaService: PrismaService) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers['authorization'];

        // If an authorization header is present and is Bearer, track activity for this session
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];

            try {
                const session = await this.prismaService.session.findUnique({
                    where: { token },
                });

                if (session && session.isActive) {
                    const now = new Date();
                    const timeSinceLastActivity = Math.floor((now.getTime() - session.lastActivityAt.getTime()) / 1000);

                    if (timeSinceLastActivity > 0) {
                        await this.prismaService.session.update({
                            where: { token },
                            data: {
                                lastActivityAt: now,
                                durationSeconds: { increment: timeSinceLastActivity },
                            },
                        });
                    }
                }
            } catch (e) {
                // Ignore errors to not block the request
                console.error('Failed to update session activity', e);
            }
        }

        return next.handle();
    }
}
