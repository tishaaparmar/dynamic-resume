// resume-app/frontend/src/services/resume.ts
import api from '../lib/api';

export const listResumes = async () => {
  const { data } = await api.get('/resumes');
  return data;
};

export const createResume = async (title: string, initialSnapshot: object) => {
  const { data } = await api.post('/resumes', {
    title,
    initialSnapshot,
    message: 'Initial commit',
  });
  return data;
};

export const getResume = async (id: string) => {
  const { data } = await api.get(`/resumes/${id}`);
  return data;
};

export const updateResume = async (id: string, snapshot: object, message: string, title?: string) => {
  const { data } = await api.put(`/resumes/${id}`, { snapshot, message, title });
  return data;
};

export const updateResumeTitle = async (id: string, title: string) => {
  const { data } = await api.patch(`/resumes/${id}/title`, { title });
  return data;
};

export const listVersions = async (id: string) => {
  const { data } = await api.get(`/resumes/${id}/versions`);
  return data;
};

export const getVersion = async (id: string, versionId: string) => {
  const { data } = await api.get(`/resumes/${id}/versions/${versionId}`);
  return data;
};

export const compareVersions = async (id: string, fromId: string, toId: string) => {
  const { data } = await api.post(`/resumes/${id}/versions/compare`, {
    from: fromId,
    to: toId,
  });
  return data;
};

export const deleteResume = async (id: string) => {
  const { data } = await api.delete(`/resumes/${id}`);
  return data;
};

export const exportResumePDF = async (id: string, viewMode: boolean = false) => {
  const response = await api.get(`/resumes/${id}/export/pdf`, {
    responseType: 'blob',
    params: { view: viewMode },
    // ✅ Ensure binary data is handled correctly
    headers: {
      'Accept': 'application/pdf',
    },
  });
  
  // ✅ Validate response is actually a blob
  if (!(response.data instanceof Blob)) {
    throw new Error('Response is not a valid PDF blob');
  }
  
  // ✅ Validate blob type
  if (response.data.type !== 'application/pdf' && response.data.type !== '') {
    console.warn('Unexpected blob type:', response.data.type);
  }
  
  // ✅ Validate blob size
  if (response.data.size === 0) {
    throw new Error('PDF blob is empty');
  }
  
  return response.data;
};

export const createShareLink = async (id: string) => {
  const { data } = await api.post(`/resumes/${id}/share`);
  return data;
};

export const duplicateResume = async (id: string) => {
  const { data } = await api.post(`/resumes/${id}/duplicate`);
  return data;
};
