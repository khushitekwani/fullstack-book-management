"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleRedirect = (role) => {
    if (role === "user") {
      router.push("/signup");
    } else if (role === "admin") {
      router.push("/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl font-semibold mb-6">Welcome</h1>
        <div className="space-x-4">
          <button
            onClick={() => handleRedirect("user")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            User
          </button>
          <button
            onClick={() => handleRedirect("admin")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
}
