# Project guidance

## Stack

- Node.js, CommonJS, and Express 4.
- `body-parser` parses JSON request bodies.
- The browser UI is static HTML and CSS with vanilla JavaScript.
- `data/db.json` is the application's JSON-file store; `lib/store.js` reads and rewrites it using synchronous filesystem calls.

## Module map

- `server.js` creates the Express app, serves `public/`, and mounts the routers.
- `config.js` contains the port, shop details, tax slabs, inventory defaults, and coupon definitions.
- `public/` contains the UI (`index.html`, `js/app.js`, `css/style.css`).
- `routes/`: `products.js` serves products and coupons; `orders.js` handles order listing, creation, and cancellation; `customers.js` handles customer reads and settlements; `reports.js` handles reports, pricing preview, and admin export.
- `lib/`: `store.js` persists data; `orders.js` manages orders; `inventory.js` handles stock; `pricing.js`, `coupons.js`, and `tax.js` calculate totals; `ledger.js` manages Khata balances and settlements; `invoice.js` renders invoices; `reports.js` builds summaries and reconciliation; `dates.js` handles date formatting and comparisons.
- `data/db.json` holds products, customers, orders, settlements, and audit entries.

## Commands

- `npm start` runs `node server.js`; the port is `PORT` when set, otherwise `3000`.
- `npm test` currently runs a placeholder that exits with an error; no test framework is configured in `package.json`.

## Change rules

- Write characterization tests before changing behaviour.
- Change only the module the ticket is about.
- Tests never touch `data/db.json`.
- Add no dependencies.
