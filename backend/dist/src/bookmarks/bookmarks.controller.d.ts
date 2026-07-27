import type { AuthenticatedRequest } from '../auth/auth.guard';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { ListBookmarksQueryDto } from './dto/list-bookmarks-query.dto';
import { PatchBookmarkDto } from './dto/patch-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
export declare class BookmarksController {
    private readonly bookmarksService;
    constructor(bookmarksService: BookmarksService);
    findAll(query: ListBookmarksQueryDto, req: AuthenticatedRequest): import("../../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        url: string;
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        collectionId: string | null;
    }[]>;
    findOne(id: string, req: AuthenticatedRequest): Promise<{
        url: string;
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        collectionId: string | null;
    }>;
    create(dto: CreateBookmarkDto, req: AuthenticatedRequest): Promise<{
        url: string;
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        collectionId: string | null;
    }>;
    replace(id: string, dto: UpdateBookmarkDto, req: AuthenticatedRequest): Promise<{
        url: string;
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        collectionId: string | null;
    }>;
    update(id: string, dto: PatchBookmarkDto, req: AuthenticatedRequest): Promise<{
        url: string;
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        collectionId: string | null;
    }>;
    remove(id: string, req: AuthenticatedRequest): Promise<void>;
}
