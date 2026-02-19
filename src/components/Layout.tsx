import { TopNavbar } from "@/components/TopNavbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <main className="w-full px-6 py-4 md:px-40">
        <Outlet />
      </main>
    </div>
  );
}
