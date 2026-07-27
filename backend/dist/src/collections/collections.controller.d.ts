import type { AuthenticatedRequest } from '../auth/auth.guard';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { PatchCollectionDto } from './dto/patch-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
export declare class CollectionsController {
    private readonly collectionsService;
    constructor(collectionsService: CollectionsService);
    findAll(req: AuthenticatedRequest): import("../../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        id: string;
        name: string;
        ownerId: string;
        shareToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string, req: AuthenticatedRequest): Promise<{
        id: string;
        name: string;
        ownerId: string;
        shareToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findBookmarks(id: string, req: AuthenticatedRequest): Promise<{
        url: string;
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        collectionId: string | null;
    }[]>;
    create(dto: CreateCollectionDto, req: AuthenticatedRequest): import("../../generated/prisma/models").Prisma__CollectionClient<{
        id: string;
        name: string;
        ownerId: string;
        shareToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    replace(id: string, dto: UpdateCollectionDto, req: AuthenticatedRequest): Promise<{
        id: string;
        name: string;
        ownerId: string;
        shareToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: PatchCollectionDto, req: AuthenticatedRequest): Promise<{
        id: string;
        name: string;
        ownerId: string;
        shareToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, req: AuthenticatedRequest): Promise<void>;
    createShareLink(id: string, req: AuthenticatedRequest): Promise<{
        id: string;
        name: string;
        ownerId: string;
        shareToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    revokeShareLink(id: string, req: AuthenticatedRequest): Promise<void>;
}
