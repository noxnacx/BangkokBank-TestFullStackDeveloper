import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { PatchCollectionDto } from './dto/patch-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
export declare class CollectionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(ownerId: string): Prisma.PrismaPromise<{
        id: string;
        name: string;
        ownerId: string;
        shareToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string, ownerId: string): Promise<{
        id: string;
        name: string;
        ownerId: string;
        shareToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateCollectionDto, ownerId: string): Prisma.Prisma__CollectionClient<{
        id: string;
        name: string;
        ownerId: string;
        shareToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: Prisma.GlobalOmitConfig | undefined;
    }>;
    update(id: string, ownerId: string, dto: UpdateCollectionDto | PatchCollectionDto): Promise<{
        id: string;
        name: string;
        ownerId: string;
        shareToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, ownerId: string): Promise<void>;
    findBookmarks(id: string, ownerId: string): Promise<{
        url: string;
        id: string;
        ownerId: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        title: string;
        collectionId: string | null;
    }[]>;
    createShareLink(id: string, ownerId: string): Promise<{
        id: string;
        name: string;
        ownerId: string;
        shareToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    revokeShareLink(id: string, ownerId: string): Promise<void>;
    getSharedView(token: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        bookmarks: {
            id: string;
            url: string;
            title: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    private rethrowAsNotFoundIfMissing;
}
