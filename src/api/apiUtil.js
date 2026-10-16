const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_GENERATE_PDF_BASE_URL = process.env.REACT_APP_API_PDF_GENERATION_API;

export const getApiBaseUrl = () => {
	const currentHost = window.location.hostname; // e.g., workspacecompliance.jindalsteel.com
	const isLocal = currentHost.includes('localhost');
	const apiHost = isLocal ? 'localhost:7079' : currentHost.replace(/^workspacecompliance\./, 'workspacecomplianceapi.');
	return `https://${apiHost}/api`;
};

// Helper function to make API calls
export const apiCall = (endpoint, options = {}) => {	
	const url = `${getApiBaseUrl()}${endpoint}`;
	return fetch(url, {
		...options
	}).then((res) => res.json());
};

// Helper function to make API calls
export const apiCallForPdf = (endpoint, options = {}) => {
	const url = `${API_GENERATE_PDF_BASE_URL}${endpoint}`;
	return fetch(url, {
		...options,
	}).then((res) => res.json());
};