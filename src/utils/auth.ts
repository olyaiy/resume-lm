import { getAuthenticatedUser as getRequestAuthenticatedUser } from './actions';

// Cache the auth check using React cache()
export async function getAuthenticatedUser() {
  const user = await getRequestAuthenticatedUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
}

// Helper to get user ID with error handling
export const getUserId = async () => {
  const user = await getAuthenticatedUser();
  return user.id;
};
