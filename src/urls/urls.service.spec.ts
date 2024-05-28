import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { Url } from '../schemas/url.schema';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';

describe('UrlsController', () => {
  let controller: UrlsController;
  let service: UrlsService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let model: Model<Url>;

  const mockUrlsService = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [
        UrlsService,
        { provide: getModelToken(Url.name), useValue: mockUrlsService },
      ],
    }).compile();

    controller = module.get<UrlsController>(UrlsController);
    service = module.get<UrlsService>(UrlsService);
    model = module.get<Model<Url>>(getModelToken(Url.name));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOriginalUrl', () => {
    it('should throw BadRequestException if urlId is not provided', async () => {
      await expect(service.getOriginalUrl('')).rejects.toThrowError(BadRequestException);
    });

    it('should return error URL if URL is expired', async () => {
      const expiredUrl = {
        urlId: '123',
        originalUrl: 'http://example.com',
        expiresIn: new Date(Date.now() - 1000),
      };
      mockUrlsService.findOne.mockResolvedValue(expiredUrl);

      const result = await service.getOriginalUrl('123');
      expect(result).toBe(`${process.env.FONTEND_URL}/link/error`);
    });

    it('should return error URL if max clicks are reached', async () => {
      const maxClickedUrl = {
        urlId: '123',
        originalUrl: 'http://example.com',
        maxClicks: 5,
        clicks: 5,
      };
      mockUrlsService.findOne.mockResolvedValue(maxClickedUrl);

      const result = await service.getOriginalUrl('123');
      expect(result).toBe(`${process.env.FONTEND_URL}/link/error`);
    });

    it('should return original URL and increment clicks if conditions are met', async () => {
      const validUrl = {
        urlId: '123',
        originalUrl: 'http://example.com',
        clicks: 0,
      };
      mockUrlsService.findOne.mockResolvedValue(validUrl);
      mockUrlsService.updateOne.mockResolvedValue({});

      const result = await service.getOriginalUrl('123');
      expect(result).toBe('http://example.com');
      expect(mockUrlsService.updateOne).toHaveBeenCalledWith(
        { urlId: '123' },
        { $inc: { clicks: 1 } },
      );
    });

    it('should throw BadRequestException if URL is not found', async () => {
      mockUrlsService.findOne.mockResolvedValue(null);

      await expect(service.getOriginalUrl('123')).rejects.toThrowError(BadRequestException);
    });
  });

  describe('isUrlExpiredOrMaxClicksReached', () => {
    it('should return true if URL is expired', () => {
      const expiredUrl: Url = {
        expiresIn: new Date(Date.now() - 1000).toISOString(),
        urlId: 'dsads',
        shortUrl: 'asdasdsad',
        originalUrl: 'dsadsadsa',
        maxClicks: 10,
        clicks: 1,
      };
      const result = service.isUrlExpiredOrMaxClicksReached(expiredUrl);
      expect(result).toBe(true);
    });

    it('should return true if max clicks are reached', () => {
      const maxClickedUrl = {
        urlId: 'dsads',
        shortUrl: 'asdasdsad',
        originalUrl: 'dsadsadsa',
        expiresIn: new Date(Date.now() + 1000).toISOString(),
        maxClicks: 5,
        clicks: 5,
      };
      const result = service.isUrlExpiredOrMaxClicksReached(maxClickedUrl);
      expect(result).toBe(true);
    });

    it('should return false if URL is not expired and max clicks not reached', () => {
      const validUrl: Url = {
        urlId: 'dsads',
        shortUrl: 'asdasdsad',
        originalUrl: 'dsadsadsa',
        expiresIn: new Date(Date.now() + 1000).toISOString(),
        maxClicks: 5,
        clicks: 4,
      };
      const result = service.isUrlExpiredOrMaxClicksReached(validUrl);
      expect(result).toBe(false);
    });
  });
});
