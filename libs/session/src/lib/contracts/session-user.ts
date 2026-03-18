export interface SessionUser {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  roles: string[];
}