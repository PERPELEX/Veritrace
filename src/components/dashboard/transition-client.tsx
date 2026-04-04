"use client";

import { useEffect, useState } from "react";
import ColumnTransition from "@/components/auth/ColumnTransition";

export default function DashboardTransitionClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("dashboardTransitionPlayed");
    if (!hasPlayed) {
      setShowTransition(true);
    }
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem("dashboardTransitionPlayed", "true");
    setShowTransition(false);
  };

  return (
    <>
      {showTransition && <ColumnTransition onComplete={handleComplete} startCovered={true} />}
      {children}
    </>
  );
}
