 AI Resume Screener Pro 

A modern, fast, and 100% offline Applicant Tracking System (ATS) built entirely in HTML, CSS, and Vanilla JavaScript.

This tool allows technical recruiters and hiring managers to instantly cross-reference bulk candidate resumes (PDF, DOCX, TXT) against a Job Description or a required set of skills to determine the best fit—all running instantly and securely inside your web browser. No API keys, no backend servers, and zero data leaves your local machine.

## Features
* **Premium Dashboard Interface**: Built with modern Dark Mode, glassmorphism, and smooth CSS animations.
* **100% Offline & Free**: No paid APIs (like OpenAI or Gemini) are required. The entire keyword matching engine runs using local JavaScript regular expressions.
* **Native File Parsing**: Supports Drag-and-drop for `.pdf`, `.docx`, and `.txt` files directly in the browser using `pdf.js` and `mammoth.js`.
* **Instant Keyword Scoring**: Automatically extracts required skills from the Job Description and cross-references them against candidate resumes.
* **Dynamic Best-Fit Widget**: An animated circular progress chart visually highlights the #1 ranking candidate and tags their exact matched skills.

## Tech Stack
* **Frontend Structure**: HTML5
* **Styling**: Vanilla CSS3 (Custom Variables, Flexbox, CSS Grid)
* **Logic & Parsing Engine**: Vanilla JavaScript (ES6+)
* **Dependencies (CDN)**:
  * [PDF.js](https://mozilla.github.io/pdf.js/) (PDF Parsing)
  * [Mammoth.js](https://github.com/mwilliamson/mammoth.js) (DOCX Parsing)

## How to Run Locally

Because the entire application runs natively in the browser without a backend, running it is incredibly simple:

1. Clone or download this repository to your computer.
2. Inside the project folder, simply double-click **`index.html`** to open it in Google Chrome, Microsoft Edge, or Firefox.
3. **Usage Flow**:
   * On the Left Panel, paste your requested skills separated by commas (e.g., `Python, SQL, React, Node.js`).
   * On the Right Panel, drag and drop 1 or more PDF/DOCX candidate resumes.
   * Click **"Run Analysis"** to instantly generate the match scores!

## Privacy & Security Context
This tool guarantees ultimate candidate privacy. By bypassing traditional cloud AI endpoints, all files you upload are converted to text inside your own browser tab's sandbox memory. No files or resulting text are ever cached or sent to external servers.

---
*Built with ❤️ for better, faster hiring.*
