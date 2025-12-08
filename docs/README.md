# From Abyss Media - Webfront

[![Build Status](https://img.shields.io/github/actions/workflow/status/TellurianCorp/from-abyss-webfront/ci.yml?branch=main)](https://github.com/TellurianCorp/from-abyss-webfront/actions/workflows/ci.yml) [![License](https://img.shields.io/github/license/TellurianCorp/from-abyss-webfront)](LICENSE)

---

## Overview

This repository contains the React-based web frontend for **From Abyss Media**. It provides an immersive, high-performance user interface for accessing content, engaging with the community, and experiencing the platform's unique aesthetic.

### Key Features

- **Modern React Architecture:** Built with React 18+, Vite, and TypeScript
- **OperaGX Integration:** Special features and optimizations for the OperaGX browser
- **Progressive Web App (PWA):** Installable, offline-capable, native-like experience
- **Dark Aesthetic Design:** Unique cyberpunk and occult-inspired visual identity
- **Federation Features:** Integration with ActivityPub for decentralized social interactions
- **Responsive Design:** Mobile-first, optimized for all screen sizes
- **Real-time Features:** WebSocket-powered live updates and notifications

For detailed architecture and design documentation, please refer to the [From Abyss Media Workspace](https://github.com/TellurianCorp/from-abyss-workspace).

---

## Getting Started

This repository is intended to be used as a submodule within the `from-abyss-workspace` repository. For local development, please follow the instructions in the [workspace README](https://github.com/TellurianCorp/from-abyss-workspace/blob/main/README.md).

### Standalone Development

If you need to run the web frontend in standalone mode:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/TellurianCorp/from-abyss-webfront.git
    cd from-abyss-webfront
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Copy the `.env.example` file to `.env.local` and populate it with the API endpoint and other configuration.

    ```bash
    cp .env.example .env.local
    ```

4.  **Start the development server:**

    ```bash
    npm run dev
    ```

The web application will be available at `http://localhost:5173`.

---

## Technology Stack

- **Framework:** React 18+
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** CSS Modules, Tailwind CSS (to be added)
- **Routing:** React Router (to be added)
- **State Management:** React Context, React Query (to be added)
- **HTTP Client:** Axios (to be added)
- **WebSocket:** Socket.io-client (to be added)

---

## Available Scripts

- `npm run dev`: Starts the development server
- `npm run build`: Builds the app for production
- `npm run preview`: Previews the production build locally
- `npm run lint`: Lints the codebase

---

## Project Structure

```
from-abyss-webfront/
├── public/                # Static assets
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── common/        # Shared components
│   │   ├── content/       # Content components
│   │   ├── federation/    # Federation components
│   │   └── layout/        # Layout components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and services
│   │   ├── api/           # API client
│   │   ├── websocket/     # WebSocket client
│   │   └── storage/       # Local storage
│   ├── context/           # React context
│   ├── utils/             # Utility functions
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript types
│   ├── assets/            # Asset files
│   ├── App.tsx            # Root component
│   └── main.tsx           # Application entry
├── .env.example           # Environment variables template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

---

## Contributing

Contributions are welcome. Please follow the guidelines in the main [workspace repository](https://github.com/TellurianCorp/from-abyss-workspace/blob/main/CONTRIBUTING.md).

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Support

For questions, bug reports, or feature requests, please [open an issue](https://github.com/TellurianCorp/from-abyss-webfront/issues) on GitHub.

