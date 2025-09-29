import { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHomepage from "@/screen/DashboardHomepage";
import PatientPage from "@/screen/PatientPage";
import Login from "@/screen/Login";
import DoctorManagement from "@/screen/DoctorManagement";
import UserManagement from "@/screen/UserManagement";
import HealthOverview from "@/screen/HealthOverview";
import DoctorPatientsPage from "@/screen/DoctorPatientsPage";
import DoctorMissisPillPage from "@/screen/DoctorMissisPillPage";
import DoctorMedicationsPage from "@/screen/DoctorMedicationsPage";

// Kiểm tra nếu người dùng đã đăng nhập
const isAuthenticated = () => {
  return !!localStorage.getItem("accessToken");
};

const getPrimaryRole = (): "ADMIN" | "DOCTOR" | "PATIENT" | null => {
  try {
    const rolesRaw = localStorage.getItem("roles");
    if (!rolesRaw) return null;
    const arr = JSON.parse(rolesRaw) as string[];
    const r = arr?.[0];
    if (r === "ADMIN" || r === "DOCTOR" || r === "PATIENT") return r;
    return null;
  } catch {
    return null;
  }
};

const roleToDefaultPath = (role: ReturnType<typeof getPrimaryRole>) => {
  if (role === "ADMIN") return "/dashboard";
  if (role === "DOCTOR") return "/dashboard/doctor-patients";
  if (role === "PATIENT") return "/dashboard/patients";
  return "/dashboard";
};

// Root route redirect dựa vào trạng thái đăng nhập + role
const RootRedirect = () => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const role = getPrimaryRole();
  return <Navigate to={roleToDefaultPath(role)} replace />;
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
        path: "doctor-patients",
        element: <DoctorPatientsPage />,
      },
      {
        path: "doctor-prescriptions",
        element: <DoctorMissisPillPage />,
      },
      {
        path: "doctor-medications",
        element: <DoctorMedicationsPage />,
      },
      {
        path: "health-overview",
        element: <HealthOverview />,
      },
    ],
  },
];

export default routes;
