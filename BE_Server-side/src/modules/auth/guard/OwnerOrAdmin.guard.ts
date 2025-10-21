import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";

export class OwnerOrAdminGuard implements CanActivate{
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest()
        const user = request.user;
        const body = user.body;

        if (user.role === 'ADMIN') return true;

        return user.id === body.ownerID;
    }
}