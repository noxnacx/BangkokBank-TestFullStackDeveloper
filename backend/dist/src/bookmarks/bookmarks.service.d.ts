import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { PatchBookmarkDto } from './dto/patch-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
export declare class BookmarksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(ownerId: string, collectionId?: string): Prisma.PrismaPromise<{
        url: string;
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        collectionId: string | null;
    }[]>;
    findOne(id: string, ownerId: string): Promise<{
        url: string;
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        collectionId: string | null;
    }>;
    create(dto: CreateBookmarkDto, ownerId: string): Promise<{
        url: string;
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        collectionId: string | null;
    }>;
    replace(id: string, ownerId: string, dto: UpdateBookmarkDto): Promise<{
        url: string;
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        collectionId: string | null;
    }>;
    update(id: string, ownerId: string, dto: PatchBookmarkDto): Promise<{
        url: string;
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        collectionId: string | null;
    }>;
    remove(id: string, ownerId: string): Promise<void>;
    private mutate;
    private assertCollectionOwnership;
    private rethrowAsNotFoundIfMissing;
}
