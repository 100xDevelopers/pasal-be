import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include subdomain properties
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      subdomain: string | null;
      isSubdomain: boolean;
    }
  }
}

@Injectable()
export class SubdomainMiddleware implements NestMiddleware {
  private readonly baseDomain: string;

  constructor(private readonly configService: ConfigService) {
    this.baseDomain =
      this.configService.get<string>('BASE_DOMAIN') || 'pasal.com';
  }

  use(req: Request, res: Response, next: NextFunction) {
    const host = req.headers.host || '';
    const subdomain = this.extractSubdomain(host);

    req.subdomain = subdomain;
    req.isSubdomain = !!subdomain;

    next();
  }

  private extractSubdomain(host: string): string | null {
    // Remove port if present
    const hostname = host.split(':')[0];

    // Handle localhost development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return null;
    }

    // Handle local development with custom domain (e.g., mystore.pasal.local)
    if (hostname.endsWith('.local')) {
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        return parts[0];
      }
      return null;
    }

    // Production: extract subdomain from host
    const parts = hostname.split('.');

    // e.g., pasal.com (no subdomain) or www.pasal.com
    if (parts.length <= 2) {
      return null;
    }

    const subdomain = parts[0];

    // Ignore common system subdomains
    const ignored = [
      'www',
      'api',
      'admin',
      'app',
      'mail',
      'ftp',
      'cdn',
      'static',
    ];
    if (ignored.includes(subdomain)) {
      return null;
    }

    return subdomain;
  }
}
