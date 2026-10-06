// src/services/api.ts
// export const API_URL = "http://127.0.0.1:8000";
export const API_URL = "https://intopilot.onrender.com";

// export const API_URL = "https://my-backend-mqrz.onrender.com";

export const getAuthToken = () => {
  return localStorage.getItem('intopilot_token');
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Login failed");
  }

  return response.json();
};

export const fetchDashboardData = async () => {
  const response = await fetch(`${API_URL}/api/dashboard/all-data`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAuthToken()}`
    }
  });
  if (!response.ok) throw new Error("Failed to fetch dashboard data");
  return response.json();
};

export const addClientAPI = async (clientData: any) => {
  const response = await fetch(`${API_URL}/api/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(clientData)
  });
  if (!response.ok) throw new Error("Failed to add client");
  return response.json();
};

export const recordPaymentAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/payments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getAuthToken()}`
    },
    body: formData
  });
  if (!response.ok) throw new Error("Failed to record payment");
  return response.json();
};

export const fetchSettingsData = async () => {
  const response = await fetch(`${API_URL}/api/settings/get-all`, { headers: { "Authorization": `Bearer ${getAuthToken()}` } });
  return response.json();
};

export const updateProfileAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/settings/update-profile`, { method: "POST", headers: { "Authorization": `Bearer ${getAuthToken()}` }, body: formData });
  return response.json();
};

export const addStaffAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/settings/add-staff`, { method: "POST", headers: { "Authorization": `Bearer ${getAuthToken()}` }, body: formData });
  return response.json();
};

export const updateAutomationAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/settings/update-automation`, { method: "POST", headers: { "Authorization": `Bearer ${getAuthToken()}` }, body: formData });
  return response.json();
};

export const fetchTemplatesAPI = async () => {
  const response = await fetch(`${API_URL}/api/settings/templates`, { headers: { "Authorization": `Bearer ${getAuthToken()}` } });
  return response.json();
};

export const updateTemplateAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/settings/update-template`, { method: "POST", headers: { "Authorization": `Bearer ${getAuthToken()}` }, body: formData });
  return response.json();
};

export const addPlaceholderAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/settings/add-placeholder`, { method: "POST", headers: { "Authorization": `Bearer ${getAuthToken()}` }, body: formData });
  return response.json();
};

export const addProjectAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/dashboard/add-project`, { method: "POST", headers: { "Authorization": `Bearer ${getAuthToken()}` }, body: formData });
  return response.json();
};

export const updateProjectAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/dashboard/update-project`, { method: "POST", headers: { "Authorization": `Bearer ${getAuthToken()}` }, body: formData });
  return response.json();
};

export const deleteProjectAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/dashboard/delete-project`, { method: "POST", headers: { "Authorization": `Bearer ${getAuthToken()}` }, body: formData });
  return response.json();
};

export const uploadLogoAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/settings/upload-logo`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${getAuthToken()}` },
    body: formData
  });
  if (!response.ok) throw new Error("Failed to upload logo");
  return response.json();
};

export const importExcelAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/dashboard/import-excel`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${getAuthToken()}` },
    body: formData
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Failed to import Excel");
  }
  return response.json();
};

export const updatePlotInfoAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/dashboard/update-plot-info`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${getAuthToken()}` },
    body: formData
  });
  if (!response.ok) throw new Error("Failed to update plot info");
  return response.json();
};

export const uploadPlotDocAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/dashboard/upload-plot-document`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${getAuthToken()}` },
    body: formData
  });
  if (!response.ok) throw new Error("Failed to upload document");
  return response.json();
};

export const deletePlotDocAPI = async (formData: FormData) => {
  const response = await fetch(`${API_URL}/api/dashboard/delete-plot-document`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${getAuthToken()}` },
    body: formData
  });
  if (!response.ok) throw new Error("Failed to delete document");
  return response.json();
};

export const updateCommissionInfoAPI = async (data: FormData) => {
  const res = await fetch(`${API_URL}/api/dashboard/update-commission-info`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${getAuthToken()}` },
    body: data
  });
  if (!res.ok) throw new Error("Failed to update commission info");
  return res.json();
};

export const updateKycInfoAPI = async (data: FormData) => {
  const res = await fetch(`${API_URL}/api/dashboard/update-kyc-info`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${getAuthToken()}` },
    body: data
  });
  if (!res.ok) throw new Error("Failed to update KYC");
  return res.json();
};

// 🔴 Naya Staff Assignment API Function
export const assignStaffAPI = async (data: FormData) => {
  const res = await fetch(`${API_URL}/api/dashboard/assign-staff`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${getAuthToken()}` },
    body: data
  });
  if (!res.ok) throw new Error("Failed to assign staff");
  return res.json();
};


// 🔴 Notes APIs (GET, POST, PUT)
export const fetchPlotNotesAPI = async (plotId: number) => {
  const response = await fetch(`${API_URL}/api/dashboard/notes/${plotId}`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${getAuthToken()}` }
  });
  if (!response.ok) throw new Error("Failed to fetch notes");
  return response.json();
};

export const addPlotNoteAPI = async (data: { plot_id: number; note_text: string }) => {
  const response = await fetch(`${API_URL}/api/dashboard/add-note`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Failed to add note");
  return response.json();
};

export const updatePlotNoteAPI = async (noteId: number, data: { note_text: string }) => {
  const response = await fetch(`${API_URL}/api/dashboard/update-note/${noteId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Failed to update note");
  return response.json();
};
