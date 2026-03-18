import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

const mockWallet = {
  id: 'w-1',
  userId: 'user-1',
  balance: 100,
};

const mockUser = { userId: 'user-1', email: 'test@test.com', role: 'user' };

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: jest.Mocked<WalletService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    walletService = module.get(WalletService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return wallet for current user', async () => {
      walletService.get.mockResolvedValue(mockWallet);

      const result = await controller.get(mockUser);

      expect(result).toEqual(mockWallet);
      expect(walletService.get).toHaveBeenCalledWith('user-1');
    });
  });
});
