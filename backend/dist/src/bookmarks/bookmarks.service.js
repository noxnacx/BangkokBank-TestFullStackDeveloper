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
exports.BookmarksService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../generated/prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let BookmarksService = class BookmarksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(ownerId, collectionId) {
        return this.prisma.bookmark.findMany({
            where: { ownerId, ...(collectionId !== undefined && { collectionId }) },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, ownerId) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: { id, ownerId },
        });
        if (!bookmark) {
            throw new common_1.NotFoundException('Bookmark not found');
        }
        return bookmark;
    }
    async create(dto, ownerId) {
        await this.assertCollectionOwnership(dto.collectionId, ownerId);
        return this.prisma.bookmark.create({
            data: {
                url: dto.url,
                title: dto.title,
                notes: dto.notes ?? null,
                ownerId,
                collectionId: dto.collectionId ?? null,
            },
        });
    }
    async replace(id, ownerId, dto) {
        await this.assertCollectionOwnership(dto.collectionId, ownerId);
        return this.mutate(id, ownerId, {
            url: dto.url,
            title: dto.title,
            notes: dto.notes ?? null,
            collectionId: dto.collectionId ?? null,
        });
    }
    async update(id, ownerId, dto) {
        if (dto.collectionId !== undefined) {
            await this.assertCollectionOwnership(dto.collectionId, ownerId);
        }
        return this.mutate(id, ownerId, {
            url: dto.url,
            title: dto.title,
            notes: dto.notes,
            collectionId: dto.collectionId,
        });
    }
    async remove(id, ownerId) {
        try {
            await this.prisma.bookmark.delete({ where: { id, ownerId } });
        }
        catch (error) {
            this.rethrowAsNotFoundIfMissing(error);
        }
    }
    async mutate(id, ownerId, data) {
        try {
            return await this.prisma.bookmark.update({ where: { id, ownerId }, data });
        }
        catch (error) {
            this.rethrowAsNotFoundIfMissing(error);
        }
    }
    async assertCollectionOwnership(collectionId, ownerId) {
        if (collectionId === undefined || collectionId === null) {
            return;
        }
        const collection = await this.prisma.collection.findUnique({
            where: { id: collectionId, ownerId },
        });
        if (!collection) {
            throw new common_1.BadRequestException('collectionId does not refer to a collection you own');
        }
    }
    rethrowAsNotFoundIfMissing(error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025') {
            throw new common_1.NotFoundException('Bookmark not found');
        }
        throw error;
    }
};
exports.BookmarksService = BookmarksService;
exports.BookmarksService = BookmarksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookmarksService);
//# sourceMappingURL=bookmarks.service.js.map