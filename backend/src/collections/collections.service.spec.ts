import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionsService } from './collections.service';

function prismaKnownError(code: string) {
  return new Prisma.PrismaClientKnownRequestError('mocked prisma error', {
    code,
    clientVersion: '7.9.0',
  });
}

const OWNER = 'auth0|owner-a';
const OTHER_OWNER = 'auth0|owner-b';

describe('CollectionsService', () => {
  let service: CollectionsService;
  const prisma = {
    collection: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    bookmark: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CollectionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(CollectionsService);
  });

  describe('findAll', () => {
    it('filters by ownerId', async () => {
      prisma.collection.findMany.mockResolvedValueOnce([{ id: '1' }]);

      const result = await service.findAll(OWNER);

      expect(prisma.collection.findMany).toHaveBeenCalledWith({
        where: { ownerId: OWNER },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('findOne', () => {
    it('returns the collection when owned by the caller', async () => {
      prisma.collection.findUnique.mockResolvedValueOnce({
        id: '1',
        ownerId: OWNER,
      });

      const result = await service.findOne('1', OWNER);

      expect(prisma.collection.findUnique).toHaveBeenCalledWith({
        where: { id: '1', ownerId: OWNER },
      });
      expect(result).toEqual({ id: '1', ownerId: OWNER });
    });

    it('throws NotFoundException when the collection does not exist', async () => {
      prisma.collection.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('missing', OWNER)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException (not Forbidden) when the collection belongs to a different owner', async () => {
      // The lookup itself is scoped by ownerId, so a record that exists but
      // belongs to someone else comes back `null` here -- identical to "the
      // id doesn't exist at all". There's no separate branch that could leak
      // which case it was.
      prisma.collection.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne('1', OTHER_OWNER)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.collection.findUnique).toHaveBeenCalledWith({
        where: { id: '1', ownerId: OTHER_OWNER },
      });
    });
  });

  describe('create', () => {
    it('always uses the ownerId argument, never anything from the DTO', async () => {
      prisma.collection.create.mockResolvedValueOnce({
        id: '1',
        name: 'Reading',
        ownerId: OWNER,
      });

      await service.create({ name: 'Reading' }, OWNER);

      expect(prisma.collection.create).toHaveBeenCalledWith({
        data: { name: 'Reading', ownerId: OWNER },
      });
    });
  });

  describe('update', () => {
    it('updates when the scoped where matches', async () => {
      prisma.collection.update.mockResolvedValueOnce({
        id: '1',
        name: 'New name',
        ownerId: OWNER,
      });

      const result = await service.update('1', OWNER, { name: 'New name' });

      expect(prisma.collection.update).toHaveBeenCalledWith({
        where: { id: '1', ownerId: OWNER },
        data: { name: 'New name' },
      });
      expect(result).toEqual({ id: '1', name: 'New name', ownerId: OWNER });
    });

    it('throws NotFoundException when the collection belongs to a different owner', async () => {
      // Real Prisma throws P2025 here because `where: { id, ownerId }`
      // matched zero rows -- it can't tell "wrong owner" from "no such id".
      prisma.collection.update.mockRejectedValueOnce(prismaKnownError('P2025'));

      await expect(
        service.update('1', OTHER_OWNER, { name: 'hijack attempt' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('re-throws unrelated errors instead of masking them as 404', async () => {
      prisma.collection.update.mockRejectedValueOnce(
        new Error('connection lost'),
      );

      await expect(
        service.update('1', OWNER, { name: 'x' }),
      ).rejects.toThrow('connection lost');
    });
  });

  describe('remove', () => {
    it('deletes when the scoped where matches', async () => {
      prisma.collection.delete.mockResolvedValueOnce({ id: '1' });

      await service.remove('1', OWNER);

      expect(prisma.collection.delete).toHaveBeenCalledWith({
        where: { id: '1', ownerId: OWNER },
      });
    });

    it('throws NotFoundException when the collection belongs to a different owner', async () => {
      prisma.collection.delete.mockRejectedValueOnce(prismaKnownError('P2025'));

      await expect(service.remove('1', OTHER_OWNER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBookmarks', () => {
    it('filters bookmarks by both collectionId and ownerId', async () => {
      prisma.collection.findUnique.mockResolvedValueOnce({
        id: '1',
        ownerId: OWNER,
      });
      prisma.bookmark.findMany.mockResolvedValueOnce([{ id: 'b1' }]);

      const result = await service.findBookmarks('1', OWNER);

      expect(prisma.bookmark.findMany).toHaveBeenCalledWith({
        where: { collectionId: '1', ownerId: OWNER },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([{ id: 'b1' }]);
    });

    it('throws NotFoundException and never queries bookmarks when the collection belongs to a different owner', async () => {
      prisma.collection.findUnique.mockResolvedValueOnce(null);

      await expect(service.findBookmarks('1', OTHER_OWNER)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.bookmark.findMany).not.toHaveBeenCalled();
    });
  });

  describe('createShareLink', () => {
    it('generates a high-entropy token and stores it scoped to the owner', async () => {
      prisma.collection.update.mockImplementationOnce(({ data }) =>
        Promise.resolve({ id: '1', ownerId: OWNER, ...data }),
      );

      const result = await service.createShareLink('1', OWNER);

      expect(prisma.collection.update).toHaveBeenCalledWith({
        where: { id: '1', ownerId: OWNER },
        data: { shareToken: expect.any(String) },
      });
      // 32 random bytes as base64url -- no padding, URL-safe alphabet only.
      expect(result.shareToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
    });

    it('throws NotFoundException when the collection belongs to a different owner', async () => {
      prisma.collection.update.mockRejectedValueOnce(prismaKnownError('P2025'));

      await expect(service.createShareLink('1', OTHER_OWNER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('revokeShareLink', () => {
    it('clears shareToken when the scoped where matches', async () => {
      prisma.collection.update.mockResolvedValueOnce({ id: '1', shareToken: null });

      await service.revokeShareLink('1', OWNER);

      expect(prisma.collection.update).toHaveBeenCalledWith({
        where: { id: '1', ownerId: OWNER },
        data: { shareToken: null },
      });
    });

    it('throws NotFoundException when the collection belongs to a different owner', async () => {
      prisma.collection.update.mockRejectedValueOnce(prismaKnownError('P2025'));

      await expect(service.revokeShareLink('1', OTHER_OWNER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSharedView', () => {
    it('returns the collection and its bookmarks scoped by collectionId, without ownerId or shareToken', async () => {
      prisma.collection.findUnique.mockResolvedValueOnce({
        id: '1',
        name: 'Reading list',
        ownerId: OWNER,
        shareToken: 'the-token',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
      });
      prisma.bookmark.findMany.mockResolvedValueOnce([
        {
          id: 'b1',
          url: 'https://example.com',
          title: 'Example',
          notes: null,
          ownerId: OWNER,
          collectionId: '1',
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
        },
      ]);

      const result = await service.getSharedView('the-token');

      expect(prisma.collection.findUnique).toHaveBeenCalledWith({
        where: { shareToken: 'the-token' },
      });
      expect(prisma.bookmark.findMany).toHaveBeenCalledWith({
        where: { collectionId: '1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        id: '1',
        name: 'Reading list',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
        bookmarks: [
          {
            id: 'b1',
            url: 'https://example.com',
            title: 'Example',
            notes: null,
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
          },
        ],
      });
      expect(result).not.toHaveProperty('ownerId');
      expect(result).not.toHaveProperty('shareToken');
      expect(result.bookmarks[0]).not.toHaveProperty('ownerId');
      expect(result.bookmarks[0]).not.toHaveProperty('collectionId');
    });

    it('throws NotFoundException for an unknown or revoked token', async () => {
      prisma.collection.findUnique.mockResolvedValueOnce(null);

      await expect(service.getSharedView('bad-token')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.bookmark.findMany).not.toHaveBeenCalled();
    });
  });
});
