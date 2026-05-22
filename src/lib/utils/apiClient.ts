// src/lib/utils/apiClient.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // include cookies automatically
});

// Attach JWT from localStorage as fallback
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 globally — redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ── Typed API helpers ─────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) =>
    apiClient.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    apiClient.post("/auth/login", data),
  logout: () => apiClient.post("/auth/logout"),
  me: () => apiClient.get("/auth/me"),
};

export const roomsApi = {
  getAll: () => apiClient.get("/rooms"),
  getById: (id: string) => apiClient.get(`/rooms/${id}`),
  create: (data: { name: string; type: string }) => apiClient.post("/rooms", data),
  update: (id: string, data: { name?: string; type?: string }) => apiClient.put(`/rooms/${id}`, data),
  delete: (id: string) => apiClient.delete(`/rooms/${id}`),
};

export const devicesApi = {
  getAll: (roomId?: string) =>
    apiClient.get("/devices", { params: roomId ? { roomId } : undefined }),
  getById: (id: string) => apiClient.get(`/devices/${id}`),
  create: (data: { name: string; type: string; roomId: string; isOn?: boolean }) =>
    apiClient.post("/devices", data),
  update: (id: string, data: Partial<{ name: string; type: string; roomId: string; isOn: boolean }>) =>
    apiClient.put(`/devices/${id}`, data),
  delete: (id: string) => apiClient.delete(`/devices/${id}`),
  toggle: (id: string, isOn?: boolean) =>
    apiClient.patch(`/devices/${id}/toggle`, typeof isOn === "boolean" ? { isOn } : {}),
};

export const schedulesApi = {
  getAll: (deviceId?: string) =>
    apiClient.get("/schedules", { params: deviceId ? { deviceId } : undefined }),
  getById: (id: string) => apiClient.get(`/schedules/${id}`),
  create: (data: object) => apiClient.post("/schedules", data),
  update: (id: string, data: object) => apiClient.put(`/schedules/${id}`, data),
  delete: (id: string) => apiClient.delete(`/schedules/${id}`),
};

export const dashboardApi = {
  getStats: () => apiClient.get("/dashboard"),
};
