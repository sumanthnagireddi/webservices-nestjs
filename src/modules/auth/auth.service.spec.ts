import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { RefreshToken } from './schemas/refresh-token-schema';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

jest.mock('bcrypt');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let refreshTokenModel: Model<RefreshToken>;

  const mockUser = {
    _id: '64f1a1c2a12b3c001a000001',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    name: 'Test User',
  };

  const mockUserService = {
    findOne: jest.fn(),
    findByID: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockRefreshTokenModel = {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: mockRefreshTokenModel,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    refreshTokenModel = module.get<Model<RefreshToken>>(
      getModelToken(RefreshToken.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      mockUserService.findByID.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-access-token');
      mockRefreshTokenModel.findOneAndUpdate.mockResolvedValue({});

      const result = await service.login(loginData);

      expect(userService.findOne).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password,
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken).toBe('jwt-access-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserService.findOne.mockResolvedValue(null);

      await expect(service.login(loginData)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginData)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUserService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginData)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginData)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('generateToken', () => {
    it('should generate access and refresh tokens', async () => {
      mockUserService.findByID.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new-access-token');
      mockRefreshTokenModel.findOneAndUpdate.mockResolvedValue({});

      const result = await service.generateToken(mockUser._id);

      expect(userService.findByID).toHaveBeenCalledWith(mockUser._id);
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: mockUser._id,
        email: mockUser.email,
      });
      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-uuid-1234');
    });

    it('should store refresh token in database', async () => {
      mockUserService.findByID.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('token');
      mockRefreshTokenModel.findOneAndUpdate.mockResolvedValue({});

      await service.generateToken(mockUser._id);

      expect(refreshTokenModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: mockUser._id },
        expect.objectContaining({
          userId: mockUser._id,
          refreshToken: 'mock-uuid-1234',
          expiresAt: expect.any(Date),
        }),
        { upsert: true, new: true },
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      const validRefreshToken = 'valid-refresh-token';
      const mockTokenDoc = {
        userId: mockUser._id,
        refreshToken: validRefreshToken,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      mockRefreshTokenModel.findOne.mockResolvedValue(mockTokenDoc);
      mockUserService.findByID.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new-jwt-token');
      mockRefreshTokenModel.findOneAndUpdate.mockResolvedValue({});

      const result = await service.refreshAccessToken(validRefreshToken);

      expect(refreshTokenModel.findOne).toHaveBeenCalledWith({
        refreshToken: validRefreshToken,
        expiresAt: { $gt: expect.any(Date) },
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const invalidRefreshToken = 'invalid-token';
      mockRefreshTokenModel.findOne.mockResolvedValue(null);

      await expect(
        service.refreshAccessToken(invalidRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.refreshAccessToken(invalidRefreshToken),
      ).rejects.toThrow('Invalid refresh token');
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const expiredToken = 'expired-token';
      mockRefreshTokenModel.findOne.mockResolvedValue(null);

      await expect(service.refreshAccessToken(expiredToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('storeRefreshToken', () => {
    it('should store refresh token with correct expiry', async () => {
      const userId = 'user123';
      const refreshToken = 'refresh-token-123';

      mockRefreshTokenModel.findOneAndUpdate.mockResolvedValue({});

      await service.storeRefreshToken(userId, refreshToken);

      expect(refreshTokenModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId },
        expect.objectContaining({
          userId,
          refreshToken,
          expiresAt: expect.any(Date),
        }),
        { upsert: true, new: true },
      );
    });

    it('should set expiry to 15 minutes', async () => {
      const userId = 'user123';
      const refreshToken = 'refresh-token-123';

      mockRefreshTokenModel.findOneAndUpdate.mockImplementation(
        (filter, update) => {
          const expiryTime = update.expiresAt.getTime() - Date.now();
          expect(expiryTime).toBeGreaterThan(14 * 60 * 1000);
          expect(expiryTime).toBeLessThan(16 * 60 * 1000);
          return Promise.resolve({});
        },
      );

      await service.storeRefreshToken(userId, refreshToken);
    });
  });

  describe('logout', () => {
    it('should delete refresh token on logout', async () => {
      const userId = 'user@example.com';
      mockRefreshTokenModel.findOneAndDelete.mockResolvedValue({
        deletedCount: 1,
      });

      const result = await service.logout(userId);

      expect(refreshTokenModel.findOneAndDelete).toHaveBeenCalledWith({
        userId,
      });
      expect(result).toBeDefined();
    });

    it('should handle logout for non-existent token', async () => {
      const userId = 'nonexistent@example.com';
      mockRefreshTokenModel.findOneAndDelete.mockResolvedValue(null);

      const result = await service.logout(userId);

      expect(refreshTokenModel.findOneAndDelete).toHaveBeenCalledWith({
        userId,
      });
      expect(result).toBeNull();
    });
  });
});
