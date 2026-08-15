import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('janaudit_token') || localStorage.getItem('janhisab_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth & 2-Tier Verification
export const signupUser = (data) => api.post('/auth/signup', data);
export const registerUser = (data) => api.post('/auth/signup', data);
export const verifyEmailOtp = (data) => api.post('/auth/verify-email', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getCurrentUser = () => api.get('/auth/me');
export const getMe = () => api.get('/auth/me');
export const verifyNagrikUpi = () => api.post('/auth/verify-nagrik-upi');
export const verifyUpiNagrik = () => api.post('/auth/verify-nagrik-upi');

// Super Admin & Verification Queue
export const getPendingVerifications = () => api.get('/admin/pending-verifications');
export const verifyUserApplication = (data) => api.post('/admin/verify-user', data);
export const getAdminUserList = (params) => api.get('/admin/users', { params });
export const updateUserRole = (userId, role) => api.post(`/admin/users/${userId}/role`, { role });
export const toggleUserLock = (userId) => api.post(`/admin/users/${userId}/toggle-lock`);
export const getAdminAuditLogs = () => api.get('/admin/audit-logs');

// Politicians & Master Registry CRUD
export const getPoliticians = (params) => api.get('/politicians', { params });
export const getPoliticianById = (id) => api.get(`/politicians/${id}`);
export const getPoliticiansTicker = () => api.get('/politicians/ticker');
export const submitRating = (data) => api.post('/politicians/rate', data);
export const submitRightOfReply = (id, data) => api.post(`/politicians/${id}/right-of-reply`, data);
export const setPoliticianAnthem = (id, trackId) => api.post(`/politicians/${id}/anthem`, { trackId });
export const createPolitician = (data) => api.post('/politicians', data);
export const updatePolitician = (id, data) => api.put(`/politicians/${id}`, data);
export const deletePolitician = (id) => api.delete(`/politicians/${id}`);

// Voice Wall & Civic Reports CRUD
export const getPosts = (params) => api.get('/posts', { params });
export const getPostById = (id) => api.get(`/posts/${id}`);
export const createPost = (data) => api.post('/posts', data);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const reactToPost = (id, reaction) => api.post(`/posts/${id}/react`, { reaction });
export const corroboratePost = (id) => api.post(`/posts/${id}/corroborate`);
export const boostPost = (id, points) => api.post(`/posts/${id}/boost`, { points });
export const votePoll = (id, optionIndex) => api.post(`/posts/${id}/poll-vote`, { optionIndex });
export const commentOnPost = (id, data) => api.post(`/posts/${id}/comment`, data);
export const submitRepresentativeReply = (id, data) => api.post(`/posts/${id}/representative-reply`, data);
export const uploadMedia = (formData) =>
  api.post('/posts/upload-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Promises & Wada Tracker CRUD
export const getPromises = (params) => api.get('/promises', { params });
export const getPromiseById = (id) => api.get(`/promises/${id}`);
export const createPromise = (data) => api.post('/promises', data);
export const updatePromise = (id, data) => api.put(`/promises/${id}`, data);
export const deletePromise = (id) => api.delete(`/promises/${id}`);
export const submitPromiseEvidence = (id, data) => api.post(`/promises/${id}/evidence`, data);

// RTI Factory
export const getRtiTemplates = () => api.get('/rti/templates');
export const generateRtiDraft = (data) => api.post('/rti/generate-draft', data);
export const getRtiVault = () => api.get('/rti/vault');
export const uploadRtiResponse = (data) => api.post('/rti/upload-response', data);
export const getRtiLeaderboard = () => api.get('/rti/leaderboard');

// Petitions CRUD
export const getPetitions = (params) => api.get('/petitions', { params });
export const getPetitionById = (id) => api.get(`/petitions/${id}`);
export const createPetition = (data) => api.post('/petitions', data);
export const updatePetition = (id, data) => api.put(`/petitions/${id}`, data);
export const deletePetition = (id) => api.delete(`/petitions/${id}`);
export const signPetition = (id, data) => api.post(`/petitions/${id}/sign`, data);

// Institutions
export const getInstitutions = (params) => api.get('/institutions', { params });
export const getInstitutionById = (id) => api.get(`/institutions/${id}`);
export const submitInstitutionFeedback = (id, data) => api.post(`/institutions/${id}/rate`, data);

// Constituency & Map
export const getMapIssues = (params) => api.get('/constituencies/issues', { params });
export const reportMapIssue = (data) => api.post('/constituencies/issues', data);
export const getConstituencyByPincode = (pincode) => api.get(`/constituencies/pincode/${pincode}`);
export const getHawaMeter = () => api.get('/constituencies/hawa-meter');

// Meme Studio
export const getMemeTemplates = () => api.get('/memes/templates');
export const getRoastCards = () => api.get('/memes/roast-cards');

// Protest Jukebox
export const getJukeboxTracks = (params) => api.get('/jukebox/tracks', { params });
export const voteJukeboxTrack = (id) => api.post(`/jukebox/tracks/${id}/upvote`);
export const upvoteJukeboxTrack = (id) => api.post(`/jukebox/tracks/${id}/upvote`);
export const uploadJukeboxTrack = (data) => api.post('/jukebox/upload-voice-masked', data);
export const uploadWhistleblowerAudio = (data) => api.post('/jukebox/upload-voice-masked', data);

// Gamification & Bounties
export const getBounties = () => api.get('/gamification/bounties');
export const createBounty = (data) => api.post('/gamification/bounties', data);
export const contributeBounty = (id, points) => api.post(`/gamification/bounties/${id}/contribute`, { points });
export const contributeToBounty = (id, data) => api.post(`/gamification/bounties/${id}/contribute`, data);
export const submitBountyProof = (id, data) => api.post(`/gamification/bounties/${id}/submit-proof`, data);
export const getGhotalaAwards = () => api.get('/gamification/ghotala-awards');
export const voteGhotalaAward = (nomineeId) => api.post('/gamification/ghotala-awards/vote', { nomineeId });

// Collectible Neta Cards
export const getNetaCards = () => api.get('/neta-cards');
export const getUserDeck = () => api.get('/neta-cards/my-deck');
export const getMyNetaDeck = () => api.get('/neta-cards/my-deck');
export const unlockNetaCard = (cardId) => api.post(`/neta-cards/${cardId}/collect`);
export const collectNetaCard = (code) => api.post(`/neta-cards/${code}/collect`);

// Moderation & Safe Harbor & Fact Checks
export const fileGrievance = (data) => api.post('/moderation/grievance', data);
export const trackGrievance = (trackingNumber) => api.get(`/moderation/grievance/${trackingNumber}`);
export const getGrievances = () => api.get('/moderation/grievances');
export const getJuryQueue = () => api.get('/moderation/community-jury/queue');
export const getCommunityJuryQueue = () => api.get('/moderation/community-jury/queue');
export const voteJuryQueue = (grievanceId, vote) => api.post('/moderation/community-jury/vote', { grievanceId, vote });
export const voteCommunityJury = (data) => api.post('/moderation/community-jury/vote', data);
export const getFactChecks = () => api.get('/moderation/fact-checks');
export const createFactCheck = (data) => api.post('/moderation/fact-checks', data);
export const upgradePostEvidence = (data) => api.post('/moderation/upgrade-evidence', data);

// Andolan Mode
export const getAndolanRooms = () => api.get('/andolan/rooms');
export const createAndolanRoom = (data) => api.post('/andolan/rooms', data);
export const getAndolanRoomByCode = (code) => api.get(`/andolan/rooms/${code}`);
export const getAndolanMessages = (roomId) => api.get(`/andolan/rooms/${roomId}/messages`);
export const sendAndolanMessage = (roomId, data) => api.post(`/andolan/rooms/${roomId}/messages`, data);

// AI Layer
export const summarizeIssue = (data) => api.post('/ai/summarize-issue', data);
export const checkSachBol = (data) => api.post('/ai/sach-bol-check', data);
export const checkNlpSpam = (data) => api.post('/ai/spam-check', data);

// Super Admin CMS
export const getCmsConfig = () => api.get('/cms/config');
export const updateCmsFormulaWeights = (weights) => api.put('/cms/weights', { weights });
export const updateCmsWeights = (data) => api.put('/cms/weights', data);
export const toggleCmsModule = (moduleKey, isEnabled) => api.put('/cms/modules', { moduleKey, isEnabled });
export const updateCmsModules = (data) => api.put('/cms/modules', data);
export const updateCmsAnnouncement = (data) => api.put('/cms/announcement', data);

export default api;
