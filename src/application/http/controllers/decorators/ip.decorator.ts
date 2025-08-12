import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

/**
 * This decorator is used to get the real IP of the request
 */
export const Ip = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    return (request.headers['x-real-ip'] || request.headers['x-forwarded-for']) || request.ip;
  },
);