import { Router, Request, Response } from 'express';
import { SUPPORTED_LANGUAGES } from '@lingualink/config';

export const languagesRouter: Router = Router();

// Get list of supported languages and metadata
languagesRouter.get('/', (req: Request, res: Response) => {
  return res.json({
    languages: Object.values(SUPPORTED_LANGUAGES),
  });
});
