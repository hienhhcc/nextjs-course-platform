import { syncClerkUserMetadata } from "@/app/services/clerk";
import { deleteUser, insertUser, updateUser } from "@/features/users/db/users";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const event = await verifyWebhook(req);

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const email = event.data.email_addresses.find(
          (e) => e.id === event.data.primary_email_address_id
        )?.email_address;

        const name = `${event.data.first_name} ${event.data.last_name}`.trim();

        const clerkUserId = event.data.id;
        if (email == null) {
          return new Response("No email", { status: 400 });
        }
        if (name == "") {
          return new Response("No name", { status: 400 });
        }

        if (event.type === "user.created") {
          const user = await insertUser({
            clerkUserId,
            email,
            name,
            role: "user",
            imageUrl: event.data.image_url,
          });

          await syncClerkUserMetadata(user);
        } else {
          await updateUser(
            { clerkUserId },
            {
              email,
              name,
              imageUrl: event.data.image_url,
              role: event.data.public_metadata.role,
            }
          );
        }
        break;
      }
      case "user.deleted": {
        if (event.data.id != null) {
          await deleteUser({ clerkUserId: event.data.id });
        }
        break;
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
