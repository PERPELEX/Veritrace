import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { AdminAddUserClient } from "@/components/dashboard/admin-add-user-client";

export default async function AdminAddUserPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  // Guard against non-admin
  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  return <AdminAddUserClient fullName={session.fullName} role={session.role} />;
}
