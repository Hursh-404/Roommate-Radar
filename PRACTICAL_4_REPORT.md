# Practical Assignment No. 04 Report
**Course:** Web Technology Laboratory  
**Topic:** Server-Side Development: NodeJS & Server-Side Validation  
**Course Outcome (CO):** CO3 — Design, develop and deploy a web application to demonstrate server-side validation using NodeJS.  
**Project Title:** RoommateRadar — NodeJS Server-Side Validation & HTTP Pipeline  
**Student Name / Roll No:** Harshvardhan / MIT-AOE Web Technology Lab  
**Academic Year:** 2026  

---

## 1. Aim
To design, develop, test, and deploy a robust server-side web application using **NodeJS** that demonstrates client-independent server-side input validation, parses streaming HTTP GET and POST request bodies, handles status codes appropriately (200, 201, 400, 404, 500), enforces security sanitization, and provides an interactive web demonstration interface.

---

## 2. Problem Statement
Client-side validation (implemented in HTML5, JavaScript, or front-end frameworks like ReactJS) is useful for user feedback, but it provides **zero security protection**. Any malicious user or attacker can easily bypass client validation by:
1. Disabling JavaScript in browser developer settings.
2. Intercepting and modifying HTTP payloads using tools like Postman, cURL, Burp Suite, or browser DevTools.
3. Sending crafted malicious inputs directly to server endpoints.

Accepting unvalidated data on the server causes database corruption, injection attacks (XSS, SQL/NoSQL injection), negative financial amounts, and application crashes. **Server-side validation is the indispensable, authoritative line of defense.**

**RoommateRadar (Practical 4)** demonstrates a pure NodeJS backend that:
- Inspects and sanitizes all incoming payloads on the server.
- Enforces strict data types, regular expressions, length bounds, and whitelist checks.
- Returns structured HTTP 400 Bad Request error dictionaries when validation fails.
- Commits clean, sanitized records and issues HTTP 201 Created on success.

---

## 3. NodeJS Concepts & Modules Used
- **`http` Module:** Core NodeJS built-in module used to instantiate an HTTP server (`http.createServer()`), handle streaming socket connections, parse headers, and dispatch HTTP responses.
- **`url` & `querystring`:** Used for parsing URL pathnames and query parameters (`?query=...&area=...`) on GET requests.
- **`fs` & `path` Modules:** File system interaction for static asset serving and preventing directory traversal security vulnerabilities.
- **NodeJS Stream Handling:** Reading incoming POST request bodies via streaming event listeners (`req.on('data')` and `req.on('end')`) with payload size boundaries (1 MB cap).
- **CommonJS Modularization (`require` / `module.exports`):**
  - `server.js`: HTTP routing, static file dispatching, and REST request/response lifecycle.
  - `validator.js`: Standalone validation and XSS sanitization engine.
  - `dataStore.js`: In-memory data store with audit logging.
  - `test.js`: Automated 10-point test runner.
- **Zero External Dependencies:** Built entirely with NodeJS standard libraries, eliminating `npm install` complexity and vulnerabilities.

---

## 4. System Architecture & Request Pipeline

```
Client (Browser / Postman / cURL)
│
├── 1. Sends HTTP Request (GET or POST /api/roommates)
│
▼
NodeJS HTTP Server (`http.createServer()`)
│
├── 2. CORS Preflight & Header Dispatcher (OPTIONS check)
│
├── 3. Body Stream Accumulator (req.on('data') with 1MB size limit)
│
├── 4. JSON Syntax Parser (Safe JSON.parse with syntax exception guard)
│
├── 5. Sanitizer Engine (`sanitizeString()` strips <, >, &, ", ')
│
▼
Server Validator Module (`validator.js`)
│
├── Evaluates 8 Server Rules (Name, Email, Role, Area, Budget, Sleep, Clean, Bio)
│
├── [IF INVALID] ──> Responds with HTTP 400 Bad Request
│                    { success: false, statusCode: 400, errors: { ... } }
│
└── [IF VALID]   ──> Commits to DataStore (`dataStore.add()`)
                     Responds with HTTP 201 Created
                     { success: true, statusCode: 201, data: newRecord }
```

---

## 5. Server-Side Validation Rules Specification Table

