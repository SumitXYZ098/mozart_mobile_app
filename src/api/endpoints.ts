const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
export const ENDPOINTS = {

  // Login/Signup Endpoint
  REGISTER: `${BASE_URL}/api/auth/local/register`,
  LOGIN: `${BASE_URL}/api/auth/local`,
  GOOGLE_LOGIN: `${BASE_URL}/api/google-login`,
  FACEBOOK_LOGIN: `${BASE_URL}/api/facebook-login`,
  CHECK_EMAIL: (email: string) => `${BASE_URL}/api/email-exists?email=${email}`,
  EMAIL_VERIFICATION: `${BASE_URL}/api/email/send-verification`,
  EMAIL_STATUS: (email: string) =>
    `${BASE_URL}/api/email/check-status?email=${email}`,
  EMAIL_VERIFIED: `${BASE_URL}/api/email/verify`,

  // Forgot Password Endpoints
  SEND_OTP: `${BASE_URL}/api/auth/send-otp`,
  VERIFY_OTP: `${BASE_URL}/api/auth/verify-otp`,
  RESET_PASSWORD: `${BASE_URL}/api/auth/reset-password`,
  RESEND_OTP: `${BASE_URL}/api/auth/resend-otp`,

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
  UPLOAD_FILES: `${BASE_URL}/api/custom-upload`,
  UPLOAD_FILES_BY_ID: (uploadId: number) =>
    `${BASE_URL}/api/upload/files/${uploadId}`,

  // Add Labels
  ADD_LABELS: `${BASE_URL}/api/me/labels/ensure`,
  LABELS_LIST: `${BASE_URL}/api/me/labels`,

  // Support & Ticketing
  RAISE_TICKET: `${BASE_URL}/api/tickets`,
  MY_TICKETS: `${BASE_URL}/api/tickets/my`,
  TICKET_DETAILS: (ticketId: number) =>
    `${BASE_URL}/api/tickets/${ticketId}`,
  REPLY_TO_TICKET: (ticketId: number) =>
    `${BASE_URL}/api/tickets/${ticketId}/reply`,
  MARK_TICKET_MESSAGE_READ: (ticketId: number) =>
    `${BASE_URL}/api/ticket-raises/${ticketId}/mark-read`,
  TICKET_FEEDBACK: (ticketId: number) =>
    `${BASE_URL}/api/ticket-raises/${ticketId}/feedback`,

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
  BANK_DETAILS: `${BASE_URL}/api/user-payout-details`,
  BANK_DETAILS_BY_ID: (id: number) => `${BASE_URL}/api/user-payout-details/${id}`,
  BILLING_CARDS: `${BASE_URL}/api/billing-cards`,
  BILLING_CARD_BY_ID: (id: number) => `${BASE_URL}/api/billing-cards/${id}`,

  // Dashboard Counts
  DASHBOARD_COUNTS: `${BASE_URL}/api/admin/dashboardcounts`,

  // Payment
  CREATE_STRIPE_SESSION: `${BASE_URL}/api/subscription/create-session`,
  CANCEL_SUBSCRIPTION: `${BASE_URL}/cancel-subscription`,
  VERIFY_PAYMENT: `${BASE_URL}/verify-payment`,
  PRIORITY_PAYMENT: `${BASE_URL}/api/priority-payment`,
  VERIFY_PRIORITY_PAYMENT: `${BASE_URL}/api/priority-payment/verify`,
  UPGRADE_PLAN: `${BASE_URL}/api/subscription/create-upgrade-session`,
  ARTIST_ADDON: `${BASE_URL}/api/artist-addon`,
  MY_PAYMENT_LOGS: `${BASE_URL}/api/my-payment-logs`,
  NOTIFICATIONS: `${BASE_URL}/api/notifications`,
  Mark_notification_As_Read: (id: number | string) => `${BASE_URL}/api/notifications/${id}/read`,
  CHANGE_PASSWORD: `${BASE_URL}/api/change-password`,
  TOTAL_STREAMS: `${BASE_URL}/api/daily-trends/streams-overview`,
  TOTAL_STREAM_PER_PLATFORM: `${BASE_URL}/api/daily-trends/best-performing-stores`,
  BEST_PERFORMING_COUNTRIES: `${BASE_URL}/api/daily-trends/best-performing-countries`,
  GET_MY_CSV_LOGS: `${BASE_URL}/api/csv-report-logs/my-logs`,
  GENERATE_CSV_REPORT: `${BASE_URL}/api/royalty-report/export-csv`,
  DOWNLOAD_CSV_REPORT: (id: number | string) => `${BASE_URL}/api/csv-report/download/${id}`,
  ROYALTY_COUNTRY_STREAMS: `${BASE_URL}/api/user/best-streaming-countries`,
  ROYALTY_PLATFORM_STREAMS: `${BASE_URL}/api/user/best-streaming-platforms`,
  ROYALTY_TOTAL_STREAMS: `${BASE_URL}/api/user/total-streams`,

  // Wallet / Earnings
  TOTAL_EARNINGS: (range: "1M" | "3M" | "6M" = "1M") =>
    `${BASE_URL}/api/user/earnings-per-month?range=${range}`,
  AVAILABLE_WITHDRAW_BALANCE: `${BASE_URL}/api/payout-requests/my-balance`,
  PAYOUT_REQUESTS: `${BASE_URL}/api/payout-requests`,
  PAYOUT_REQUEST_BY_ID: (id: number | string) =>
    `${BASE_URL}/api/payout-requests/${id}`,
};
