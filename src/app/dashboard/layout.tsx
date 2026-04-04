import DashboardTransitionClient from "@/components/dashboard/transition-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardTransitionClient>
      {children}
    </DashboardTransitionClient>
  );
}
