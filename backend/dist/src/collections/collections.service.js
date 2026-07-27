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
exports.CollectionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../generated/prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let CollectionsService = class CollectionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(ownerId) {
        return this.prisma.collection.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, ownerId) {
        const collection = await this.prisma.collection.findUnique({
            where: { id, ownerId },
        });
        if (!collection) {
            throw new common_1.NotFoundException('Collection not found');
        }
        return collection;
    }
    create(dto, ownerId) {
        return this.prisma.collection.create({
            data: { name: dto.name, ownerId },
        });
    }
    async update(id, ownerId, dto) {
        try {
            return await this.prisma.collection.update({
                where: { id, ownerId },
                data: { name: dto.name },
            });
        }
        catch (error) {
            this.rethrowAsNotFoundIfMissing(error);
        }
    }
    async remove(id, ownerId) {
        try {
            await this.prisma.collection.delete({ where: { id, ownerId } });
        }
        catch (error) {
            this.rethrowAsNotFoundIfMissing(error);
        }
    }
    async findBookmarks(id, ownerId) {
        await this.findOne(id, ownerId);
        return this.prisma.bookmark.findMany({
            where: { collectionId: id, ownerId },
            orderBy: { createdAt: 'desc' },
        });
    }
    rethrowAsNotFoundIfMissing(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025') {
            throw new common_1.NotFoundException('Collection not found');
        }
        throw error;
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CollectionsService);
//# sourceMappingURL=collections.service.js.map