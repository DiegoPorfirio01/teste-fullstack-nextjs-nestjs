import { Test, TestingModule } from '@nestjs/testing';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

const mockUser = { userId: 'user-1', email: 'test@test.com', role: 'user' };

const mockPurchase = {
  id: 'purchase-1',
  userId: 'user-1',
  packageId: '10',
  credits: 10,
  amount: 9.9,
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('CreditsController', () => {
  let controller: CreditsController;
  let creditsService: jest.Mocked<CreditsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditsController],
      providers: [
        {
          provide: CreditsService,
          useValue: {
            buy: jest.fn(),
            list: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CreditsController>(CreditsController);
    creditsService = module.get(CreditsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buy', () => {
    it('should call creditsService.buy with userId and packageId', async () => {
      creditsService.buy.mockResolvedValue(mockPurchase);

      const result = await controller.buy(mockUser, { packageId: '10' });

      expect(result).toEqual(mockPurchase);
      expect(creditsService.buy).toHaveBeenCalledWith('user-1', '10');
    });
  });

  describe('list', () => {
    it('should return list of purchases for current user', async () => {
      creditsService.list.mockResolvedValue([mockPurchase]);

      const result = await controller.list(mockUser);

      expect(result).toEqual([mockPurchase]);
      expect(creditsService.list).toHaveBeenCalledWith('user-1');
    });
  });
});
