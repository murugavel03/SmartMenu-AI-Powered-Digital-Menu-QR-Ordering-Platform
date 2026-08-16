import { auth } from './config';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/types';

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) redirect('/login');
  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireAuth();
  const role = session.user.role as UserRole;
  if (!roles.includes(role)) redirect('/');
  return session;
}

export async function getRestaurantId(session: Awaited<ReturnType<typeof requireAuth>>) {
  const role = session.user.role as UserRole;

  // Owner can have multiple restaurants - get first active one
  if (role === 'OWNER' || role === 'SUPER_ADMIN') {
    const restaurant = await db.restaurant.findFirst({
      where: { ownerId: session.user.id, isActive: true },
      select: { id: true },
    });
    return restaurant?.id;
  }

  // Staff - derive from staff profile (never trust client)
  const staff = await db.restaurantStaff.findUnique({
    where: { userId: session.user.id },
    select: { restaurantId: true, isActive: true },
  });

  if (!staff?.isActive) return undefined;
  return staff.restaurantId;
}

export async function requireRestaurantAccess() {
  const session = await requireAuth();
  const restaurantId = await getRestaurantId(session);
  if (!restaurantId) redirect('/admin/onboarding');
  return { session, restaurantId };
}
