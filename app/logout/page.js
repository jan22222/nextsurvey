"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../../store/authStore";

export default function LogoutPage() {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  useEffect(() => {
    async function handleLogout() {
      await logout();
      router.push("/signin");
    }
    handleLogout();
  }, [logout, router]);

  return <p>Logging out...</p>;
}
