import { Test } from '@nestjs/testing';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

const OWNER = 'auth0|owner-a';

function reqWithOwner(ownerId: string): AuthenticatedRequest {
  return { user: { ownerId } } as AuthenticatedRequest;
}

describe('CollectionsController', () => {
  let controller: CollectionsController;
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBookmarks: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createShareLink: jest.fn(),
    revokeShareLink: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [CollectionsController],
      providers: [{ provide: CollectionsService, useValue: service }],
    }).compile();
    controller = module.get(CollectionsController);
  });

  it('findAll passes req.user.ownerId through', () => {
    controller.findAll(reqWithOwner(OWNER));
    expect(service.findAll).toHaveBeenCalledWith(OWNER);
  });

  it('findOne passes id and req.user.ownerId through', () => {
    controller.findOne('1', reqWithOwner(OWNER));
    expect(service.findOne).toHaveBeenCalledWith('1', OWNER);
  });

  it('findBookmarks passes id and req.user.ownerId through', () => {
    controller.findBookmarks('1', reqWithOwner(OWNER));
    expect(service.findBookmarks).toHaveBeenCalledWith('1', OWNER);
  });

  it('create ignores any ownerId on the body and uses req.user.ownerId', () => {
    const dtoWithSpoofedOwnerId = {
      name: 'Reading',
      ownerId: 'auth0|attacker',
    } as unknown as { name: string };

    controller.create(dtoWithSpoofedOwnerId, reqWithOwner(OWNER));

    expect(service.create).toHaveBeenCalledWith(dtoWithSpoofedOwnerId, OWNER);
    // The DTO class doesn't declare `ownerId`, and the global ValidationPipe
    // (whitelist: true) strips unknown fields before the controller ever
    // sees them -- this only proves the controller itself never reads it
    // off the body.
  });

  it('replace (PUT) passes id, req.user.ownerId, and dto through', () => {
    const dto = { name: 'New name' };
    controller.replace('1', dto, reqWithOwner(OWNER));
    expect(service.update).toHaveBeenCalledWith('1', OWNER, dto);
  });

  it('update (PATCH) passes id, req.user.ownerId, and dto through', () => {
    const dto = { name: 'Partial name' };
    controller.update('1', dto, reqWithOwner(OWNER));
    expect(service.update).toHaveBeenCalledWith('1', OWNER, dto);
  });

  it('remove passes id and req.user.ownerId through', async () => {
    await controller.remove('1', reqWithOwner(OWNER));
    expect(service.remove).toHaveBeenCalledWith('1', OWNER);
  });

  it('createShareLink passes id and req.user.ownerId through', () => {
    controller.createShareLink('1', reqWithOwner(OWNER));
    expect(service.createShareLink).toHaveBeenCalledWith('1', OWNER);
  });

  it('revokeShareLink passes id and req.user.ownerId through', async () => {
    await controller.revokeShareLink('1', reqWithOwner(OWNER));
    expect(service.revokeShareLink).toHaveBeenCalledWith('1', OWNER);
  });
});
