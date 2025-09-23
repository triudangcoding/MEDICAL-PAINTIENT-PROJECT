import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SignInData } from "../api/auth/types";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SignInData>({
    phoneNumber: "",
    password: "",
  });

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const [errors, setErrors] = useState<{
    phoneNumber?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      phoneNumber?: string;
      password?: string;
    } = {};

    const phoneRegex = /^0[0-9]{9}$/;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits and start with 0";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mock submit: set tokens and go to dashboard without API call

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const mockAccessToken = "mock-access-token";
      const mockRefreshToken = "mock-refresh-token";
      localStorage.setItem("accessToken", mockAccessToken);
      localStorage.setItem("refreshToken", mockRefreshToken);
      // optional roles for UI
      localStorage.setItem("roles", JSON.stringify(["ADMIN"]));
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Login successful! Redirecting...", {
        duration: 1000,
        position: "top-center",
        style: {
          background: "#10B981",
          color: "#fff",
        },
      });
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } else {
      toast.error("Please fix the errors in the form", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#fff",
        },
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
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
            Welcome Back
          </h2>
          <p className="text-blue-100 mt-1 relative z-10">
            Sign in to your account
          </p>
        </div>

        <div className="p-8">
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                  className={`w-full py-2 outline-none bg-transparent focus:outline-none focus:ring-0 ${errors.phoneNumber ? "border-red-500" : ""
                    }`}
                  placeholder="0xxxxxxxxx"
                  required
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs px-4 pb-2">
                  {errors.phoneNumber}
                </p>
              )}
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
                  className={`w-full py-2 outline-none bg-transparent focus:outline-none focus:ring-0 ${errors.password ? "border-red-500" : ""
                    }`}
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
              {errors.password && (
                <p className="text-red-500 text-xs px-4 pb-2">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
