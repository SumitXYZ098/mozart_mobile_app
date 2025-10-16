const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const ENDPOINTS = {
  // Login/Signup Endpoint
  REGISTER: `${BASE_URL}/api/auth/local/register`,
  LOGIN: `${BASE_URL}/api/auth/local`,
  CHECK_EMAIL: (email: string) => `${BASE_URL}/api/email-exists?email=${email}`,
  EMAIL_VERIFICATION: `${BASE_URL}/api/email/send-verification`,
  EMAIL_STATUS: (email: string) =>
    `${BASE_URL}/api/email/check-status?email=${email}`,
  EMAIL_VERIFIED: `${BASE_URL}/api/email/verify`,

  // Draft Endpoint
  DRAFTS_STEP1: `${BASE_URL}/api/distribute-drafts/step1`,
  DRAFTS_STEP2: (draftId: number) =>
    `${BASE_URL}/api/distribute-drafts/${draftId}/step2`,
  DRAFTS_STEP3: (draftId: number) =>
    `${BASE_URL}/api/distribute-drafts/${draftId}/step3`,
  DRAFTS_STEP4: (draftId: number) =>
    `${BASE_URL}/api/distribute-drafts/${draftId}/step4`,
  DRAFTS_FINISH: (draftId: number) =>
    `${BASE_URL}/api/distribute-drafts/${draftId}/finish`,
  UPDATE_DRAFTS_BY_ID: (releaseId: number) =>
    `${BASE_URL}/api/distribute-drafts/${releaseId}`,
  DELETE_DRAFTS: (releaseId: number) =>
    `${BASE_URL}/api/distribute-drafts/${releaseId}`,
  UPDATE_DRAFTS: (draftId: number) =>
    `${BASE_URL}/api/distribute-drafts/${draftId}/step-1`,
  USER_DRAFTS_STARTED: (userId: string) =>
    `${BASE_URL}/api/distribute-drafts/user/${userId}/onlydraft`,
  DRAFT_BY_ID: (draftId: number) =>
    `${BASE_URL}/api/distribute-drafts/${draftId}?populate=*`,

  // Publish Endpoint
  DRAFT_TO_PUBLISH: (draftId: number) =>
    `${BASE_URL}/api/publish-distributes/draft/${draftId}`,
  USER_PUBLISH_TRACK: `${BASE_URL}/api/publish-distributes/my`,
  PUBLISH_LIST_BY_ID: (pubId: number) =>
    `${BASE_URL}/api/publish-distributes/${pubId}?populate=*`,
  GET_CALENDAR_EVENTS: `${BASE_URL}/api/publish-distributes/my-calendar`,
  PUBLISH_STANDARD: `${BASE_URL}/api/publish-distributes/Standard`,
  PUBLISH_PRIORITY: `${BASE_URL}/api/publish-distributes/priorities`,
  GET_PUBLISH_LIST: (search: string = "", priority: string = "") =>
    `${BASE_URL}/api/publish-distributes?q=${search}&priority=${priority}`,

  // Track Endpoint
  ADD_NEW_TRACK: `${BASE_URL}/api/distribute-tracks`,
  TRACK_LIST_BY_PUBLISHED: (pubId: number) =>
    `${BASE_URL}/api/distribute-tracks/by-published/${pubId}?populate=*`,
  TRACK_LIST: (draftId: number) =>
    `${BASE_URL}/api/distribute-tracks/by-draft/${draftId}`,
  GET_TRACK_BY_ID: (trackId: number) =>
    `${BASE_URL}/api/distribute-tracks/${trackId}?populate=*`,
  UPDATE_TRACK_BY_ID: (trackId: number) =>
    `${BASE_URL}/api/distribute-tracks/${trackId}`,
  DELETE_TRACK: (trackId: number) =>
    `${BASE_URL}/api/distribute-tracks/${trackId}`,

  // Upload files
  UPLOAD_FILES: `${BASE_URL}/api/upload`,
  UPLOAD_FILES_BY_ID: (uploadId: number) =>
    `${BASE_URL}/api/upload/files/${uploadId}`,

  // Add Labels
  ADD_LABELS: `${BASE_URL}/api/me/labels/ensure`,
  LABELS_LIST: `${BASE_URL}/api/me/labels`,

  // TicketRaised
  TICKET_RAISED: `${BASE_URL}/api/ticket-raises`,
  TICKET_RAISED_BY_ID: (ticketId: number) =>
    `${BASE_URL}/api/ticket-raises/${ticketId}`,

  // Get Artist Name List
  ARTIST_LIST: (search: string = "") =>
    `${BASE_URL}/api/artist-details/my?q=${search}`,
  ARTIST_BY_ID: (artistId: number) =>
    `${BASE_URL}/api/artist-details/${artistId}`,
  ADD_NEW_ARTIST: `${BASE_URL}/api/artist-details`,
  All_ARTIST: (search: string = "") =>
    `${BASE_URL}/api/artist-details?q=${search}`,

  //User
  UPDATE_PROFILE: `${BASE_URL}/api/users/me`,
  USER_LIST: `${BASE_URL}/api/users/clients`,
  USER_CLIENTS_BY_ID: (userId: string) =>
    `${BASE_URL}/api/users/clients/${userId}`,
  USER_DETAIL_BY_ID: (userId: string) => `${BASE_URL}/api/users/${userId}`,
  TRACK_COUNT_BY_USER: (userId: string) =>
    `${BASE_URL}/api/distribute-tracks/count/user/${userId}`,

  // Dashboard Counts
  DASHBOARD_COUNTS: `${BASE_URL}/api/admin/dashboardcounts`,
};
