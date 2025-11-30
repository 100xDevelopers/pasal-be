import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Extracts the subdomain from the request.
 * Returns null if no subdomain is present.
 *
 * @example
 * ```typescript
 * @Get()
 * getStore(@Subdomain() subdomain: string | null) {
 *   // subdomain = 'mystore' for mystore.pasal.com
 * }
 * ```
 */
export const Subdomain = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.subdomain;
  },
);

/**
 * Returns true if the request is coming from a subdomain.
 *
 * @example
 * ```typescript
 * @Get()
 * getStore(@IsSubdomain() isSubdomain: boolean) {
 *   if (!isSubdomain) throw new BadRequestException('No store specified');
 * }
 * ```
 */
export const IsSubdomain = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): boolean => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.isSubdomain;
  },
);
