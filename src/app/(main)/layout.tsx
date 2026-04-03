import { AppShellLoader } from "@/components/layout/AppShellLoader";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellLoader>{children}</AppShellLoader>;
}
