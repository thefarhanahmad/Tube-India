# IndiaTube End-to-End Dynamic App Plan (Backend + Frontend)

## 1) Current Reality (Audit Summary)

### Frontend folder

- Frontend app is in `indiaTubeApp` (Expo React Native).
- Backend is in `backend` (Node/Express/MongoDB).

### Confirmed dummy/static data in frontend

- `indiaTubeApp/app/(tabs)/index.tsx`
  - Uses `SAMPLE_VIDEOS` and fallback to sample on API error/empty.
- `indiaTubeApp/app/(tabs)/subscriptions.tsx`
  - Uses hardcoded `CHANNELS`, `RECENT_VIDEOS`.
- `indiaTubeApp/app/(tabs)/shorts.tsx`
  - Uses hardcoded `SAMPLE_SHORTS` with sample URLs.
- `indiaTubeApp/app/(tabs)/library.tsx`
  - Uses hardcoded `HISTORY`, `MENU_ITEMS`, static playlist card.
- `indiaTubeApp/components/CategoryList.tsx`
  - Uses static categories array.
- `indiaTubeApp/components/AuthModal.tsx`
  - Google login is mocked (`console.log`) and fake success.

### Partially dynamic already

- `indiaTubeApp/app/video/[id].tsx`
  - Fetches video details and recommended videos from API.
  - Comments are fetched/posted via API.
  - Subscription toggle calls API.
  - Like action is local-only (no backend API yet).
- `indiaTubeApp/app/(tabs)/upload.tsx`
  - Upload flow posts multipart form to `/videos/upload`.

### Backend API status

Implemented routes:

- Auth: `POST /api/auth/google`, `GET /api/auth/me`
- Videos: `GET /api/videos`, `GET /api/videos/:id`, `POST /api/videos/upload`, `PUT /api/videos/:id`, `DELETE /api/videos/:id`
- Comments: `GET /api/comments/:videoId`, `POST /api/comments`, `DELETE /api/comments/:id`
- Subscriptions: `GET /api/subscriptions/me`, `POST /api/subscriptions/:channelId` (toggle)

Missing backend APIs needed for fully dynamic UI:

- Like/Unlike video endpoint.
- Watch history endpoints (get/add/clear).
- Library data endpoints (liked videos, user videos, watch later, playlists) OR a single aggregated library endpoint.
- Query/filter/sort/pagination for videos (home, categories, subscriptions, shorts).
- Channel-specific videos endpoint.
- Subscription status endpoint (or include status in video details for current user).
- Optional: Shorts-specific feed endpoint.

### Critical technical issues to fix before full dynamic behavior

- `backend/routes/*.js` import `../validators` but validators file/folder is missing in backend listing.
- Frontend API client does not attach auth token to protected API calls.
- Auth state is not persisted (app restart logs user out).
- `VideoCard` and other UI show hardcoded relative time text.
- `video/[id].tsx` checks `user?._id` while auth response provides `id`; inconsistent user id shape can break like/subscription state checks.

---

## 2) Target Architecture (What �fully dynamic� means)

### Data flow principles

- All list/detail screens fetch from backend (no sample fallback data in production path).
- Protected actions (upload/comment/subscribe/like/library actions) require JWT auth.
- API responses normalized in Redux slices.
- Loading, empty, and error states present per screen.
- Optimistic UI only where safe (like/subscribe), with rollback on API failure.

### Minimum backend-aligned dynamic scope by tab

- Home: dynamic video feed + category filtering + refresh + pagination.
- Shorts: dynamic short-form feed (can be filtered from videos with duration threshold).
- Upload: real upload with auth, validation, success refresh.
- Subscriptions: dynamic subscribed channels + recent uploads from subscribed channels.
- Library: dynamic history, liked videos, user uploads, watch later, playlists.
- Video Detail: dynamic video, comments, like/dislike (at least like), subscribe, recommended.

---

## 3) Execution Plan by Layer

## Phase A: Backend contract hardening (do first)

1. Fix validators module

- Create `backend/validators/index.js` and export:
  - `authValidationRules`, `videoValidationRules`, `commentValidationRules`, `validate`.
- Ensure all existing route imports resolve.

2. Add API versioned response consistency

- Standardize `{ success, data, message, meta }` shape across controllers.
- Add consistent error codes/messages for frontend handling.

3. Extend video listing endpoint

- Upgrade `GET /api/videos` to support query params:
  - `category`, `owner`, `visibility`, `q`, `sort`, `page`, `limit`, `type` (`short`|`regular`).
- Add pagination meta in response.

4. Add video like toggle endpoint

