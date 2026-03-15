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

import { Landing } from "./pages/Landing";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { DataProcessing } from "./pages/DataProcessing";
import { Compliance } from "./pages/Compliance";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
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
          {/* 🏠 PUBLIC ROOT - Landing Page (No Auth Required) */}
          <Route path="/" element={<Landing />} />

          {/* 📄 Public Legal Pages */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/data-processing" element={<DataProcessing />} />
          <Route path="/compliance" element={<Compliance />} />

          {/* 🔓 Public Auth Routes (redirect if authenticated) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} /> 
            <Route path="/register" element={<Register />} /> 
            <Route path="/verify/:context" element={<Verify />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<Reset />} />
          </Route>
          
          {/* 🔒 Protected Routes (require authentication) */}
          <Route element={<ProtectedRoute />}> 
            <Route path="/app" element={<Home />} /> 
          </Route>
          
          {/* 🔄 Fallback Route - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter> 
    </QueryClientProvider>
  );
}

export default App;