Every field submitted to `POST /api/roommates` is validated strictly by the server:

| Field Name | Data Type | Server Validation Rule | Rejection Criteria | HTTP Error Message |
| :--- | :--- | :--- | :--- | :--- |
| **Full Name** | String | 3 to 50 characters, letters, spaces, and periods only. | Empty, `< 3` chars, `> 50` chars, contains digits/symbols. | `"Full name is required on server."` / `"Full name must be at least 3 characters long."` / `"Full name can only contain alphabetic letters..."` |
| **Email** | String | RFC 5322 standard email regex pattern. | Missing `@`, no domain, spaces, malformed syntax. | `"College email address is required."` / `"Invalid email syntax (e.g. student@college.edu)..."` |
| **Course / Branch** | String | 2 to 60 characters. | Empty or `< 2` characters. | `"Department and academic course is required."` / `"Course description must be at least 2 characters."` |
| **Preferred Area** | String | Whitelist enum match: `Shivajinagar`, `Pimpri`, `Wakad`, `Baner`, `Hinjewadi`, `Aundh`, `Kothrud`, `Viman Nagar`. | Any locality outside the authorized Pune whitelist. | `"Area must be one of: Shivajinagar, Pimpri, Wakad, Baner..."` |
| **Monthly Budget** | Integer | Valid integer between ₹2,000 and ₹35,000. | Non-numeric, decimal/float, `< 2000`, or `> 35000`. | `"Monthly budget must be a valid numeric figure."` / `"Monthly budget must be between ₹2,000 and ₹35,000."` |
| **Sleep Schedule** | String | Validated enum string. | Unselected or invalid routine option. | `"Sleep routine selection is required."` / `"Invalid sleep schedule option selected."` |
| **Cleanliness** | String | Enum: `Spotless`, `High`, `Moderate`, `Relaxed`. | Unknown cleanliness string. | `"Cleanliness must be Spotless, High, Moderate, or Relaxed."` |
| **Lifestyle Bio** | String | Minimum 15 characters, maximum 300 characters. | Empty, `< 15` chars, or `> 300` chars. | `"Bio must be at least 15 characters long (currently X chars)."` |

---

## 6. HTTP API Endpoints & Status Codes

| Method | Endpoint | Description | Success Status | Error Status |
| :--- | :--- | :--- | :---: | :---: |
| **GET** | `/` | Serves client web application (`public/index.html`) | `200 OK` | `404 Not Found` |
| **GET** | `/api/health` | Returns NodeJS server health, version, and uptime | `200 OK` | `500 Server Error` |
| **GET** | `/api/roommates` | Fetches roommate list with `?query=` & `?area=` filtering | `200 OK` | `500 Server Error` |
| **POST** | `/api/roommates` | Validates payload, stores record, logs audit event | `201 Created` | `400 Bad Request` |
| **POST** | `/api/validate-only` | Dry-run validation test without database persistence | `200 OK` | `400 Bad Request` |
| **GET** | `/api/logs` | Fetches live server validation audit trail | `200 OK` | `500 Server Error` |
| **POST** | `/api/reset` | Resets in-memory database to clean initial seed data | `200 OK` | `500 Server Error` |

---

## 7. Testing & Verification Matrix (10/10 Test Cases)

