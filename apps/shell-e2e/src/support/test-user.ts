import authUserSeed from '../fixtures/auth-user.json';

interface AuthUserSeed {
  name: string;
  emailPrefix: string;
  emailDomain: string;
  phoneNumber: string;
  password: string;
}

export interface TestUser {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const userSeed = authUserSeed as AuthUserSeed;

export function buildTestUser(tag: string): TestUser {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    name: `${userSeed.name} ${uniqueId.slice(-4)}`,
    email: `${userSeed.emailPrefix}.${tag}.${uniqueId}@${userSeed.emailDomain}`.toLowerCase(),
    phoneNumber: userSeed.phoneNumber,
    password: userSeed.password,
    confirmPassword: userSeed.password,
  };
}