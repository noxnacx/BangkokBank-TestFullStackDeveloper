import { randomBytes } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { PatchCollectionDto } from './dto/patch-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(ownerId: string) {
    return this.prisma.collection.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, ownerId: string) {
    // Scoping the lookup itself by ownerId (rather than fetching by id and
    // checking ownership after) means "belongs to someone else" and
    // "doesn't exist" are indistinguishable at the query level — so there's
    // no separate code path that could leak which one it was.
    const collection = await this.prisma.collection.findUnique({
      where: { id, ownerId },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    return collection;
  }

  create(dto: CreateCollectionDto, ownerId: string) {
    return this.prisma.collection.create({
      data: { name: dto.name, ownerId },
    });
  }

  async update(
    id: string,
    ownerId: string,
    dto: UpdateCollectionDto | PatchCollectionDto,
  ) {
    try {
      // `name: undefined` (PATCH with the field omitted) is dropped by
      // Prisma rather than written, so the same call serves PUT and PATCH.
      return await this.prisma.collection.update({
        where: { id, ownerId },
        data: { name: dto.name },
      });
    } catch (error) {
      this.rethrowAsNotFoundIfMissing(error);
    }
  }

  async remove(id: string, ownerId: string) {
    try {
      await this.prisma.collection.delete({ where: { id, ownerId } });
    } catch (error) {
      this.rethrowAsNotFoundIfMissing(error);
    }
  }

  async findBookmarks(id: string, ownerId: string) {
    await this.findOne(id, ownerId); // ownership check — throws 404 if not found/not owned
    return this.prisma.bookmark.findMany({
      where: { collectionId: id, ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createShareLink(id: string, ownerId: string) {
    // 32 random bytes = 256 bits of entropy, not derived from the
    // collection's id/ownerId in any way -- brute-forcing or guessing a
    // valid token is infeasible. Collision against an existing token is
    // astronomically unlikely (not worth a retry loop); the `@unique`
    // constraint is the backstop if it ever somehow happened.
    const shareToken = randomBytes(32).toString('base64url');
    try {
      return await this.prisma.collection.update({
        where: { id, ownerId },
        data: { shareToken },
      });
    } catch (error) {
      this.rethrowAsNotFoundIfMissing(error);
    }
  }

  async revokeShareLink(id: string, ownerId: string) {
    try {
      await this.prisma.collection.update({
        where: { id, ownerId },
        data: { shareToken: null },
      });
    } catch (error) {
      this.rethrowAsNotFoundIfMissing(error);
    }
  }

  // Public, unauthenticated read path -- deliberately scoped to exactly the
  // one collection the token points at (found via the token itself, never
  // via ownerId), and hand-picks which fields leave the server. Nothing
  // here should ever expose ownerId, shareToken, or any other collection
  // belonging to the same owner.
  async getSharedView(token: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { shareToken: token },
    });
    if (!collection) {
      throw new NotFoundException('Shared collection not found');
    }

    const bookmarks = await this.prisma.bookmark.findMany({
      where: { collectionId: collection.id },
      orderBy: { createdAt: 'desc' },
    });

    return {
      id: collection.id,
      name: collection.name,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      bookmarks: bookmarks.map((b) => ({
        id: b.id,
        url: b.url,
        title: b.title,
        notes: b.notes,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
    };
  }

  private rethrowAsNotFoundIfMissing(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Collection not found');
    }
    throw error;
  }
}
