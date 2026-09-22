# Productivity API

A small REST-style API built with only Node's built-in `http` module. It manages three completely independent resources — **Notes**, **Tasks**, and **Contacts** — with no relationships between them.

## How to run it

Requires Node.js (no dependencies to install — the project uses only built-in modules).

```bash
node server.js
```

The server listens on port `3001`. Once running, you can hit it with `curl` or any HTTP client, e.g.:

```bash
curl -X POST localhost:3001/notes -d '{"title":"Groceries","content":"Milk, eggs, bread"}'
curl localhost:3001/notes
curl -X PUT localhost:3001/tasks/1 -d '{"completed":true}'
curl -X DELETE localhost:3001/contacts/2
```

All data is stored in memory and resets whenever the server restarts.

## How the handlers are structured

The server dispatches first on **HTTP method** (`GET`, `POST`, `PUT`, `DELETE`), and within each method block, on the **resource** (`/notes`, `/tasks`, `/contacts`), using `url === "/resource"` for collection routes and `url.startsWith("/resource/")` for single-item routes.

All three resources follow the identical five-operation pattern:

- **List** (`GET /resource`) — return the in-memory array as JSON.
- **Create** (`POST /resource`) — parse and validate the body, assign the next id from that resource's own counter, push it into the array, return `201`.
- **Get one** (`GET /resource/:id`) — look up by id, `404` if missing.
- **Update** (`PUT /resource/:id`) — look up by id (`404` if missing), parse the body, apply only the fields that were sent (partial update), return the updated object.
- **Delete** (`DELETE /resource/:id`) — look up by id (`404` if missing), filter it out of the array, return `{ deleted: id }`.

Rather than pulling this into a shared/generic handler, each resource has its own copy of these five blocks, written out per method. Given the small size of the project (three resources, no shared logic beyond the shape of the pattern), keeping the branches separate and explicit seemed more readable than adding an abstraction layer — at the cost of some repetition across notes/tasks/contacts.

A few structural notes:

- Each resource keeps its own array (`notes`, `tasks`, `contacts`) and its own id counter (`nextNoteId`, `nextTaskId`, `nextContactId`), so ids never collide or depend on each other.
- Request bodies for `POST`/`PUT` are read in chunks via the `data` event and reassembled before `JSON.parse` is called on `end`; malformed JSON is caught and returns `400` instead of crashing the server.
- If the URL matches a known resource but the method isn't supported on it (e.g. `PUT /notes` with no id), the server returns `405` rather than falling through to a generic 404.
- Any URL that doesn't match a known route at all (e.g. `/bananas`) falls through to a catch-all `404 Route not found` at the bottom of the request handler.