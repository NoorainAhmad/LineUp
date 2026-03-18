import { io, Socket } from "socket.io-client";
import { AuthService } from "../services/auth.service";

const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;
let refreshPromise: Promise<string | null> | null = null;

export const initSocket = (): Socket | null => {
  if (socket?.connected) {
    console.log("[Socket.IO] Already initialized and connected, returning existing connection");
    return socket;
  }

  // If socket exists but disconnected, try to reconnect
  if (socket && !socket.connected) {
    console.log("[Socket.IO] Socket exists but disconnected, attempting to reconnect");
    socket.connect();
    return socket;
  }

  const token = localStorage.getItem("access_token");

  if (!token) {
    console.warn("[Socket.IO] No auth token found. Cannot connect.");
    return null;
  }

  console.log("[Socket.IO] Attempting to connect with token");

  // Reset connection attempts on new socket instance
  connectionAttempts = 0;

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    timeout: 20000,
    autoConnect: true,
    withCredentials: true // Important for cookies
  });

  socket.on("connect", () => {
    console.log("[Socket.IO] ✅ Connected with ID:", socket?.id);
    // Reset connection attempts on successful connection
    connectionAttempts = 0;
  });

  socket.on("connect_error", async (error) => {
    console.error("[Socket.IO] ❌ Connection error:", error.message);
    connectionAttempts++;

    // Handle authentication errors
    if (error.message === "Authentication error" || 
        error.message.includes("auth") || 
        error.message.includes("token")) {
      
      console.warn("[Socket.IO] Authentication failed. Attempting to refresh token...");
      
      try {
        // Use AuthService.refresh() to get a new token
        const refreshResult = await refreshAuthToken();
        
        if (refreshResult && socket) {
          console.log("[Socket.IO] Token refreshed, updating auth and reconnecting");
          
          // Update the socket's auth token
          socket.auth = { token: refreshResult };
          
          // Disconnect and reconnect with new token
          socket.disconnect();
          socket.connect();
        } else {
          console.error("[Socket.IO] Failed to refresh token");
          
          // If we've exceeded max retry attempts, give up
          if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
            console.error("[Socket.IO] Max retry attempts reached. Stopping reconnection.");
            disconnectSocket();
            
            // Trigger a logout flow
            handleAuthenticationFailure();
          }
        }
      } catch (refreshError) {
        console.error("[Socket.IO] Error during token refresh:", refreshError);
        
        if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
          disconnectSocket();
          handleAuthenticationFailure();
        }
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket.IO] 🔌 Disconnected. Reason:", reason);
    
    if (reason === "io server disconnect") {
      console.warn("[Socket.IO] Server-initiated disconnect — checking auth status");
      
      // Check if token is still valid
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.warn("[Socket.IO] No token found after server disconnect");
        socket = null;
      } else {
        // Attempt to reconnect with existing token
        console.log("[Socket.IO] Attempting to reconnect with existing token");
        setTimeout(() => {
          socket?.connect();
        }, 1000);
      }
    }
    
    // Handle token expiration on disconnect
    if (reason === "transport close" || reason === "transport error") {
      console.warn("[Socket.IO] Transport error, checking token validity");
      validateTokenAndReconnect();
    }
  });

  socket.on("error", (error) => {
    console.error("[Socket.IO] Socket error:", error);
  });

  return socket;
};

// Helper function to refresh auth token using AuthService
const refreshAuthToken = async (): Promise<string | null> => {
  // Prevent multiple simultaneous refresh attempts
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      console.log("[Socket.IO] Attempting to refresh token via AuthService");
      
      // Use your existing AuthService.refresh() method
      const response = await AuthService.refresh();
      
      // Assuming the response contains the new accessToken
      // Adjust this based on your actual response structure
      const newToken = response.accessToken || response.access_token;
      
      if (newToken) {
        // Store the new token
        localStorage.setItem("access_token", newToken);
        console.log("[Socket.IO] Token refreshed successfully");
        return newToken;
      } else {
        console.error("[Socket.IO] No token in refresh response");
        return null;
      }
    } catch (error: any) {
      console.error("[Socket.IO] Token refresh failed:", error);
      
      // If refresh fails (e.g., refresh token expired), clear tokens
      localStorage.removeItem("access_token");
      
      // You might want to check if the error indicates the refresh token is invalid
      // and trigger a logout
      if (error.response?.status === 401) {
        handleAuthenticationFailure();
      }
      
      return null;
    } finally {
      // Clear the promise after completion
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Helper function to validate token and attempt reconnection
const validateTokenAndReconnect = async () => {
  const token = localStorage.getItem("access_token");
  
  if (!token) {
    console.warn("[Socket.IO] No token available for reconnection");
    return;
  }

  // Try to refresh the token proactively
  try {
    const newToken = await refreshAuthToken();
    
    if (newToken && socket) {
      console.log("[Socket.IO] Token refreshed, reconnecting");
      socket.auth = { token: newToken };
      socket.connect();
    } else {
      console.warn("[Socket.IO] Could not refresh token");
    }
  } catch (error) {
    console.error("[Socket.IO] Token refresh during validation failed:", error);
  }
};

// Helper function to handle authentication failure
const handleAuthenticationFailure = () => {
  console.error("[Socket.IO] Authentication failed completely. Logging out...");
  
  // Use AuthService to logout
  AuthService.logout().catch(() => {
    // Even if logout API fails, clear local state
    console.warn("[Socket.IO] Logout API failed, clearing local state");
  }).finally(() => {
    // Clear auth data
    localStorage.removeItem("access_token");
    
    // Trigger a global auth state change
    window.dispatchEvent(new CustomEvent("auth:logout"));
    
    // Redirect to login page (if in browser environment)
    if (typeof window !== "undefined") {
      // You might want to use your router here instead
      window.location.href = "/login";
    }
  });
};

export const getSocket = (): Socket | null => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  connectionAttempts = 0;
  refreshPromise = null;
};

// Optional: Add method to manually update token
export const updateSocketToken = async (newToken?: string) => {
  if (newToken) {
    // If a new token is provided directly, use it
    localStorage.setItem("access_token", newToken);
    
    if (socket) {
      socket.auth = { token: newToken };
      
      // If socket is connected, reconnect with new token
      if (socket.connected) {
        socket.disconnect();
        socket.connect();
      }
    }
  } else {
    // If no token provided, try to refresh
    const refreshedToken = await refreshAuthToken();
    if (refreshedToken && socket) {
      socket.auth = { token: refreshedToken };
      
      if (socket.connected) {
        socket.disconnect();
        socket.connect();
      }
    }
  }
};

// Optional: Add method to handle successful login
export const handleLoginSuccess = (token: string) => {
  localStorage.setItem("access_token", token);
  
  // If socket exists, update its token and reconnect
  if (socket) {
    socket.auth = { token };
    
    if (!socket.connected) {
      socket.connect();
    } else {
      // If connected, reconnect to ensure token is used
      socket.disconnect();
      socket.connect();
    }
  } else {
    // Initialize socket with new token
    initSocket();
  }
};