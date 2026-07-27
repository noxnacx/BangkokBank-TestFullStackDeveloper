"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
const OWNER_A = 'auth0|62e089faea483987422db6cc';
const OWNER_B = 'auth0|PLACEHOLDER-USERB-REPLACE-ME';
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
    await prisma.bookmark.deleteMany({
        where: { ownerId: { in: [OWNER_A, OWNER_B] } },
    });
    await prisma.collection.deleteMany({
        where: { ownerId: { in: [OWNER_A, OWNER_B] } },
    });
    const [reading, work] = await Promise.all([
        prisma.collection.create({ data: { name: 'Reading list', ownerId: OWNER_A } }),
        prisma.collection.create({ data: { name: 'Work references', ownerId: OWNER_A } }),
    ]);
    await prisma.bookmark.createMany({
        data: [
            {
                url: 'https://news.ycombinator.com',
                title: 'Hacker News',
                ownerId: OWNER_A,
                collectionId: reading.id,
            },
            {
                url: 'https://en.wikipedia.org/wiki/Bookmark_(digital)',
                title: 'Bookmark (Wikipedia)',
                ownerId: OWNER_A,
                collectionId: reading.id,
            },
            {
                url: 'https://docs.nestjs.com',
                title: 'NestJS docs',
                notes: 'Framework this backend is built on',
                ownerId: OWNER_A,
                collectionId: work.id,
            },
            {
                url: 'https://www.prisma.io/docs',
                title: 'Prisma docs',
                ownerId: OWNER_A,
                collectionId: work.id,
            },
            {
                url: 'https://example.com/uncategorized',
                title: 'Uncategorized example',
                ownerId: OWNER_A,
                collectionId: null,
            },
        ],
    });
    const userBCollection = await prisma.collection.create({
        data: { name: "User B's collection", ownerId: OWNER_B },
    });
    await prisma.bookmark.createMany({
        data: [
            {
                url: 'https://example.org/user-b-bookmark-1',
                title: 'User B bookmark 1',
                ownerId: OWNER_B,
                collectionId: userBCollection.id,
            },
            {
                url: 'https://example.org/user-b-bookmark-2',
                title: 'User B bookmark 2',
                ownerId: OWNER_B,
                collectionId: userBCollection.id,
            },
        ],
    });
    console.log('Seeded:');
    console.log(`  User A (${OWNER_A}): 2 collections, 5 bookmarks (4 in a collection + 1 uncategorized)`);
    console.log(`  User B (${OWNER_B}): 1 collection, 2 bookmarks`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map