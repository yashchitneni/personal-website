import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Loader2 } from "lucide-react";

export default async function Home() {
  const { userId } = auth();
  const user = userId ? await clerkClient.users.getUser(userId) : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center space-y-4">
        <UserButton afterSignOutUrl="/" />
        {user && <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>}
        <p className="text-xl">Coming Soon</p>
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </main>
  );
}