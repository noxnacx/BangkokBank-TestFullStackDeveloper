import { Test } from '@nestjs/testing';
import { SharedController } from './shared.controller';
import { CollectionsService } from './collections.service';

describe('SharedController', () => {
  let controller: SharedController;
  const service = {
    getSharedView: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [SharedController],
      providers: [{ provide: CollectionsService, useValue: service }],
    }).compile();
    controller = module.get(SharedController);
  });

  it('passes the token through to the service', () => {
    controller.getShared('some-token');
    expect(service.getSharedView).toHaveBeenCalledWith('some-token');
  });

  it('exposes no update/delete methods at all -- read-only by construction', () => {
    const methodNames = Object.getOwnPropertyNames(SharedController.prototype);
    expect(methodNames).toEqual(['constructor', 'getShared']);
  });
});
