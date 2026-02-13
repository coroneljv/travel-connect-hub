import { TopNavbar } from "@/components/TopNavbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <main className="max-w-screen-2xl mx-auto w-full p-6 md:p-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
