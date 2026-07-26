import { Test } from '@nestjs/testing';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';

const OWNER = 'auth0|owner-a';

function reqWithOwner(ownerId: string): AuthenticatedRequest {
  return { user: { ownerId } } as AuthenticatedRequest;
}

describe('BookmarksController', () => {
  let controller: BookmarksController;
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    replace: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [BookmarksController],
      providers: [{ provide: BookmarksService, useValue: service }],
    }).compile();
    controller = module.get(BookmarksController);
  });

  it('findAll passes ownerId and the collectionId query param through', () => {
    controller.findAll({ collectionId: 'col-1' }, reqWithOwner(OWNER));
    expect(service.findAll).toHaveBeenCalledWith(OWNER, 'col-1');
  });

  it('findAll passes undefined collectionId through when not given', () => {
    controller.findAll({}, reqWithOwner(OWNER));
    expect(service.findAll).toHaveBeenCalledWith(OWNER, undefined);
  });

  it('findOne passes id and req.user.ownerId through', () => {
    controller.findOne('1', reqWithOwner(OWNER));
    expect(service.findOne).toHaveBeenCalledWith('1', OWNER);
  });

  it('create ignores any ownerId on the body and uses req.user.ownerId', () => {
    const dtoWithSpoofedOwnerId = {
      url: 'https://example.com',
      title: 'Example',
      ownerId: 'auth0|attacker',
    } as unknown as { url: string; title: string };

    controller.create(dtoWithSpoofedOwnerId, reqWithOwner(OWNER));

    expect(service.create).toHaveBeenCalledWith(dtoWithSpoofedOwnerId, OWNER);
  });

  it('replace (PUT) passes id, req.user.ownerId, and dto through', () => {
    const dto = { url: 'https://example.com', title: 'New title' };
    controller.replace('1', dto, reqWithOwner(OWNER));
    expect(service.replace).toHaveBeenCalledWith('1', OWNER, dto);
  });

  it('update (PATCH) passes id, req.user.ownerId, and dto through', () => {
    const dto = { title: 'Partial title' };
    controller.update('1', dto, reqWithOwner(OWNER));
    expect(service.update).toHaveBeenCalledWith('1', OWNER, dto);
  });

  it('remove passes id and req.user.ownerId through', async () => {
    await controller.remove('1', reqWithOwner(OWNER));
    expect(service.remove).toHaveBeenCalledWith('1', OWNER);
  });
});
