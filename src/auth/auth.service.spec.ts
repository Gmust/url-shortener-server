import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { MailingService } from '../mailing/mailing.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { Plan } from '../types/Plan';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const jwtServiceMock = {
  signAsync: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};

const usersServiceMock = {
  findUser: jest.fn(),
  createUser: jest.fn(),
};

const mailingServiceMock = {
  sendConfirmationLink: jest.fn(),
};

const subscriptionsServiceMock = {
  createNewSubscription: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: MailingService, useValue: mailingServiceMock },
        { provide: SubscriptionsService, useValue: subscriptionsServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should throw UnauthorizedException if user does not exist', async () => {
      usersServiceMock.findUser.mockResolvedValue(null);

      await expect(service.signIn({
        email: 'test@example.com',
        password: 'password',
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      usersServiceMock.findUser.mockResolvedValue({
        email: 'test@example.com',
        password: 'hashedPassword',
        isConfirmed: true,
      });

      await expect(service.signIn({
        email: 'test@example.com',
        password: 'wrongPassword',
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not confirmed', async () => {
      usersServiceMock.findUser.mockResolvedValue({
        email: 'test@example.com',
        password: 'hashedPassword',
        isConfirmed: false,
      });

      await expect(service.signIn({
        email: 'test@example.com',
        password: 'password',
      })).rejects.toThrow(UnauthorizedException);
    });

    it('should return user details and tokens if credentials are correct', async () => {
      const user = {
        _id: '1',
        email: 'test@example.com',
        password: '$2b$12$CzMf8TrqASE3n/pxIxjcVemm3GLR63w1N3hwrOaPxAooPb9DVA3OG',
        isConfirmed: true,
      };
      usersServiceMock.findUser.mockResolvedValue(user);
      jwtServiceMock.signAsync.mockResolvedValue('access_token');
      jwtServiceMock.signAsync.mockResolvedValue('refresh_token');

      const result = await service.signIn({ email: 'test@example.com', password: 'Password1@' });

      expect(result.user).toEqual({
        _id: '1',
        email: 'test@example.com',
        isConfirmed: true,
        password: '$2b$12$CzMf8TrqASE3n/pxIxjcVemm3GLR63w1N3hwrOaPxAooPb9DVA3OG',
      });
    });
  });

  describe('signUp', () => {
    it('should create a new user, send confirmation email, and return success message', async () => {
      const createUserDto = { name: 'John', surname: 'Doe', email: 'test@example.com', password: 'password' };
      const newUser = { ...createUserDto, _id: '1' };
      usersServiceMock.createUser.mockResolvedValue(newUser);
      const confirmationLink = 'http://example.com/confirm';
      mailingServiceMock.sendConfirmationLink.mockResolvedValue(true);

      const result = await service.signUp(createUserDto);

      expect(usersServiceMock.createUser).toHaveBeenCalledWith(createUserDto);
      expect(subscriptionsServiceMock.createNewSubscription).toHaveBeenCalledWith({
        plan: Plan.FREE,
        startDate: expect.any(String),
      });
      expect(mailingServiceMock.sendConfirmationLink).toHaveBeenCalledWith({
        email: 'test@example.com',
        link: expect.any(String),
        subject: 'Account confirmation',
        template: 'account-confirmation-template',
      });
      expect(result.message).toEqual('User successfully created! Confirmation link has been  sent to your email!');
    });

  });
});
