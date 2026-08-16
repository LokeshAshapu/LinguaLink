import { Router, Response } from 'express';
import { db } from '../../shared/database';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';

export const contactsRouter: Router = Router();

// List contacts / users directory
contactsRouter.get('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.userId;
  const search = (req.query.search as string || '').toLowerCase();

  const contacts = Array.from(db.users.values())
    .filter((user) => user.id !== currentUserId)
    .filter((user) => {
      if (!search) return true;
      return (
        user.displayName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    })
    .map(({ passwordHash, ...userWithoutPassword }) => userWithoutPassword);

  return res.json({ contacts });
});
