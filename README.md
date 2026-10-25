# 🏠 RoommateRadar — Server-Side Validation using NodeJS

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Test Suite](https://img.shields.io/badge/Unit%20Tests-10%2F10%20Passed%20(100%25)-success)](https://github.com/Hursh-404/Roommate-Radar/blob/main/test.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Hursh-404/Roommate-Radar/blob/main/LICENSE)
[![Academic Course](https://img.shields.io/badge/MIT--AOE-Web%20Technology%20Lab-orange)](https://mitaoe.ac.in)

> **Practical No. 04 — Course Outcome CO3**  
> *Design, develop and deploy a web application to demonstrate server-side validation using NodeJS.*

---

## 🌐 Live Web Application & Demonstration

You can test and demonstrate the web application directly in your browser using either of the links below:

- 🚀 **[Open Interactive Web Application (Live HTML Preview)](https://htmlpreview.github.io/?https://github.com/Hursh-404/Roommate-Radar/blob/main/Practical_4_SingleFile_Submission.html)**
- 📄 **[View Single-File Submission Source Code](https://github.com/Hursh-404/Roommate-Radar/blob/main/Practical_4_SingleFile_Submission.html)**
- 📑 **[View Complete Lab Report (10/10 Rubric)](https://github.com/Hursh-404/Roommate-Radar/blob/main/PRACTICAL_4_REPORT.md)**

*(If you enable GitHub Pages on your repository `main` branch, your direct link will be: `https://hursh-404.github.io/Roommate-Radar/Practical_4_SingleFile_Submission.html`)*

---

## 🎯 Aim & Objectives

1. Develop a standalone server-side web application using native **Node.js** without relying on third-party frameworks.
2. Implement robust **server-side validation** and **HTML/XSS sanitization** for user registration and roommate matching.
3. Handle **GET and POST** HTTP requests with semantic status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `405 Method Not Allowed`, `413 Payload Too Large`).
4. Prevent malformed, boundary-breaking, or malicious payloads from polluting the datastore.
5. Provide live visual feedback, error messages, and an audit trail for examiners.

---

## 🛡️ Server-Side Validation Rules

All validation rules are enforced strictly on the server in [`validator.js`](https://github.com/Hursh-404/Roommate-Radar/blob/main/validator.js):

| Field | Rule / Constraint | Error Message on Failure |
| :--- | :--- | :--- |
| **Full Name** | 3–50 chars, alphabets and spaces only | *Full name must be at least 3 characters long and contain only letters.* |
| **Email** | Valid RFC 5322 regex syntax | *Invalid email syntax (e.g. student@college.edu or student@mitaoe.ac.in).* |
| **Course** | 2–60 characters string | *Department and academic course is required.* |
| **Pune Area** | Whitelist: `Shivajinagar`, `Pimpri`, `Wakad`, `Baner`, `Hinjewadi`, `Aundh`, `Kothrud`, `Viman Nagar` | *Selected area must be one of the recognized Pune localities.* |
| **Monthly Budget** | Integer between **₹2,000** and **₹35,000** | *Budget must be between ₹2,000 and ₹35,000 / month.* |
| **Sleep Schedule** | Enum: `Early Riser (10PM - 6AM)`, `Flexible (Midnight - 8AM)`, `Night Owl (2AM - 10AM)` | *Sleep routine selection is required.* |
| **Cleanliness** | Enum: `Very Strict (Daily clean)`, `Moderate (Tidy as you go)`, `Relaxed (Weekend chores)` | *Cleanliness preference is required.* |
| **Bio** | 15–300 characters description | *Description must be between 15 and 300 characters.* |
| **XSS Defense** | HTML entities `&`, `<`, `>`, `"`, `'` sanitized | *All dangerous tags stripped before storage.* |

---

## 🚀 Running the NodeJS Server Locally

The backend uses pure Node.js built-ins (`http`, `url`, `fs`, `path`) and has **zero external `npm install` dependencies**.

### 1. Start the Server
Double-click `start_practical_4.bat` or run:
```bash
node server.js
