# blogApi

Welcome to the **blogApi** project! A production-minded RESTful API for the `fullStackBlog` platform, built with **Node.js**, **NestJS**, **TypeScript**, and **MongoDB**. Authentication uses a short-lived **JWT access token** plus a long-lived **refresh token**, both delivered as **httpOnly cookies** so they are never reachable from client-side JavaScript.

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Bullseye.png" alt="Bullseye" width="25" height="25" /> Project Overview

blogApi enables clients to:

- **User Registration & Login:** Accounts are created with a unique username and email; passwords are hashed with **bcrypt** and never returned by any endpoint.
- **Cookie-Based Token Pair:** Login issues an access token (15 min) and a refresh token (7 days) as `httpOnly`, `SameSite` cookies.
- **Silent Token Refresh:** A dedicated refresh endpoint rotates the access token, so the client stays signed in without ever touching the token itself.
- **Profile Management:** Read and update the authenticated user's own profile, including a password change that is re-hashed on write.
- **Blog CRUD:** Create, list, view, update, and delete posts, each scoped to its author.
- **Comments:** Any visitor can read a post's comment thread; only the author can add a comment, and only their own comment can be deleted.
- **Validation by Default:** A global validation pipe with `whitelist` + `forbidNonWhitelisted` rejects unknown and malformed payloads out of the box.
- **No User Enumeration:** An unknown username and a wrong password return the identical `401`, so the API cannot be used to discover accounts.

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png" alt="Rocket" width="25" height="25" /> Features

- **NestJS Modular Architecture:** `auth`, `user`, `blog`, and `comment` modules with a clean controller / service / DTO / schema separation.
- **Dual Passport JWT Strategies:** `access` for protected routes and `refresh` for token rotation, so a refresh token can never be replayed as an access token.
- **Centralised Cookie Policy:** One service derives every attribute of the auth cookies, and logout clears them with the exact same options they were set with.
- **Mongoose ODM:** Typed schemas with `timestamps`, a virtual `commentCount`, and a `pre('save')` hook that hashes passwords on every write.
- **Ownership Enforcement:** Update and delete are refused with `403` when the caller is not the post's author.
- **Consistent Error Shapes:** Malformed ids are rejected with `400` by a dedicated pipe instead of surfacing as a `500`.
- **Security Headers:** `helmet` is applied globally, and CORS is locked to an explicit allow-list of frontend origins with credentials enabled.
- **Developer Experience:** Watch mode, ESLint (type-aware) with Prettier, and a Postman collection wired into `npm test`.

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Hammer%20and%20Wrench.png" alt="Hammer and Wrench" width="25" height="25" /> Technologies Used

- **Node.js** (Runtime Environment)
- **NestJS** (Progressive Web Framework)
- **Express.js** (HTTP Layer)
- **TypeScript** (Language)
- **MongoDB & Mongoose** (Database & ODM)
- **Passport + passport-jwt** (Authentication)
- **@nestjs/jwt** (Token Signing & Verification)
- **bcrypt** (Password Hashing)
- **cookie-parser** (Cookie Handling)
- **helmet** (Security Headers)
- **class-validator & class-transformer** (DTO Runtime Validation)
- **@nestjs/config** (Environment Configuration)
- **@nestjs/mapped-types** (DTO Inheritance)
- **Newman & Postman** (API Testing)
- **ESLint & Prettier** (Linting & Formatting)

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Desktop%20Computer.png" alt="Desktop Computer" width="25" height="25" /> Setup & Installation

To run the API locally, follow these steps:

```bash
# Clone the repository
git clone https://github.com/ozandmrcn/blogApi.git

# Navigate into the project folder
cd blogApi

# Install dependencies
npm install

# Create your .env file from the template
cp .env.example .env      # Windows: copy .env.example .env

# Start the development server (watch mode)
npm run start:dev   # API -> http://localhost:3000/api
```

