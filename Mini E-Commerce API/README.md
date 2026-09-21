# Mini E-Commerce API

A small e-commerce API and EJS web interface built with Express, JWT authentication, and JSON file storage (no database).

## How to run

1. Install dependencies:
    ```bash
    npm install
    ```
2. Create a `.env` file in the project root with:
    ```
    PORT=3000
    SECRET=your-jwt-secret-here
    ```
3. Start the server:
    ```bash
    node server.js
    ```
    or, for auto-restart on file changes:
    ```bash
    npm run dev
    ```

## Seeded admin account

An admin account must be seeded by hand in `data/users.json` before first use — there is no endpoint that can create an admin account; `POST /auth/register` always creates a `customer`.

- **username:** `bob`
- **password:** `<password>`

## Web views

The server also renders simple EJS pages:

- `GET /view/products` — list products and filter by category
- `GET /view/products/:id` — show one product
- `GET /view/products/new` — product creation form for an authenticated admin
- `GET /view/login` — login form

The login page stores the JWT returned by `POST /auth/login`. The product creation form sends that token to `POST /products`.

## Project structure

```
server.js               Express app setup, mounts the routers
views/                   EJS templates for the web interface
  login.ejs
  products/              product list, details, and creation pages
  partials/              shared header and footer
middlewares/
  auth.js                authenticate (JWT verify -> req.user) and authorize (role check)
routes/
  auth.js                 POST /auth/register, POST /auth/login
  products.js               GET/POST/PUT/DELETE /products, search + pagination
  orders.js                   POST/GET /orders, PATCH + DELETE /orders/:id
  views.js                    rendered web pages under /view
utils/
  fileDB.js                readData / writeData helpers for the JSON "tables"
data/
  users.json, products.json, orders.json   JSON file storage
```

## Endpoints

All endpoints from the assignment spec are implemented as specified, plus these stretch goals:

- `PATCH /orders/:id` — admin updates order status (`pending` / `shipped` / `delivered`)
- `GET /products?page=&limit=` — pagination
- `DELETE /orders/:id` — cancel an order and restore stock
- `GET /products?search=` — case-insensitive partial match on product name

## Notes

- Passwords are hashed with bcrypt; `passwordHash` is never included in any API response.
- Every issued JWT expires after 1 hour.
- Checkout validates stock for every item before changing anything; if any item fails, the whole order is rejected and no stock is touched.
- Order totals and unit prices are always computed server-side from `products.json`, never taken from the request body.
