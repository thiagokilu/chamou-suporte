import { Suspense } from "react";
import { SideBarMenu } from "@/components/sidebar-menu";
import { DemoTourPrompt } from "@/components/demo-tour/demo-tour";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[var(--ch-bg)]">
      <Suspense
        fallback={<div className="hidden lg:block lg:w-[var(--sidebar-w)]" />}
      >
        <SideBarMenu />
      </Suspense>
      <DemoTourPrompt />
      <main className="min-w-0 flex-1 overflow-auto pt-14 lg:ml-[var(--sidebar-w)] lg:pt-0 flex flex-col">
        {children}
      </main>
    </div>
  );
}
