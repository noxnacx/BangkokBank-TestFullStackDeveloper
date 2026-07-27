"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jose_1 = require("jose");
const public_decorator_1 = require("./public.decorator");
const issuer = process.env.AUTH0_ISSUER;
const audience = process.env.AUTH0_AUDIENCE;
if (!issuer || !audience) {
    throw new Error('AUTH0_ISSUER and AUTH0_AUDIENCE must be set to verify access tokens');
}
const jwks = (0, jose_1.createRemoteJWKSet)(new URL('.well-known/jwks.json', issuer));
let AuthGuard = class AuthGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = extractBearerToken(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Missing bearer token');
        }
        try {
            const { payload } = await (0, jose_1.jwtVerify)(token, jwks, {
                issuer,
                audience,
                algorithms: ['RS256'],
            });
            if (typeof payload.sub !== 'string') {
                throw new common_1.UnauthorizedException('Token missing sub claim');
            }
            request.user = { ownerId: payload.sub };
            return true;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], AuthGuard);
function extractBearerToken(request) {
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    return scheme === 'Bearer' ? token : undefined;
}
//# sourceMappingURL=auth.guard.js.map