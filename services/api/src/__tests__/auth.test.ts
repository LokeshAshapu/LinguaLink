import { SecurityService } from '../shared/security';
import { db } from '../shared/database';

describe('SecurityService & Auth Logic', () => {
  it('should hash and verify passwords correctly', () => {
    const password = 'mySecretPassword123!';
    const hash = SecurityService.hashPassword(password);
    expect(hash).toContain(':');

    const isValid = SecurityService.verifyPassword(password, hash);
    expect(isValid).toBe(true);

    const isInvalid = SecurityService.verifyPassword('wrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('should generate and verify JWT tokens accurately', () => {
    const payload = { userId: 'usr_test_123', email: 'test@lingualink.ai' };
    const token = SecurityService.generateToken(payload);
    expect(token).toBeDefined();

    const decoded = SecurityService.verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('should contain pre-seeded test users (Telugu UserA & Hindi UserB)', () => {
    const userA = db.users.get('usr_telugu_001');
    const userB = db.users.get('usr_hindi_002');

    expect(userA).toBeDefined();
    expect(userA?.nativeLanguage).toBe('te-IN');

    expect(userB).toBeDefined();
    expect(userB?.nativeLanguage).toBe('hi-IN');
  });
});
