const API_GENERATE_PDF_BASE_URL = process.env.REACT_APP_API_PDF_GENERATION_API;

// Demo mode: answers every API call from an in-browser mock (see mockApi.js),
// so the whole UI works without the backend. Enable with REACT_APP_DEMO_MODE=true.
export const isDemoMode = () => process.env.REACT_APP_DEMO_MODE === "true";

// Local sample backend (backend/server.js): set REACT_APP_LOCAL_API_URL, e.g. http://localhost:7079/api
export const getLocalApiUrl = () => (process.env.REACT_APP_LOCAL_API_URL || "").replace(/\/+$/, "");

// True when the app runs against sample data (demo mode or the local sample API) instead of the
// company HRMS/Google backend. In that case the login page shows quick-login buttons.
export const isSampleMode = () => isDemoMode() || getLocalApiUrl() !== "";

export const getApiBaseUrl = () => {
	if (getLocalApiUrl()) return getLocalApiUrl();
	const currentHost = window.location.hostname; // e.g., workspacecompliance.jindalsteel.com
	const isLocal = currentHost.includes('localhost');
	const apiHost = isLocal ? 'localhost:7079' : currentHost.replace(/^workspacecompliance\./, 'workspacecomplianceapi.');
	return `https://${apiHost}/api`;
};

// Helper function to make API calls
export const apiCall = (endpoint, options = {}) => {
	if (isDemoMode()) {
		// Loaded lazily so the mock code is a separate chunk and never runs outside demo mode.
		return import("./mockApi").then((m) => m.mockApiCall(endpoint, options));
	}
	const url = `${getApiBaseUrl()}${endpoint}`;
	return fetch(url, {
		...options
	}).then((res) => res.json());
};

// Helper function to make API calls
export const apiCallForPdf = (endpoint, options = {}) => {
	if (isDemoMode()) return Promise.resolve({});
	const url = `${API_GENERATE_PDF_BASE_URL}${endpoint}`;
	return fetch(url, {
		...options,
	}).then((res) => res.json());
};
