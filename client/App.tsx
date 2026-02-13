import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 

import { ProtectedRoute } from "./components/routes/PrivateRoute";
import { PublicRoute } from "./components/routes/PublicRoute";

import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { Verify } from "./pages/auth/Verify";
import { Forgot } from "./pages/auth/Forgot";
import { Reset } from "./pages/auth/Reset"; 
import { Home } from "./pages/home/Home";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (cache time)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} /> 
            <Route path="/register" element={<Register />} />
            <Route path="/register/:branchId" element={<Register />} />
            <Route path="/verify/:context" element={<Verify />} />
            <Route path="/forgot-password" element={<Forgot />} />
            <Route path="/reset-password" element={<Reset />} />
          </Route>
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}> 
            <Route path="/" element={<Home />} />
          </Route>
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter> 
    </QueryClientProvider>
  );
}

export default App;