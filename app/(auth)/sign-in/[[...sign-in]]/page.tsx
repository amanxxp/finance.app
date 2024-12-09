"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong!");
      }

      // Extract token and user data from the response
      const { token, user } = await response.json();

      // Save token and user ID to localStorage
      localStorage.setItem("finance-token", token);
      localStorage.setItem("finance-user_id", user.id);
      localStorage.setItem("finance-username",user.name);

      // Redirect to the dashboard
      alert(`Welcome back ${user.name}! Redirecting to dashboard...`);
      router.push("/");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="h-full lg:flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 pt-16">
          <h1 className="font-bold text-3xl text-[#2E2A47]">Welcome back!</h1>
          <p className="text-base text-[#7E8CA0]">
            Log in or Create account to get back to your dashboard.
          </p>
        </div>
        <div className="flex items-center justify-center mt-8">
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="p-6 bg-white rounded shadow-md w-96">
              <h1 className="text-2xl font-bold mb-4 text-center">Sign In</h1>

              <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md w-full max-w-sm"
              >
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="mt-4">
                Don't have an account?{" "}
                <a href="/sign-up" className="text-blue-600 hover:underline">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="h-full bg-blue-600 hidden lg:flex flex-col gap-4 items-center justify-center">
        <Image src="/logo2.svg" height={100} width={100} alt={"logo"} />
        <p className="font-semibold text-white text-2xl ml-2.5">finance.io</p>
      </div>
    </div>
  );
}
