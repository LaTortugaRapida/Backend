const http = require("node:http");
const PORT = 3001;

let notes = [];
let tasks = [];
let contacts = [];

let nextNoteId = 1;
let nextTaskId = 1;
let nextContactId = 1;

const server = http.createServer((req, res) => {
    const { method, url } = req;

    if (method === "GET") {
        if (url === "/notes") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(notes));
            return;
        } else if (url === "/tasks") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(tasks));
            return;
        } else if (url === "/contacts") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(contacts));
            return;
        } else if (url.startsWith("/notes/")) {
            const parts = url.split("/");
            const id = Number(parts[2]);

            const note = notes.find((n) => n.id === id);

            if (!note) {
                res.statusCode = 404;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Note not found!" }));
                return;
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(note));
            return;
        } else if (url.startsWith("/tasks/")) {
            const parts = url.split("/");
            const id = Number(parts[2]);

            const task = tasks.find((t) => t.id === id);

            if (!task) {
                res.statusCode = 404;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Task not found!" }));
                return;
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(task));
            return;
        } else if (url.startsWith("/contacts/")) {
            const parts = url.split("/");
            const id = Number(parts[2]);

            const contact = contacts.find((c) => c.id === id);

            if (!contact) {
                res.statusCode = 404;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Contact not found!" }));
                return;
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(contact));
            return;
        }
    }

    if (method === "POST") {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {
            let data;

            try {
                data = JSON.parse(body);
            } catch {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Invalid JSON" }));
                return;
            }

            if (url === "/notes") {
                if (!data.title) {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(
                        JSON.stringify({ error: "Note title is required!" }),
                    );
                    return;
                }

                if (!data.content) {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(
                        JSON.stringify({ error: "Note content is required!" }),
                    );
                    return;
                }

                const note = {
                    id: nextNoteId++,
                    title: data.title,
                    content: data.content,
                };

                notes.push(note);

                res.statusCode = 201;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(note));
                return;
            } else if (url === "/tasks") {
                if (!data.title) {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(
                        JSON.stringify({ error: "Task title is required!" }),
                    );
                    return;
                }
                const task = {
                    id: nextTaskId++,
                    title: data.title,
                    completed: false,
                };

                tasks.push(task);

                res.statusCode = 201;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(task));
                return;
            } else if (url === "/contacts") {
                if (!data.name || !data.email) {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(
                        JSON.stringify({
                            error: "Contact name and email are required!",
                        }),
                    );
                    return;
                }
                const contact = {
                    id: nextContactId++,
                    name: data.name,
                    email: data.email,
                    phone: data.phone ? data.phone : null,
                };

                contacts.push(contact);

                res.statusCode = 201;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(contact));
                return;
            }
        });

        return;
    }

    if (method === "PUT") {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {
            if (url.startsWith("/notes/")) {
                const parts = url.split("/");

                const id = Number(parts[2]);

                const note = notes.find((n) => n.id === id);

                if (!note) {
                    res.statusCode = 404;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "Note not found!" }));
                    return;
                }

                let data;

                try {
                    data = JSON.parse(body);
                } catch {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "Invalid JSON" }));
                    return;
                }

                if (data.title) {
                    note.title = data.title;
                }

                if (data.content) {
                    note.content = data.content;
                }

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(note));
                return;
            } else if (url.startsWith("/tasks/")) {
                const parts = url.split("/");

                const id = Number(parts[2]);

                const task = tasks.find((t) => t.id === id);

                if (!task) {
                    res.statusCode = 404;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "Task not found!" }));
                    return;
                }

                let data;

                try {
                    data = JSON.parse(body);
                } catch {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "Invalid JSON" }));
                    return;
                }

                if (data.title) {
                    task.title = data.title;
                }

                if (data.completed !== undefined) {
                    task.completed = data.completed;
                }

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(task));
                return;
            } else if (url.startsWith("/contacts/")) {
                const parts = url.split("/");

                const id = Number(parts[2]);

                const contact = contacts.find((c) => c.id === id);

                if (!contact) {
                    res.statusCode = 404;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "contact not found!" }));
                    return;
                }

                let data;

                try {
                    data = JSON.parse(body);
                } catch {
                    res.statusCode = 400;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify({ error: "Invalid JSON" }));
                    return;
                }

                if (data.name) {
                    contact.name = data.name;
                }

                if (data.email) {
                    contact.email = data.email;
                }

                if (data.phone !== undefined) {
                    contact.phone = data.phone;
                }

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(contact));
                return;
            } else if (
                url === "/notes" ||
                url === "/tasks" ||
                url === "/contacts"
            ) {
                res.statusCode = 405;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Method not allowed" }));
                return;
            }
            return;
        });

        return;
    }

    if (method === "DELETE") {
        if (url.startsWith("/notes/")) {
            const parts = url.split("/");

            const id = Number(parts[2]);

            const note = notes.find((n) => n.id === id);

            if (!note) {
                res.statusCode = 404;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Note not found!" }));
                return;
            }

            notes = notes.filter((n) => n.id !== id);

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ deleted: id }));
            return;
        } else if (url.startsWith("/tasks/")) {
            const parts = url.split("/");

            const id = Number(parts[2]);

            const task = tasks.find((t) => t.id === id);

            if (!task) {
                res.statusCode = 404;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Task not found!" }));
                return;
            }

            tasks = tasks.filter((n) => n.id !== id);

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ deleted: id }));
            return;
        } else if (url.startsWith("/contacts/")) {
            const parts = url.split("/");

            const id = Number(parts[2]);

            const contact = contacts.find((n) => n.id === id);

            if (!contact) {
                res.statusCode = 404;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Contact not found!" }));
                return;
            }

            contacts = contacts.filter((n) => n.id !== id);

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ deleted: id }));
            return;
        } else if (
            url === "/notes" ||
            url === "/tasks" ||
            url === "/contacts"
        ) {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
        }
        return;
    }

    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
