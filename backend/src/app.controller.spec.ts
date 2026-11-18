import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SupabaseAuthGuard } from './auth/supabase-auth.guard.js';

describe('AppController', () => {
  let appController: AppController;

  const appServiceMock = {
    getHello: jest.fn<() => string>().mockReturnValue('Hello World!'),
  };

  const authGuardMock = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appServiceMock,
        },
      ],
    });

    const app: TestingModule = await moduleBuilder
      .overrideGuard(SupabaseAuthGuard)
      .useValue(authGuardMock)
      .compile();

    appController = app.get<AppController>(AppController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
      expect(appServiceMock.getHello).toHaveBeenCalledTimes(1);
    });
  });
});
