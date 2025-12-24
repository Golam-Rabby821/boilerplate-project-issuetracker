# Issue Tracker

Full-stack issue tracker built for the freeCodeCamp Quality Assurance Certification. This project implements the required REST API, MongoDB persistence, and the complete functional test suite.

Project instructions: https://www.freecodecamp.org/learn/quality-assurance/quality-assurance-projects/issue-tracker

## Features
- REST API with CRUD for project issues
- Query filters for GET (any field, including open and _id)
- MongoDB persistence with a shared connection
- Functional test suite covering all 14 FCC scenarios
- Simple UI pages for manual testing

## Quick Start
Prerequisites:
- Node.js 16+
- npm 7+
- A MongoDB connection string

Setup:
1) Clone the repo
2) Install dependencies
   - `npm install`
3) Create `.env` (copy `sample.env`) and set:
   - `MONGO_URI=your_mongo_uri`
   - `NODE_ENV=test` (optional, for auto-running tests)
4) Start the server
   - `npm start`

Local URL:
- `http://localhost:3000`

## API Documentation
Base path: `/api/issues/{project}`

POST `/api/issues/{project}`
- Required: `issue_title`, `issue_text`, `created_by`
- Optional: `assigned_to`, `status_text`
- Returns the created issue with `_id`, `created_on`, `updated_on`, `open`

GET `/api/issues/{project}`
- Returns an array of issues for the project
- Supports query filters, e.g.:
  - `/api/issues/myproject?open=true`
  - `/api/issues/myproject?assigned_to=Joe&open=false`

PUT `/api/issues/{project}`
- Required: `_id`
- Update any of: `issue_title`, `issue_text`, `created_by`, `assigned_to`, `status_text`, `open`
- Returns `{ result: "successfully updated", _id }` or error objects per spec

DELETE `/api/issues/{project}`
- Required: `_id`
- Returns `{ result: "successfully deleted", _id }` or error objects per spec

## Tests
Run all tests:
- `npm test`

The test suite includes:
- `tests/1_unit-tests.js` (FCC boilerplate)
- `tests/2_functional-tests.js` (all 14 FCC functional tests)

## Project Structure
```
boilerplate-project-issuetracker/
├── routes/
│   └── api.js                # API handlers (GET/POST/PUT/DELETE)
├── tests/
│   ├── 1_unit-tests.js        # FCC unit tests (boilerplate)
│   └── 2_functional-tests.js  # FCC functional tests (complete)
├── views/
│   ├── index.html             # API testing UI
│   └── issue.html             # Project issue board UI
├── public/
│   └── style.css              # UI styles
├── server.js                  # Express app + MongoDB connection
├── connection.js              # MongoDB connector helper
└── sample.env                 # Example env config
```

## FCC Requirements Covered
- Create issues with required and optional fields
- Return full issue objects with timestamps and open status
- GET with zero or many filters
- PUT with validation, update handling, and error cases
- DELETE with validation and error cases
- Full 14/14 functional tests

## Author
Golam Rabby