- `POST /api/videos/:id/like` (protected, toggle behavior) OR separate like/unlike endpoints.
- Return updated likes count and liked state for current user.

5. Add channel videos endpoint

- `GET /api/channels/:channelId/videos` (or `/api/users/:id/videos`).

6. Add watch history endpoints

- `POST /api/users/me/history/:videoId` add view entry.
- `GET /api/users/me/history` paginated.
- `DELETE /api/users/me/history` optional clear all.
- Also update `GET /api/videos/:id` to optionally record history when authenticated.

7. Add library endpoints (or one aggregate endpoint)

- Option A (recommended): `GET /api/library/me` returns
  - history, liked videos, user uploads, watch later, playlists summary.
- Option B: separate endpoints per section.

8. Subscriptions feed endpoint

- `GET /api/subscriptions/feed` returns recent videos from subscribed channels.

9. Optional but recommended

- Add `GET /api/subscriptions/status/:channelId` for quick UI state.
- Add indexes on `Video(createdAt, category, owner)` and `Comment(video, createdAt)`.

Acceptance for Phase A

- All required endpoints available and documented.
- No unresolved imports in routes.
- Postman collection tests pass for all new endpoints.

---

## Phase B: Frontend API and auth foundation

1. Central API client auth wiring

- In `indiaTubeApp/services/api.ts`:
  - Add request interceptor to attach `Authorization: Bearer <token>` from store/secure storage.
  - Add response interceptor for 401 handling (optional forced logout).

2. Auth service completion

- Implement real Google sign-in flow in `AuthModal` using Expo auth-session.
- Send profile payload to `POST /auth/google`.
- Save token and user in Redux + secure persistent storage.
- On app start, hydrate auth state and call `GET /auth/me` to verify token.

3. Redux modernization

- Replace manual action-only async patterns with `createAsyncThunk` for:
  - auth, video lists/details, comments, subscriptions, library.
- Add separate slices:
  - `subscriptionSlice`, `commentSlice`, `librarySlice`, optionally `shortsSlice`.

Acceptance for Phase B

- User can sign in, restart app, and still be logged in.
- Protected endpoints work from mobile app without manual token handling.

---

## Phase C: Screen-by-screen dynamic conversion

## 1. Home (`app/(tabs)/index.tsx`)

Tasks

- Remove `SAMPLE_VIDEOS` and sample fallbacks.
- Fetch videos from backend with query params.
- Drive categories dynamically:
  - either backend-provided categories endpoint or derive from video categories.
- Add pagination/infinite scroll.
- Show robust empty/error/retry UI.

API dependencies

- `GET /api/videos?category=&page=&limit=&sort=`

Done criteria

- Home feed always backend-driven.
- Pull-to-refresh + infinite load work.

## 2. Video Card (`components/VideoCard.tsx`)

Tasks

- Replace hardcoded �1 day ago� with computed relative time from `createdAt`.
- Add safe fallbacks for missing avatar/thumbnail.

Done criteria

- Metadata is fully dynamic per item.

## 3. Video Detail (`app/video/[id].tsx`)

Tasks

- Use backend liked/subscribed status for authenticated user.
- Implement real like action via like endpoint.
- Ensure subscribe button initial state loads from API.
- Record history on open/play (if authenticated).
- Keep recommended list from API (exclude current id).

API dependencies

- `GET /api/videos/:id`
- `POST /api/videos/:id/like`
- `POST /api/subscriptions/:channelId`
- history endpoint

Done criteria

- Like/subscribe/comment all persist and reflect after refresh.

## 4. Comments (`components/CommentList.tsx`)

Tasks

- Keep existing fetch/create; add delete for owner/admin when applicable.
- Add optimistic insert for new comment (optional).
- Display relative comment time from `createdAt`.

API dependencies

- existing comments endpoints.

Done criteria

- Comment CRUD (at least create/read/delete where authorized) functional.

## 5. Upload (`app/(tabs)/upload.tsx`)

Tasks

- Require authentication before upload.
- Replace default category `All` with valid categories list from backend.
- Add client-side file type/size validation.
- Show upload progress and disable duplicate submits.

API dependencies

- existing upload endpoint.

Done criteria

- Authenticated user can upload and new video appears in home/channel lists.

## 6. Subscriptions Tab (`app/(tabs)/subscriptions.tsx`)

Tasks

- Remove `CHANNELS` and `RECENT_VIDEOS` constants.
- Load subscribed channels from `/subscriptions/me`.
- Load recent uploads via `/subscriptions/feed` (or multi-fetch channels/videos).
- Handle unauthenticated state with CTA to sign in.

