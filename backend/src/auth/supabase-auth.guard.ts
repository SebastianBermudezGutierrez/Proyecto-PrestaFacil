import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from "@nestjs/common";

  import { Request } from "express";
  import { SupabaseAuthService } from "./supabase-auth.service.js";

  export interface AuthenticatedRequest extends Request {
    user: {
      id: string;
      email?: string;
    };
  }

  @Injectable()
  export class SupabaseAuthGuard implements CanActivate {
    constructor(
      private readonly authService: SupabaseAuthService,
    ) {}

    async canActivate(
      context: ExecutionContext,
    ): Promise<boolean> {
      const request = context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

      const authorization =
        request.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
    throw new UnauthorizedException(
      "Token de autenticación requerido",
    );
  }

      const token = authorization.substring(7);

      const user =
        await this.authService.verifyAccessToken(token);

      request.user = {
        id: user.id,
        email: user.email,
      };

      return true;
    }
  }
