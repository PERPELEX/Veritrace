import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/dashboard/profile-client";
import { getCurrentSession } from "@/lib/session";

export default async function ProfilePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  return <ProfileClient fullName={session.fullName} role={session.role} email={session.email} />;
}
