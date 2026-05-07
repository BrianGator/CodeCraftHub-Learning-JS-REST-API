# CodeCraftHub Personalized Learning Platform
**Written by Brian McCarthy**

## Project Overview
CodeCraftHub is a sophisticated, full-stack personalized learning platform designed for developers to manage their educational journey. It allows users to track courses, set goals, and monitor progress melalui a sleek, modern dashboard.

## Key Features Implemented
- **Full CRUD API**: Create, Read, Update, and Delete courses directly from the interface.
- **Dynamic Dashboard**: View statistics on course completion and status distribution.
- **Smart Filtering**: Live search functionality to quickly find specific courses or topics.
- **Status Tracking**: Transition courses from "Not Started" to "In Progress" and finally "Completed".
- **Persistent Storage**: All data is automatically saved to a local `courses.json` file.
- **Polished UI**: Built with Tailwind CSS 4 and Motion for smooth, professional interactions.

## Project Structure
```text
codecrafthub/
├── server.ts            # Full-stack entry point (Express + Vite)
├── src/
│   ├── App.tsx          # React Dashboard UI
│   └── main.tsx         # Frontend entry
├── courses.json         # Storage (auto-created)
├── dev-requirements.txt # Technical documentation
├── [Test Directories]/  # Comprehensive test suites (Selenium, Playwright, etc.)
└── README.md            # You are here
```

## How to Use
1. **Launch the app**: The application runs automatically in the AI Studio environment.
2. **Add a Course**: Click the "Add Course" button in the top right to start.
3. **Manage Progress**: Use the edit icon to update status as you learn.
4. **Search**: Use the search bar to filter your learning path.
5. **Analyze**: Review the stats cards at the top to track your overall productivity.

## Testing Types & Descriptions
The project includes a robust testing framework consisting of:
- **Selenium (C#)**: 15 Cross-browser automation tests.
- **Playwright (C#)**: 15 Modern asynchronous web tests.
- **Cypress**: 15 End-to-end integration tests.
- **Cucumber**: 15 Behavior-driven scenarios.
- **Load Testing**: 8 Tests for concurrent user capacity.
- **Stress Testing**: 8 Tests for system limits and failure recovery.
- **Performance**: 8 Efficiency and speed benchmarks.
- **Unit Testing**: 8 Core logic validation tests.
- **System Testing**: 8 Environment and configuration checks.
- **Integration**: 8 Backend-Frontend handshake validations.
- **Security**: 8 Vulnerability and injection protection tests.
- **End-to-End**: 8 Full user workflow simulations.

## Troubleshooting
- **Missing Data**: Ensure `courses.json` is writable.
- **Port Conflicts**: The app is configured to use port 3000 for external accessibility.
- **Modules Not Found**: Run `npm install` to restore dependencies.

---
*Created with excellence by Brian McCarthy*
