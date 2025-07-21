import { UserRole } from "@/drizzle/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";

const client = await clerkClient();

export async function getCurrentUser() {
  const { sessionClaims, userId, redirectToSignIn } = await auth();

  return {
    clerkUserId: userId,
    userId: sessionClaims?.dbId,
    role: sessionClaims?.role,
    redirectToSignIn,
  };
}

export async function syncClerkUserMetadata({
  id,
  clerkUserId,
  role,
}: {
  id: string;
  clerkUserId: string;
  role: UserRole;
}) {
  return client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: {
      dbId: id,
      role,
    },
  });
}
