import { User, Call, LanguageCode } from '@lingualink/types';

// In-memory data store for fallback or testing when DB is not connected
class MemoryDatabase {
  public users: Map<string, User & { passwordHash: string }> = new Map();
  public calls: Map<string, Call> = new Map();

  constructor() {
    this.seedDefaultUsers();
  }

  private seedDefaultUsers() {
    const defaultUserA: User & { passwordHash: string } = {
      id: 'usr_telugu_001',
      email: 'userA@lingualink.ai',
      displayName: 'Ramesh (Telugu Speaker)',
      passwordHash: '$2b$10$wT.g7jWjV/6x01H1s.G9ue/F99d8d.v7u9fE.Oq7gq6v7Z1h1s.G9', // hashed password "password123"
      nativeLanguage: 'te-IN',
      preferredListeningLanguage: 'te-IN',
      uiLanguage: 'te-IN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const defaultUserB: User & { passwordHash: string } = {
      id: 'usr_hindi_002',
      email: 'userB@lingualink.ai',
      displayName: 'Priya (Hindi Speaker)',
      passwordHash: '$2b$10$wT.g7jWjV/6x01H1s.G9ue/F99d8d.v7u9fE.Oq7gq6v7Z1h1s.G9', // hashed password "password123"
      nativeLanguage: 'hi-IN',
      preferredListeningLanguage: 'hi-IN',
      uiLanguage: 'hi-IN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(defaultUserA.id, defaultUserA);
    this.users.set(defaultUserB.id, defaultUserB);
  }
}

export const db = new MemoryDatabase();
