import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import e from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads/images',
    filename(req: e.Request, file: Express.Multer.File, callback: (error: (Error | null), filename: string) => void) {
      const name = file.originalname.split('.')[0];
      const extension = extname(file.originalname);
      return callback(null, `${name}-${crypto.randomUUID()}${extension}`);
    },
  }),
};
