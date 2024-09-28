import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class RolesGuard extends AuthGuard("jwt") implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First, perform JWT authentication
    const authenticated = await super.canActivate(context);
    if (!authenticated) {
      return false;
    }

    // If authenticated, check for required roles
    const requiredRoles = this.reflector.get<Role[]>(
      "roles",
      context.getHandler()
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No specific roles required
    }

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
