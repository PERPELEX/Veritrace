import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { AdminUsersClient } from "@/components/dashboard/admin-users-client";

export default async function AdminUsersPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  // Guard against non-admin
  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  return <AdminUsersClient fullName={session.fullName} role={session.role} />;
}
