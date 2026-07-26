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
