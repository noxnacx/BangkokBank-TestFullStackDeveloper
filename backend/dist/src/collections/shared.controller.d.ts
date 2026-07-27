import { CollectionsService } from './collections.service';
export declare class SharedController {
    private readonly collectionsService;
    constructor(collectionsService: CollectionsService);
    getShared(token: string): Promise<{
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
}
