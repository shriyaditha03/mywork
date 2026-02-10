import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Existing Pages
import SplashScreen from "./pages/SplashScreen";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import RecordActivity from "./pages/RecordActivity";
import NotFound from "./pages/NotFound";
import PortalSelection from "./pages/PortalSelection";

// New Owner Pages
import OwnerSignup from "./pages/owner/OwnerSignup";
import OwnerLogin from "./pages/owner/OwnerLogin";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import CreateFarm from "./pages/owner/CreateFarm";
import AddUser from "./pages/owner/AddUser";
import ManageUsers from "./pages/owner/ManageUsers";
import OwnerProfile from "./pages/owner/OwnerProfile";
import MyFarms from "./pages/owner/MyFarms";

// New User Pages
import UserSignup from "./pages/user/UserSignup";
import UserLogin from "./pages/user/UserLogin";
import UserDashboard from "./pages/user/UserDashboard";
import UserProfile from "./pages/user/UserProfile";
import UserDailyReport from "./pages/user/UserDailyReport";

const queryClient = new QueryClient();

// Only allow authenticated users (Any role)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null; // Or a spinner
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Only allow Owners
const OwnerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user) return <Navigate to="/owner/login" replace />;
  if (user.role !== 'owner') return <Navigate to="/user/dashboard" replace />;

  return <>{children}</>;
};

// Only allow Users (Managers, Technicians, Workers)
const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user) return <Navigate to="/user/login" replace />;
  if (user.role === 'owner') return <Navigate to="/owner/dashboard" replace />;

  return <>{children}</>;
};

// Only allow Managers (and legacy admin)
const ManagerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'owner') return <Navigate to="/owner/dashboard" replace />;
  // Workers/Technicians go to user dashboard
  if (['worker', 'technician'].includes(user.role)) return <Navigate to="/user/dashboard" replace />;

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/welcome" element={<PortalSelection />} />

            {/* Legacy / Mixed Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ManagerRoute><Dashboard /></ManagerRoute>} />
            <Route path="/record-activity" element={<ManagerRoute><RecordActivity /></ManagerRoute>} />

            {/* OWNER PORTAL */}
            <Route path="/owner/signup" element={<OwnerSignup />} />
            <Route path="/owner/login" element={<OwnerLogin />} />
            <Route path="/owner/dashboard" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
            <Route path="/owner/create-farm" element={<OwnerRoute><CreateFarm /></OwnerRoute>} />
            <Route path="/owner/add-user" element={<OwnerRoute><AddUser /></OwnerRoute>} />
            <Route path="/owner/manage-users" element={<OwnerRoute><ManageUsers /></OwnerRoute>} />
            <Route path="/owner/profile" element={<OwnerRoute><OwnerProfile /></OwnerRoute>} />
            <Route path="/owner/farms" element={<OwnerRoute><MyFarms /></OwnerRoute>} />
            {/* Dynamic Activity Route for Owners */}
            <Route path="/owner/activity/:type" element={<OwnerRoute><RecordActivity /></OwnerRoute>} />

            {/* USER PORTAL */}
            <Route path="/user/signup" element={<UserSignup />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/dashboard" element={<UserRoute><UserDashboard /></UserRoute>} />
            <Route path="/user/profile" element={<UserRoute><UserProfile /></UserRoute>} />
            <Route path="/user/daily-report" element={<UserRoute><UserDailyReport /></UserRoute>} />
            {/* Dynamic Activity Route for Users */}
            <Route path="/user/activity/:type" element={<UserRoute><RecordActivity /></UserRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
