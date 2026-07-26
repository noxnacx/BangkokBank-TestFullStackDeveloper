import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BookmarksService } from './bookmarks.service';

function prismaKnownError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('mocked prisma error', {
    code,
    clientVersion: '7.9.0',
  });
}

const OWNER = 'auth0|owner-a';
const OTHER_OWNER = 'auth0|owner-b';

describe('BookmarksService', () => {
  let service: BookmarksService;
  const prisma = {
    bookmark: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    collection: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        BookmarksService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(BookmarksService);
  });

  describe('findAll', () => {
    it('filters by ownerId only when no collectionId given', async () => {
      prisma.bookmark.findMany.mockResolvedValueOnce([]);
      await service.findAll(OWNER);
      expect(prisma.bookmark.findMany).toHaveBeenCalledWith({
        where: { ownerId: OWNER },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('filters by ownerId and collectionId when given', async () => {
      prisma.bookmark.findMany.mockResolvedValueOnce([]);
      await service.findAll(OWNER, 'col-1');
      expect(prisma.bookmark.findMany).toHaveBeenCalledWith({
        where: { ownerId: OWNER, collectionId: 'col-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('returns the bookmark when owned by the caller', async () => {
      prisma.bookmark.findUnique.mockResolvedValueOnce({ id: '1', ownerId: OWNER });
      const result = await service.findOne('1', OWNER);
      expect(prisma.bookmark.findUnique).toHaveBeenCalledWith({
        where: { id: '1', ownerId: OWNER },
      });
      expect(result).toEqual({ id: '1', ownerId: OWNER });
    });

    it('throws NotFoundException (not Forbidden) when the bookmark belongs to a different owner', async () => {
      prisma.bookmark.findUnique.mockResolvedValueOnce(null);
      await expect(service.findOne('1', OTHER_OWNER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates without a collection when collectionId is omitted', async () => {
      prisma.bookmark.create.mockResolvedValueOnce({ id: '1' });
      await service.create({ url: 'https://example.com', title: 'Example' }, OWNER);
      expect(prisma.collection.findUnique).not.toHaveBeenCalled();
      expect(prisma.bookmark.create).toHaveBeenCalledWith({
        data: {
          url: 'https://example.com',
          title: 'Example',
          notes: null,
          ownerId: OWNER,
          collectionId: null,
        },
      });
    });

    it('creates with a collection the caller owns', async () => {
      prisma.collection.findUnique.mockResolvedValueOnce({ id: 'col-1', ownerId: OWNER });
      prisma.bookmark.create.mockResolvedValueOnce({ id: '1' });

      await service.create(
        { url: 'https://example.com', title: 'Example', collectionId: 'col-1' },
        OWNER,
      );

      expect(prisma.collection.findUnique).toHaveBeenCalledWith({
        where: { id: 'col-1', ownerId: OWNER },
      });
      expect(prisma.bookmark.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ collectionId: 'col-1', ownerId: OWNER }),
      });
    });

    it('rejects with 400 when collectionId belongs to a different owner (not 404, no leak)', async () => {
      // The scoped lookup returns null whether the collection belongs to
      // someone else or doesn't exist at all -- same as the Collections
      // ownership check, just surfaced as 400 here because it's a body
      // field, not the resource the URL points at.
      prisma.collection.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.create(
          { url: 'https://example.com', title: 'Example', collectionId: 'col-owned-by-b' },
          OWNER,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.bookmark.create).not.toHaveBeenCalled();
    });
  });

  describe('replace (PUT)', () => {
    it('checks collection ownership and clears notes/collectionId when omitted', async () => {
      prisma.bookmark.update.mockResolvedValueOnce({ id: '1' });
      await service.replace('1', OWNER, {
        url: 'https://example.com',
        title: 'Example',
      });
      expect(prisma.bookmark.update).toHaveBeenCalledWith({
        where: { id: '1', ownerId: OWNER },
        data: {
          url: 'https://example.com',
          title: 'Example',
          notes: null,
          collectionId: null,
        },
      });
    });

    it('rejects with 400 when collectionId belongs to a different owner', async () => {
      prisma.collection.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.replace('1', OWNER, {
          url: 'https://example.com',
          title: 'Example',
          collectionId: 'col-owned-by-b',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.bookmark.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the bookmark belongs to a different owner', async () => {
      prisma.bookmark.update.mockRejectedValueOnce(prismaKnownError('P2025'));
      await expect(
        service.replace('1', OTHER_OWNER, {
          url: 'https://example.com',
          title: 'hijack attempt',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update (PATCH)', () => {
    it('leaves collectionId untouched when omitted, and does not check ownership', async () => {
      prisma.bookmark.update.mockResolvedValueOnce({ id: '1' });
      await service.update('1', OWNER, { title: 'New title' });
      expect(prisma.collection.findUnique).not.toHaveBeenCalled();
      expect(prisma.bookmark.update).toHaveBeenCalledWith({
        where: { id: '1', ownerId: OWNER },
        data: { url: undefined, title: 'New title', notes: undefined, collectionId: undefined },
      });
    });

    it('clears collectionId when explicitly set to null', async () => {
      prisma.bookmark.update.mockResolvedValueOnce({ id: '1' });
      await service.update('1', OWNER, { collectionId: null });
      expect(prisma.bookmark.update).toHaveBeenCalledWith({
        where: { id: '1', ownerId: OWNER },
        data: { url: undefined, title: undefined, notes: undefined, collectionId: null },
      });
    });

    it('rejects with 400 when moving into a collection owned by a different user', async () => {
      prisma.collection.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.update('1', OWNER, { collectionId: 'col-owned-by-b' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.bookmark.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the bookmark belongs to a different owner', async () => {
      prisma.bookmark.update.mockRejectedValueOnce(prismaKnownError('P2025'));
      await expect(
        service.update('1', OTHER_OWNER, { title: 'hijack attempt' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes when the scoped where matches', async () => {
      prisma.bookmark.delete.mockResolvedValueOnce({ id: '1' });
      await service.remove('1', OWNER);
      expect(prisma.bookmark.delete).toHaveBeenCalledWith({
        where: { id: '1', ownerId: OWNER },
      });
    });

    it('throws NotFoundException when the bookmark belongs to a different owner', async () => {
      prisma.bookmark.delete.mockRejectedValueOnce(prismaKnownError('P2025'));
      await expect(service.remove('1', OTHER_OWNER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
