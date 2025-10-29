# AI-Powered Finance Planner — Run Instructions

Prereqs
- Node.js 18+ and npm installed (for Next.js frontend + API).
- (Optional) Python 3.8+ and pip if you want to run script.py.

Setup (Next.js frontend + API)
1. Open a terminal and change to the project root:
   cd "c:\Users\HP\Desktop\finance_tracker\AI-Powered-Finance-tracker"

2. Install Node deps:
   npm install

3. Create a `.env` in the project root with your SambaNova key (see .env.example).
   Example `.env`:
   SAMBANOVA_API_KEY=your_real_key_here
   SAMBANOVA_BASE_URL=https://api.sambanova.ai/v1   # optional

4. Start the dev server:
   npm run dev

5. Open the app:
   http://localhost:3000

Notes on the AI endpoint
- The UI calls /api/ai-plan (Next.js route). Ensure SAMBANOVA_API_KEY is set or the API will return a configuration error.
- If you don't have an API key while developing, use the "Get AI Plan" button to inspect the error response in the browser devtools Network tab and adapt temporarily.

Optional: Run the Python test script
1. Create a Python virtualenv (recommended) and install deps:
   python -m venv .venv
   .venv\Scripts\activate
   pip install sambanova python-dotenv

2. Create a `.env` with SAMBANOVA_API_KEY and optionally SAMBANOVA_BASE_URL (same as above).

3. Run:
   python script.py

## Troubleshooting: ENOENT .next/BUILD_ID error

What it means
- This error happens when you run `next start` (production server) but no production build exists. The `.next/BUILD_ID` file is created by `next build`; if it's missing, `next start` will fail.

Quick fixes
1. Development (no build required)
   - Install deps and run dev server:
     npm install
     npm run dev
   - Open http://localhost:3000

2. Production flow (create a build before starting)
   - Install deps, build, then start:
     npm install
     npm run build
     npm run start
   - Or explicitly:
     npx next build
     npx next start

3. If a previous build failed or is corrupted
   - Remove the `.next` folder and rebuild:
     rm -rf .next
     npm run build
   - Windows PowerShell:
     Remove-Item -Recurse -Force .\.next
     npm run build

4. Additional checks
   - Ensure Node.js 18+ (or the version required by your Next.js release).
   - Verify package.json has "build" and "start" scripts.
   - If you only need to test UI without a SambaNova key, use `npm run dev` (development server doesn't require a production build).

If the issue persists after rebuilding, share the terminal output from `npm run build` and I will help diagnose further.

That's it — open the UI, add incomes/expenses/goals, then click "Get AI Plan" to fetch AI recommendations.