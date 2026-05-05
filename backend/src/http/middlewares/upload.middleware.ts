import type { Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import * as resHelper from '../../utils/responseHttp';
import path from 'node:path';
import fs from 'node:fs';


const uploadDir = path.resolve(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const uploadConfig = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Formato de arquivo não suportado. Use JPG, PNG ou PDF.',
        ) as any,
      );
    }
  },
});

// Middleware wrapper para tratar erros do Multer
export const uploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const upload = uploadConfig.array('files');

  upload(req, res, (error) => {
    if (error instanceof MulterError) {
      switch (error.code) {
        case 'LIMIT_FILE_SIZE':
          return resHelper.clientError400(
            res,
            'O arquivo é muito grande. O limite é 5MB.',
          );
        case 'LIMIT_UNEXPECTED_FILE':
          return resHelper.clientError400(
            res,
            'Campo de arquivo inesperado. Use o campo "files".',
          );
        case 'MISSING_FIELD_NAME':
          return resHelper.clientError400(
            res,
            'O nome do campo de arquivo está faltando na requisição.',
          );
        default:
          console.error('Erro Multer:', error);
          return resHelper.clientError400(
            res,
            `Erro de upload: ${error.message}`,
          );
      }
    } else if (error) {
      return resHelper.clientError400(res, error.message);
    }

    next();
  });
};