> ⚠️ **Note:** A running **MongoDB** instance is required before starting the server. The default `MONGO_URI` in `.env.example` expects it on `mongodb://localhost:30000/nest`.
>
> 💡 **Tip:** The whole stack (API + client + database) can also be started with `docker compose up` from the [root repository](https://github.com/ozandmrcn/fullStackBlog).

### <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Gear.png" alt="Gear" width="25" height="25" /> Environment Variables (.env Setup)

Create a `.env` file in the project root. An annotated reference template:

```env
# Port the HTTP server binds to (Render injects its own PORT)
PORT=3000

# "development" | "production" | "test"
NODE_ENV=development

# MongoDB connection string (local instance or Atlas SRV)
MONGO_URI=mongodb://localhost:30000/nest

# Secrets used to sign tokens. These MUST differ from each other.
JWT_ACCESS_SECRET=super-secret-access
JWT_REFRESH_SECRET=super-secret-refresh

# Token lifetimes: 15m, 12h, 7d, or a plain number of seconds
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# The frontend origin(s) allowed to send credentialed requests. Comma-separated
# for multiple origins, e.g. http://localhost:5173,https://your-app.vercel.app
FRONTEND_URL=http://localhost:5173

# "lax" | "strict" | "none"  — see the note below
COOKIE_SAME_SITE=lax

# Marks cookies Secure. Implied by NODE_ENV=production or COOKIE_SAME_SITE=none
COOKIE_SECURE=false
```

> 💡 **SameSite cookies and a split deployment:** a browser only returns a `SameSite=Lax` cookie when the request is same-site. A Vercel frontend (`your-app.vercel.app`) calling a Render API (`your-api.onrender.com`) is **cross-site**, so set `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true` in that environment. `Secure` is forced automatically when `SameSite=None`, because browsers reject the combination otherwise.
>
> 💡 **Tip:** `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` should be long, unique, random strings in any real deployment.

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Clipboard.png" alt="Clipboard" width="25" height="25" /> API Endpoints

All routes are served under the `/api` prefix.

| Method | Endpoint                       | Guard       | Description                                                        |
| ------ | ------------------------------ | ----------- | ------------------------------------------------------------------ |
| GET    | `/api`                         | —           | Health check (`Hello World!`)                                      |
| POST   | `/api/auth/register`           | —           | Create an account (201) → returns the user, no token               |
| POST   | `/api/auth/login`              | —           | Log in → sets `access_token` and `refresh_token` cookies           |
| POST   | `/api/auth/refresh-token`      | `refresh`   | Rotate the access token using the refresh cookie (200)            |
| POST   | `/api/auth/logout`             | `access`    | Clear both auth cookies (200)                                      |
| GET    | `/api/user/me`                 | `access`    | Fetch the authenticated profile                                    |
| PATCH  | `/api/user/me`                 | `access`    | Update `username`, `email` or `password`                           |
| POST   | `/api/blog`                    | `access`    | Create a post (201)                                                |
| GET    | `/api/blog`                    | —           | Paginated feed → `{ total, page, limit, pages, blogs }`            |
| GET    | `/api/blog/own`                | `access`    | Paginated feed scoped to the authenticated author                 |
| GET    | `/api/blog/:id`                | —           | Fetch a single post, author and comment count embedded             |
| PATCH  | `/api/blog/:id`                | `access`    | Update a post (403 unless you are the author)                      |
| DELETE | `/api/blog/:id`                | `access`    | Delete a post (403 unless you are the author)                      |
| GET    | `/api/blog/:blogId/comments`   | —           | List a post's comments, newest first                              |
| POST   | `/api/blog/:blogId/comments`   | `access`    | Add a comment to a post (201)                                     |
| DELETE | `/api/blog/:blogId/comments/:commentId` | `access` | Delete your own comment (200)                           |

### <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Wastebasket.png" alt="Wastebasket" width="25" height="25" /> Error Responses

| Status | Meaning                                                                  |
| ------ | ------------------------------------------------------------------------ |
| `400`  | Validation failed, unknown property sent, or a malformed resource id      |
| `401`  | Missing, malformed, or expired token — or invalid login credentials       |
| `403`  | Authenticated, but not the owner of the resource                          |
| `404`  | The requested resource does not exist                                     |
| `409`  | The username or email is already taken                                    |

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Paperclip.png" alt="Paperclip" width="25" height="25" /> Testing with Postman

Import the **`Blog API.postman_collection.json`** file from the repository root and hit **Run Collection**. The collection follows the full happy path (register → login → profile → blog CRUD → comments → logout) and ships with per-request test assertions, dynamic variables, and re-runnable unique usernames, so every run is green on a fresh database. A dedicated **Validation & Error Handling** folder asserts the `400` / `401` / `403` paths, and a final **Session Is Closed** folder runs *after* Logout, when no cookie exists, to prove the guards really do reject anonymous callers.

The same collection runs from the command line once the server is up:

```bash
# Against http://localhost:3000 by default
npm test

# Against another host
newman run "Blog API.postman_collection.json" --env-var baseUrl=http://localhost:4000

# Same run with an HTML report
npm run test:html
```

A full green run is **42 requests / 117 assertions**. Every check is a real
request against the running server — the collection fires no sub-requests — so
the assertion count is exactly the number of checks that actually executed.

### Three Postman traps this collection works around

All three produce a *misleading* result, so they are worth knowing before
editing the test scripts:

1. **`pm.response.headers.get("Set-Cookie")` only returns one of the two
   `Set-Cookie` headers** that `res.cookie()` emits. Login sets `access_token`
   and `refresh_token` in one response, and `.get()` returns only the last one,
   so an assertion such as `expect(setCookie).to.include("access_token")` fails
   even though the cookie is present and correct. Read every header instead:

   ```js
   const setCookie = pm.response.headers.all()
       .filter((header) => header.key.toLowerCase() === "set-cookie")
       .map((header) => header.value)
       .join("\n");
   ```

2. **`pm.sendRequest` cannot test anonymity.** It attaches the signed-in cookie
   jar to the sub-request, so a request meant to be anonymous arrives
   authenticated and returns `200` instead of `401`. Sending an explicit
   `Cookie: ""` header does not help — the jar is still applied. This is why
   the anonymous checks are real requests placed after Logout rather than
   in-script sub-requests.

3. **A failing assertion inside a `pm.sendRequest` callback disappears
   silently.** With the `(done) => { ... done(); }` form, a thrown
   `pm.expect` skips the `done()` call, so Newman reports neither a pass nor a
   failure and the check vanishes from the summary. A green summary is therefore
   not proof that every sub-request check ran.

> Run the server with `npm run start:prod` (not `start:dev`) while testing with
> Newman. Watch mode rebuilds on *any* file change inside the project, so
> writing a report or log into the repository restarts the server mid-run and
> the remaining requests fail with `ECONNREFUSED`.

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Desktop%20Computer.png" alt="Desktop Computer" width="25" height="25" /> Deployment

A [`render.yaml`](./render.yaml) blueprint is included, so the service can be created straight from the repository. Set `MONGO_URI` to a **MongoDB Atlas** SRV string and `FRONTEND_URL` to the deployed client origin.

```bash
# Build the production image locally
docker build -t blog-api .

# Run it, supplying configuration at runtime
docker run -p 3000:3000 --env-file .env blog-api
```

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/E-Mail.png" alt="E-Mail" width="25" height="25" /> Contact

For any questions or feedback, feel free to contact:  
**Ozan Demircan** – [ozandmrcn47@gmail.com](mailto:ozandmrcn47@gmail.com)
