# old-bnet-tauri
![alt text][logo]

[logo]: https://github.com/ArjanDeo/old-bnet-tauri/blob/main/static/old-bnet-tauri-wowpage.webp "Screenshot of old-bnet-tauri app"
![version](https://img.shields.io/badge/version-0.2.3_beta-blue.svg)
![license](https://img.shields.io/badge/license-MIT-lightgrey.svg)

A desktop companion for Blizzard/Battle.net games built with Tauri (Rust) and SvelteKit (TypeScript). The app locates installed Battle.net games, reads local game metadata (build info and playtime), syncs versions to a local store, and can launch games using Battle.net launch arguments. It also integrates with Battle.net OAuth to fetch user/profile data.

Table of contents
- [Why this project is useful](#why-this-project-is-useful)
- [Features](#features)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Run (development)](#run-development)
  - [Build (release)](#build-release)
- [Project structure](#project-structure)
- [Platform notes](#platform-notes)
- [Roadmap](#roadmap)
- [Where to get help](#where-to-get-help)
- [Contributing & maintainers](#contributing--maintainers)
- [License](#license)

Why this project is useful
--------------------------
old-bnet-tauri provides a lightweight desktop UI for inspecting and launching Blizzard (Battle.net) games. It is useful for developers and power users who want:
- A native-feeling UI (Tauri) with a web frontend (SvelteKit)
- Quick access to local game metadata (installed builds, versions, playtime)
- One-click launching with selected versions/aliases
- A local cache (Tauri store) and small cross-platform Rust backend for OS integration

Features
--------
- Locate installed Blizzard games via Windows registry and Battle.net aggregate.json
- Parse local .build.info to extract product/version information
- Sync versions into a Tauri-backed store
- Launch games with Battle.net command-line arguments
- Read WoW playtime from SavedVariables (TotalPlayed.lua)
- Fetch Battle.net user/profile data via OAuth (frontend opens a webview for auth)
- SvelteKit frontend with configurable themes per game

Getting started
---------------

### Prerequisites
- Node.js (18+) and npm or yarn
- Rust and cargo (stable)
- Tauri prerequisites for your OS (on Windows: Visual Studio Build Tools with C++ workload; see Tauri docs)
- (Windows-specific) The app reads Windows registry and ProgramData paths

### Install
1. Clone the repo:

   git clone https://github.com/ArjanDeo/old-bnet-tauri.git<br/>
   cd old-bnet-tauri
2. Clone Twisting Nether repo:
   (This is required for Battle.Net OAuth and related functionality, OAuth callback utilizes the WebAPI at this repo)
   git clone [https://github.com/ArjanDeo/TwistingNether.git](https://github.com/ArjanDeo/TwistingNether.git)<br/>
   cd TwistingNether

4. Install JavaScript dependencies:

   npm install

5. Ensure Rust toolchain is installed and up-to-date:

   rustup toolchain install stable
   rustup default stable

### Run (development)
  "npm run tauri dev" will run the app in it's intended desktop environment.
  If running the TwistingNether API as well, open solution in visual studio and create an appsettings.json in accordance with the [ReadME](https://github.com/ArjanDeo/TwistingNether/blob/master/README.md) and run the solution.

### Build (release)
1. Build frontend assets:

   npm run build

2. Build the Tauri bundle (creates platform installers/bundles):

   npm run tauri build

Project structure
-----------------
- src/                – SvelteKit frontend (UI, routes, components)
- src-tauri/          – Rust backend and Tauri configuration (native commands, registry access)
  - src/lib.rs        – main Rust library (commands invoked by frontend)
  - src/main.rs       – Tauri binary entrypoint
  - Cargo.toml        – Rust manifest
- static/             – static assets
- build/              – generated frontend build output
- package.json        – npm scripts and dependencies

Platform notes
--------------
- The Rust backend uses `winreg` and reads `C:\ProgramData\Battle.net\Agent\aggregate.json`, so full functionality is implemented for Windows. Other platforms may work for UI-only features but will lack registry-based discovery.
- OAuth redirect URIs are configured for development and production in the frontend (see src/data.ts).

Roadmap
---------------------------------------
- Cross-platform discovery: implement macOS/Linux discovery paths for Battle.net installs
- Graceful error handling: remove panics in src-tauri/src/lib.rs; return Result errors to the frontend
- Configurable OAuth: make redirect URIs and client IDs configurable via env or config file
- Tests: add unit tests for parsing (.build.info) and playtime extraction
- CI: add GitHub Actions for linting, type checks, and build artifacts
- Installer signing & release automation for Windows builds
- CONTRIBUTING.md and ISSUE templates to standardize contributions

Where to get help
-----------------
- Open an issue on this repository for bugs or feature requests
- For usage questions, include logs and steps to reproduce in the issue
- Check Rust/Tauri and SvelteKit official docs for environment/setup issues

Contributing & maintainers
--------------------------
Maintainer: ArjanDeo (GitHub)

Contributing is welcome. Suggested workflow:
1. Fork the repo
2. Create a branch named feature/your-change
3. Open a pull request against main with a clear description

If you plan to make larger changes, open an issue first to discuss the approach. There is no CONTRIBUTING.md yet; open a PR to add one if desired.

License
-------
This project is released under the MIT license.

Notes
-----
- Sensitive tokens (e.g. OAuth client secrets) should not be committed. Use environment variables or a secure store for production.
