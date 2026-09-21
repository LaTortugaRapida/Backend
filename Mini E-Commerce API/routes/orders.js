const express = require("express");
const { readData, writeData } = require("../utils/fileDB");
const { authenticate, authorize } = require("../middlewares/auth");

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
    const orders = await readData("orders.json");

    const userOrders = orders.filter((o) => o.userId === req.user.id);

    res.json(userOrders);
});

router.get("/:id", authenticate, async (req, res) => {
    const orders = await readData("orders.json");

    const orderId = Number(req.params.id);

    const order = orders.find((o) => o.id === orderId);

    if (!order) {
        return res.status(404).json({ error: "Order not found!" });
    }

    if (!(order.userId === req.user.id || req.user.role === "admin")) {
        return res.status(403).json({ error: "Forbidden" });
    }

    res.json(order);
});

router.post("/", authenticate, async (req, res) => {
    const { items } = req.body;

    if (!Array.isArray(items) || !items.length) {
        return res
            .status(400)
            .json({ error: "Items must be a non-empty array!" });
    }

    const products = await readData("products.json");

    for (const item of items) {
        const { productId, quantity } = item;

        const product = products.find((p) => p.id === productId);

        if (!product) {
            return res.status(404).json({ error: "Product not found!" });
        } else if (!quantity || quantity < 0) {
            return res
                .status(400)
                .json({ error: "Quantity must be a positive integer!" });
        } else if (quantity > product.stock) {
            return res.status(400).json({ error: "Not enough stock!" });
        }
    }

    for (const item of items) {
        const { productId, quantity } = item;

        let product = products.find((p) => p.id === productId);

        product.stock -= quantity;
    }

    await writeData("products.json", products);

    const orderItems = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
            productId: product.id,
            name: product.name,
            quantity: item.quantity,
            unitPrice: product.price,
        };
    });

    let total = orderItems.reduce((acc, item) => {
        return acc + item.unitPrice * item.quantity;
    }, 0);

    const orders = await readData("orders.json");

    const newOrder = {
        id: orders.length ? orders.length + 1 : 1,
        userId: req.user.id,
        items: orderItems,
        total,
        status: "pending",
        createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);

    await writeData("orders.json", orders);

    res.status(201).json(newOrder);
});

router.patch("/:id", authenticate, authorize("admin"), async (req, res) => {
    let orders = await readData("orders.json");

    const orderId = Number(req.params.id);

    let order = orders.find((o) => o.id === orderId);

    if (!order) {
        return res.status(404).json({ error: "Order not found!" });
    }

    const status = req.body.status;

    const validStatuses = ["pending", "shipped", "delivered"];

    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status!" });
    }

    order.status = status;

    await writeData("orders.json", orders);

    res.json(order);
});

router.delete("/:id", authenticate, async (req, res) => {
    let orders = await readData("orders.json");

    const orderId = Number(req.params.id);

    const order = orders.find((o) => o.id === orderId);

    if (!order) {
        return res.status(404).json({ error: "Order not found!" });
    }

    if (!(order.userId === req.user.id || req.user.role === "admin")) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const products = await readData("products.json");

    for (const item of order.items) {
        const { productId, quantity } = item;
        const product = products.find((p) => p.id === productId);
        product.stock += quantity;
    }

    await writeData("products.json", products);

    orders = orders.filter((o) => o.id !== orderId);

    await writeData("orders.json", orders);

    res.status(204).send();
});

module.exports = router;
