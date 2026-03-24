
import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// Classroom APIs
export const classroomAPI = {
  getMyClassrooms: () => API.get('/classrooms/my-classrooms'),
  getClassroom: (id) => API.get(`/classrooms/${id}`),
  createClassroom: (data) => API.post('/classrooms', data),
  updateClassroom: (id, data) => API.put(`/classrooms/${id}`, data),
  deleteClassroom: (id) => API.delete(`/classrooms/${id}`),
  joinClassroom: (code) => API.post('/classrooms/join', { code }),
  getJoinRequests: (classroomId) => API.get(`/classrooms/${classroomId}/join-requests`),
  handleJoinRequest: (requestId, action) => API.put(`/classrooms/join-requests/${requestId}`, { action }),
  getStudents: (classroomId) => API.get(`/classrooms/${classroomId}/students`),
};

// Assignment APIs
export const assignmentAPI = {
  getAssignments: (classroomId) => API.get(`/assignments?classroom=${classroomId}`),
  getAssignment: (id) => API.get(`/assignments/${id}`),
  createAssignment: (data) => API.post('/assignments', data),
  updateAssignment: (id, data) => API.put(`/assignments/${id}`, data),
  deleteAssignment: (id) => API.delete(`/assignments/${id}`),
  submitAssignment: (id, formData) =>
    API.post(`/assignments/${id}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getSubmissions: (assignmentId) => API.get(`/assignments/${assignmentId}/submissions`),
  gradeSubmission: (submissionId, data) =>
    API.put(`/assignments/submissions/${submissionId}/grade`, data),
};

// Doubt APIs
export const doubtAPI = {
  getDoubts: (classroomId, filter = 'all') =>
    API.get(`/doubts?classroom=${classroomId}&filter=${filter}`),
  getDoubt: (id) => API.get(`/doubts/${id}`),
  createDoubt: (data) => API.post('/doubts', data),
  answerDoubt: (id, answer) => API.post(`/doubts/${id}/answer`, { answer }),
  resolveDoubt: (id) => API.put(`/doubts/${id}/resolve`),
  upvoteDoubt: (id) => API.put(`/doubts/${id}/upvote`),
  deleteDoubt: (id) => API.delete(`/doubts/${id}`),
  deleteAnswer: (answerId) => API.delete(`/doubts/answer/${answerId}`),
};

// Announcement APIs
export const announcementAPI = {
  getAnnouncements: (classroomId) =>
    API.get(`/announcements?classroom=${classroomId}`),
  createAnnouncement: (data) => API.post('/announcements', data),
  updateAnnouncement: (id, data) =>
    API.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) =>
    API.delete(`/announcements/${id}`),
};


// Question Papers API
export const questionPaperAPI = {
  getAll: (filters) => API.get('/question-papers', { params: filters }),
  download: (id) => API.get(`/question-papers/download/${id}`, { responseType: 'blob' }),
  getStats: () => API.get('/question-papers/stats'),
};

// File APIs
export const fileAPI = {
  uploadFile: (formData) =>
    API.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getClassroomFiles: (classroomId) => API.get(`/files/${classroomId}`),
  downloadFile: (fileId) =>
    API.get(`/files/download/${fileId}`, { responseType: 'blob' }),
  deleteFile: (fileId) => API.delete(`/files/${fileId}`),
};

export default API;

