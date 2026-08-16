import { Router, Response } from 'express';
import { db } from '../../shared/database';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { LanguageCode } from '@lingualink/types';

export const usersRouter: Router = Router();

// Get profile by ID
usersRouter.get('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Not Found', message: 'User not found' });
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  return res.json({ user: userWithoutPassword });
});

// Update user profile and language preferences
usersRouter.patch('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = db.users.get(userId);
  if (!user) return res.status(404).json({ error: 'Not Found', message: 'User not found' });

  const { displayName, nativeLanguage, preferredListeningLanguage, uiLanguage, profileImage } = req.body;

  if (displayName) user.displayName = displayName;
  if (profileImage !== undefined) user.profileImage = profileImage;
  if (nativeLanguage) user.nativeLanguage = nativeLanguage as LanguageCode;
  if (preferredListeningLanguage) user.preferredListeningLanguage = preferredListeningLanguage as LanguageCode;
  if (uiLanguage) user.uiLanguage = uiLanguage as LanguageCode;

  user.updatedAt = new Date().toISOString();
  db.users.set(userId, user);

  const { passwordHash: _, ...userWithoutPassword } = user;
  return res.json({
    message: 'Profile updated successfully',
    user: userWithoutPassword,
  });
});
