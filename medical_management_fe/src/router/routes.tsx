import { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHomepage from "@/screen/DashboardHomepage";
import PatientPage from "@/screen/PatientPage";
import Login from "@/screen/Login";
import DoctorManagement from "@/screen/DoctorManagement";
import UserManagement from "@/screen/UserManagement";
import HealthOverview from "@/screen/HealthOverview";

// Kiểm tra nếu người dùng đã đăng nhập
const isAuthenticated = () => {
  return !!localStorage.getItem("accessToken");
};

// Root route redirect dựa vào trạng thái đăng nhập
const RootRedirect = () => {
  return isAuthenticated() ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardHomepage />,
      },
      {
        path: "doctor-management",
        element: <DoctorManagement />,
      },
      {
        path: "user-management",
        element: <UserManagement />,
      },
      {
        path: "patients",
        element: <PatientPage />,
      },
      {
        path: "health-overview",
        element: <HealthOverview />,
      },
      // Removed other routes for mock flow
    ],
  },
];

export default routes;