The application includes an automated test runner ([`test.js`](file:///C:/Users/Dell/Desktop/Final_Projects/RoommateRadar/Practical%204/test.js)) executing 10 unit test cases:

| Test Case | Scenario Description | Tested Payload | Expected Result | Actual Result | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Valid Registration | Complete valid student data | Server returns `isValid: true`, zero errors | Passed | **PASS** |
| **TC-02** | Missing Full Name | `name: ""` | Server rejects with name error | Caught & Rejected | **PASS** |
| **TC-03** | Illegal Characters in Name | `name: "Rahul123!"` | Rejection: non-alphabetic characters | Caught & Rejected | **PASS** |
| **TC-04** | Malformed Email | `email: "studentmitaoe.ac.in"` | RFC regex fails, error dispatched | Caught & Rejected | **PASS** |
| **TC-05** | Below Min Budget | `budget: 1500` (below ₹2000) | Rejected: below ₹2000 minimum | Caught & Rejected | **PASS** |
| **TC-06** | Above Max Budget | `budget: 45000` (above ₹35000) | Rejected: above ₹35000 maximum | Caught & Rejected | **PASS** |
| **TC-07** | Invalid Neighborhood | `area: "Mumbai Central"` | Rejected: not in Pune whitelist | Caught & Rejected | **PASS** |
| **TC-08** | Short Bio String | `bio: "Too short"` (9 chars) | Rejected: under 15 characters | Caught & Rejected | **PASS** |
| **TC-09** | XSS Script Tag Defense | `bio: "<script>bad()</script>"` | Tags escaped to `&lt;script&gt;` | Sanitized Safely | **PASS** |
| **TC-10** | Null / Corrupt Payload | `data = null` | Handled gracefully without crash | Handled Cleanly | **PASS** |

**Summary: 10 / 10 Test Cases Passed (100% Success Rate)**

---

## 8. Deployment & Execution Instructions

### A. One-Click Launch (Recommended for Viva Demonstration)
1. Double click **`open_practical_4.bat`** in the project root (or **`start_practical_4.bat`** in `Practical 4/`).
2. The NodeJS HTTP server initializes automatically on port `4000`.
3. Your default web browser will launch directly to `http://localhost:4000`.

### B. Command-Line Execution
```bash
# Navigate to the Practical 4 directory
cd "C:\Users\Dell\Desktop\Final_Projects\RoommateRadar\Practical 4"

# Run automated test suite
node test.js

# Start NodeJS server
node server.js
```

### C. Testing with cURL (Bypassing Frontend to Prove Server-Side Defense)
```bash
# 1. Attempt invalid submission via cURL
curl -X POST http://localhost:4000/api/roommates \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Hacker99\",\"email\":\"no_at_sign\",\"budget\":-100}"

# Server Response: HTTP 400 Bad Request with field errors!

# 2. Submit valid record via cURL
curl -X POST http://localhost:4000/api/roommates \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Karan Joshi\",\"email\":\"karan.j@mitaoe.ac.in\",\"role\":\"B.Tech IT\",\"area\":\"Wakad\",\"budget\":8500,\"sleepSchedule\":\"Flexible (11:30 PM)\",\"cleanliness\":\"High\",\"bio\":\"Disciplined IT student looking for a clean flat near Wakad.\"}"

# Server Response: HTTP 201 Created!
```

---

## 9. Viva Voce Questions & Answers (CO3 Rubric Mastery)

1. **Why is server-side validation mandatory when client-side validation is already present?**  
   *Answer:* Client validation runs in the user's browser and can be modified, disabled, or bypassed using browser developer tools, Postman, or cURL. Server-side validation guarantees data integrity, security, and type safety before anything is processed or stored.

2. **How does NodeJS handle incoming POST request data?**  
   *Answer:* In NodeJS, request bodies arrive as asynchronous data streams (`ReadableStream`). We register listeners for `req.on('data', chunk => ...)` to accumulate buffer chunks, and `req.on('end', () => ...)` to complete and parse the body once the entire payload is received.

3. **What HTTP status codes are used and why?**  
   *Answer:*  
   - `200 OK`: Successful retrieval of records (`GET /api/roommates`).  
   - `201 Created`: Successful server validation and record creation (`POST /api/roommates`).  
   - `400 Bad Request`: Server validation failure (e.g., malformed email or out-of-range budget).  
   - `404 Not Found`: Requesting an endpoint or file that does not exist.  
   - `500 Internal Server Error`: Unhandled server runtime exceptions.

4. **How are XSS injection attacks prevented?**  
   *Answer:* The `validator.js` module implements `sanitizeString()`, which replaces HTML special characters (`<`, `>`, `&`, `"`, `'`) with safe HTML entities before saving or reflecting strings.

---

## 10. Conclusion
Practical No. 04 successfully satisfies all requirements of Course Outcome **CO3**:
- A robust, modular **NodeJS HTTP server** with zero external dependencies.
- Strict **server-side validation** defending against bypassed client forms.
- Structured **HTTP status code handling** (`200`, `201`, `400`, `404`).
- Interactive user interface with one-click **"Valid"** and **"Invalid"** testing presets.
- Comprehensive automated test runner achieving **100% test pass rate**.
