import { Router, Request, Response } from 'express';
import { db } from '../../shared/database';
import { SecurityService } from '../../shared/security';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { User, LanguageCode } from '@lingualink/types';

export const authRouter: Router = Router();

// Register new user
authRouter.post('/register', (req: Request, res: Response) => {
  const { email, password, displayName, nativeLanguage, preferredListeningLanguage, uiLanguage } = req.body;

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Validation Error', message: 'Email, password, and displayName are required' });
  }

  // Check if email already exists
  const existingUser = Array.from(db.users.values()).find((u) => u.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'Conflict', message: 'User with this email already exists' });
  }

  const userId = `usr_${Date.now()}`;
  const passwordHash = SecurityService.hashPassword(password);

  const newUser: User & { passwordHash: string } = {
    id: userId,
    email,
    passwordHash,
    displayName,
    nativeLanguage: (nativeLanguage as LanguageCode) || 'te-IN',
    preferredListeningLanguage: (preferredListeningLanguage as LanguageCode) || 'te-IN',
    uiLanguage: (uiLanguage as LanguageCode) || 'te-IN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.set(userId, newUser);

  const token = SecurityService.generateToken({ userId: newUser.id, email: newUser.email });

  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return res.status(201).json({
    user: userWithoutPassword,
    token,
  });
});

// Login existing user
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Validation Error', message: 'Email and password are required' });
  }

  const user = Array.from(db.users.values()).find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
  }

  const isValid = SecurityService.verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
  }

  const token = SecurityService.generateToken({ userId: user.id, email: user.email });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return res.json({
    user: userWithoutPassword,
    token,
  });
});

// Get current user profile
authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = db.users.get(userId);
  if (!user) return res.status(404).json({ error: 'Not Found', message: 'User not found' });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return res.json({ user: userWithoutPassword });
});