Done criteria

- Subscriptions tab fully data-driven for logged-in users.

## 7. Shorts Tab (`app/(tabs)/shorts.tsx`)

Tasks

- Remove `SAMPLE_SHORTS`.
- Fetch short-form videos using:
  - `GET /api/videos?type=short` OR `duration<=60` filter.
- Bind likes/comments counts from backend.
- Subscribe action wired to real subscription API.

Done criteria

- Infinite/paged vertical shorts feed driven by backend.

## 8. Library Tab (`app/(tabs)/library.tsx`)

Tasks

- Remove static `HISTORY` and static playlist count.
- Bind sections to backend library/watch history data.
- �Your videos� from current user uploads.
- �Liked videos� from user liked list.
- �Watch later� + playlists from backend (new models if missing).

Backend note

- Current backend has no Playlist routes despite model file existing; must implement endpoints.

Done criteria

- Library shows real per-user personalized data only.

---

## 4) Data Model and API Gaps to Implement

1. Playlist backend completion

- Implement CRUD routes/controllers for `Playlist` model.
- Support adding/removing videos.
- Private/public visibility.

2. User-centric endpoints

- `GET /api/users/me/videos`
- `GET /api/users/me/liked-videos`
- `GET /api/users/me/watch-later` (if model/field added)

3. Optional schema updates

- Add `isShort` boolean to `Video` OR infer from duration.
- Add watch-later array in `User` if feature required by UI.

---

## 5) Implementation Sequence (Recommended Order)

1. Backend validators fix + missing routes (blocker removal).
2. Backend new APIs: likes, feed, history, library basics.
3. Frontend auth/token persistence + interceptor.
4. Convert Home + Video Detail + Comments (core engagement flow).
5. Convert Upload with auth guard.
6. Convert Subscriptions + Shorts.
7. Convert Library + Playlists.
8. Polish error states, skeleton loaders, retry patterns.
9. E2E QA pass and bug fixes.

---

## 6) QA and Acceptance Matrix

### Functional acceptance checks

- Anonymous user:
  - can browse home/videos/comments.
  - blocked with auth prompt for like/comment/subscribe/upload/library-private data.
- Authenticated user:
  - login persists app restart.
  - can like/unlike, comment, subscribe/unsubscribe, upload.
  - sees personalized subscriptions feed and library data.
- Data consistency:
  - counts (views, likes, comments, subscribers) update after actions.
  - refresh returns persisted backend state.

### Regression checks

- No dummy arrays rendered in production path.
- No hardcoded fallback content on API error (show retry UI instead).
- All protected calls include Bearer token.

### Performance checks

- Paginated video lists.
- Avoid repeated full-feed refetches after minor actions.

---

## 7) Risks and Mitigations

- Risk: Backend validators missing causes runtime route failures.
  - Mitigation: Fix first before frontend work.
- Risk: Auth inconsistency (`id` vs `_id`) breaks ownership checks.
  - Mitigation: Normalize user id field in frontend store.
- Risk: Library scope large due to missing APIs/models.
  - Mitigation: deliver in increments (history + liked + uploads first, then playlists/watch later).
- Risk: Shorts/video schema mismatch.
  - Mitigation: define deterministic server-side filter rule.

---

## 8) Deliverables Checklist

- [ ] Backend validators module exists and routes compile.
- [ ] API docs (endpoint list + request/response examples).
- [ ] Frontend services cover all used endpoints.
- [ ] Auth flow real and persistent.
- [ ] Home/Video/Comments fully dynamic.
- [ ] Upload protected and functional.
- [ ] Subscriptions dynamic.
- [ ] Shorts dynamic.
- [ ] Library dynamic with playlists/history/liked/user videos.
- [ ] QA pass report with known issues (if any).

---

## 9) Suggested Work Breakdown (tickets)

- BE-01: Validators module + route stability fixes.
- BE-02: Video list query/pagination + like API.
- BE-03: Subscription feed + status API.
- BE-04: Watch history APIs.
- BE-05: Library aggregate + playlist CRUD.
- FE-01: API client auth interceptor + token persistence.
- FE-02: Real Google login integration in `AuthModal`.
- FE-03: Home dynamic conversion.
- FE-04: Video detail like/subscribe/state synchronization.
- FE-05: Comments enhancement + delete.
- FE-06: Upload auth guard + validation/progress.
- FE-07: Subscriptions tab dynamic conversion.
- FE-08: Shorts tab dynamic conversion.
- FE-09: Library tab dynamic conversion.
- QA-01: End-to-end test sweep and defect fixes.
