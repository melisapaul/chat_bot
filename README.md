Ey-Techathon — Conversational ABFRL Retail Prototype

This repository contains a front-end prototype demonstrating a multi-agent conversational retail experience. It is intended as a demonstration of UI, interaction patterns, and agent orchestration. Backend integrations (APIs, persistent storage and orchestration) are planned using FastAPI and LangGraph.

Key features

- Multi-agent conversational flows (Recommendation, Inventory, Payment, Fulfillment) with a synchronized activity timeline.
- Two chat modes: Web Messenger (browser) and In-Store kiosk (local session), each showing agent messages and timeline logs.
- Contextual upsell and payment flows, with simulated retry behavior for payment attempts.
- Admin view with a StoreKeeper transaction table; includes a session-driven demo transaction insertion for verification.

What the prototype demonstrates

- Orchestrated agent messaging with left-side timeline entries and message bubbles synchronized to user actions.
- Conditional upsell presentation triggered from the inventory flow and contextual routing to payment.
- Session handoff from web to in-store flows and a transient demo transaction insertion using sessionStorage.
- Use of static demo data (`data/admin.json`) to populate users, products, stores and transactions for UI evaluation.

Primary files

- Pages & UI: [pages/Admin.jsx](pages/Admin.jsx), [pages/SortableTransactionTable.jsx](pages/SortableTransactionTable.jsx), [pages/StoreKeeper.jsx](pages/StoreKeeper.jsx)
- Chat UI: [components/MessengerChatbot.jsx](components/MessengerChatbot.jsx), [components/InStoreChatbot.jsx](components/InStoreChatbot.jsx), [components/ChatbotInteraction.jsx](components/ChatbotInteraction.jsx)
- Demo data: [data/admin.json](data/admin.json)
- App entry: `App.jsx`, `main.jsx`, `index.html`

Quick start

1. Install dependencies

```powershell
npm install
```

2. Start the development server

```powershell
npm run dev
```

Open the application in your browser at the port printed by the dev server (commonly http://localhost:3000).

Evaluation checklist

1. In-Web Messenger mode, request a product recommendation and follow the recommendation → inventory flow.
2. Select `Buy Online` when presented in the inventory flow; observe the conditional upsell and then proceed to the payment flow.
3. Confirm payment messages and timeline entries are synchronized with agent logs on the left.
4. Complete an In-Store kiosk flow and verify a transient demo transaction appears in the StoreKeeper/All Transactions view (the demo transaction is session-scoped and cleared on refresh).


Future work (production roadmap)

1. Backend with FastAPI
   - Implement REST endpoints for sessions, transactions, inventory and payments and replace static demo JSON with a Postgres-backed API.
2. Orchestration with LangGraph
   - Implement LLM-driven agents and define the orchestration graph for multi-agent workflows, retries, and long-running tasks.
3. Security, observability and CI/CD
   - Add authentication (OAuth2/JWT), observability (metrics/logging), payment integrations, containerization and automated pipelines for build and deployment.

Limitations

- This is a front-end prototype using simulated agent logic and mock data. Sensitive integrations are not implemented and are simulated for demonstration purposes.

Contact

Prototype developed for EY Techathon by the ABFRL demo team. For questions or to request a live demo, open an issue in this repository.

