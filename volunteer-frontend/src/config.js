export const API_BASE = "http://localhost:8080";

export const healthCheck = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
};
