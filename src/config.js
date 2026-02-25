// Set to true to use the server data/URL even in development (instead of localhost)
const useServerDataInDev = true;

// Detect environment
export const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isHttps = window.location.protocol === 'https:';

// Automatically force true on Production (HTTPS & not localhost), otherwise rely on useServerDataInDev
export const UseServerData = (isHttps && !isDev) ? true : useServerDataInDev;

// The backend URL to use
export const serverURL = UseServerData 
  ? (import.meta.env.VITE_API_URL || import.meta.env.VITE_GET_PLAN_DATA_URL || '') 
  : 'http://localhost:8000';

export const appConfig = {
  // Set to true to show the "一般體檢" (General Checkup) button, false to hide it
  showGeneralCheckup: false,
};
