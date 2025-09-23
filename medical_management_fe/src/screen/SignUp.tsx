import React, { useState } from "react";
// import { useMutation } from "@tanstack/react-query";
// import { authApi } from "../api/auth/auth.api";
import { SignUpData } from "../api/auth/types";

export default function SignUp() {
  const [formData, setFormData] = useState<SignUpData>({
    fullName: "",
    phoneNumber: "",
    password: "",
  });

  // const signUpMutation = useMutation({
  //   mutationFn: authApi.signUp,
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   onSuccess: (data) => {
  //     // Store token
  //     // localStorage.setItem("token", data.token);
  //     // Redirect to home page
  //     window.location.href = "/";
  //   },
  //   onError: (error) => {
  //     // Handle error
  //     console.error("Signup failed:", error);
  //   },
  // });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // signUpMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <section className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md animate-fade-in">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center relative">
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-float"></div>
          <div
            className="absolute -bottom-5 -right-5 w-24 h-24 bg-blue-300 rounded-full opacity-20 animate-float"
            style={{ animationDelay: "0.5s" }}
          ></div>

          <h2 className="text-2xl font-bold text-white relative z-10">
            Create Account
          </h2>
          <p className="text-blue-100 mt-1 relative z-10">
            Sign up to get started
          </p>
        </div>

        <div className="p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="input-field bg-gray-50 border border-gray-300 rounded-lg transition-all duration-300">
              <label
                htmlFor="fullName"
                className="block text-xs text-gray-500 px-4 pt-3"
              >
                Full Name
              </label>
              <div className="flex items-center px-4 pb-2">
                <i className="fas fa-user text-gray-400 mr-2"></i>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full py-2 outline-none bg-transparent focus:outline-none focus:ring-0"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="input-field bg-gray-50 border border-gray-300 rounded-lg transition-all duration-300">
              <label
                htmlFor="phoneNumber"
                className="block text-xs text-gray-500 px-4 pt-3"
              >
                Phone Number
              </label>
              <div className="flex items-center px-4 pb-2">
                <i className="fas fa-phone text-gray-400 mr-2"></i>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full py-2 outline-none bg-transparent focus:outline-none focus:ring-0"
                  placeholder="0xxxxxxxxx"
                  required
                />
              </div>
            </div>

            <div className="input-field bg-gray-50 border border-gray-300 rounded-lg transition-all duration-300">
              <label
                htmlFor="password"
                className="block text-xs text-gray-500 px-4 pt-3"
              >
                Password
              </label>
              <div className="flex items-center px-4 pb-2">
                <i className="fas fa-lock text-gray-400 mr-2"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full py-2 outline-none bg-transparent focus:outline-none focus:ring-0"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="text-gray-400 hover:text-blue-500"
                >
                  <i className="fas fa-eye-slash"></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              // disabled={signUpMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* {signUpMutation.isPending
                ? "Creating Account..."
                : "Create Account"} */}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?
              <a
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
