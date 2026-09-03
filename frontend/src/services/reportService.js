import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const reportService = {
  getReports: async () => {
    const response = await axios.get(`${API_URL}/reports`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  generateReport: async (reportType, fileFormat = 'PDF') => {
    const response = await axios.post(`${API_URL}/reports/generate`, {
      report_type: reportType,
      file_format: fileFormat
    }, { headers: getAuthHeaders() });
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await axios.delete(`${API_URL}/reports/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  downloadReport: async (id) => {
    const response = await axios.get(`${API_URL}/reports/${id}/download`, {
      headers: getAuthHeaders(),
      responseType: 'blob'
    });
    
    // Create a download link for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Attempt to extract filename from content-disposition header if available
    let filename = `report_${id}.pdf`;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export default reportService;
