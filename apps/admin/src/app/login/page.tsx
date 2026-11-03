import { redirect } from "next/navigation";
import { isAuthenticated } from "@/auth/guard";
import { LoginForm } from "./login-form";

export const metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  if (await isAuthenticated()) redirect("/");
  return (
    <main className="tech-grid grid min-h-dvh place-items-center p-6">
      <div className="cyber-clip neon-box w-full max-w-sm bg-[#05060b]/90 p-8 backdrop-blur">
        <p className="hud-label text-neon-2">Console · Accès restreint</p>
        <h1 className="mt-2 mb-8 font-display text-3xl font-bold tracking-wide neon-text">
          {"GHOM//ADMIN"}
        </h1>
        <LoginForm next={typeof next === "string" ? next : "/"} />
      </div>
    </main>
  );
}
