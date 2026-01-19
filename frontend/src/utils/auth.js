// Decode JWT payload (no verification - server validates)
export const decodeToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
};

export const getRole = () => decodeToken()?.role || null;
export const getDepartment = () => decodeToken()?.department || null;
export const isAuthenticated = () => !!decodeToken();
