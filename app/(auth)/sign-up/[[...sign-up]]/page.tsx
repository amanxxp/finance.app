"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Send the signup request to the API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }); // Handle errors from the server
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to sign up");
      }

      // Extract token and user data from the response
      const { token, user } = await response.json();

      // Save the token to localStorage
      localStorage.setItem("finance-token", token);
      localStorage.setItem("finance-user_id", user.id);

      // Redirect the user to the dashboard page
      alert(`Welcome ${user.name}! Redirecting to dashboard...`);
      // router.push("/dashboard");
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
              <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? "Signing up..." : "Sign Up"}
                </button>
              </form>
              <p className="mt-4">
                Already have an account?{" "}
                <a href="/sign-in" className="text-blue-600 hover:underline">
                  Sign in
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
