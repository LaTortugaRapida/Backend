const express = require("express");
const { readData, writeData } = require("../utils/fileDB");
const { authenticate, authorize } = require("../middlewares/auth");
const router = express.Router();

router.get("/", async (req, res) => {
    let products = await readData("products.json");

    const { category, sort, search } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (category) {
        products = products.filter((p) => p.category === category);
    }

    if (sort === "price") {
        products = [...products].sort((a, b) => a.price - b.price);
    }

    if (search) {
        products = products.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase()),
        );
    }

    const startIdx = (page - 1) * limit;

    const endIdx = startIdx + limit;

    products = products.slice(startIdx, endIdx);

    res.json(products);
});

router.get("/:id", authenticate, async (req, res) => {
    const products = await readData("products.json");

    const productID = Number(req.params.id);

    const product = products.find((p) => p.id === productID);

    if (!product) {
        return res.status(404).json({ error: "Product not found!" });
    }

    res.json(product);
});

router.post("/", authenticate, authorize("admin"), async (req, res) => {
    const { name, price, category, stock } = req.body;

    if (!name || !price) {
        return res
            .status(400)
            .json({ error: "Product name and price are required!" });
    }

    const products = await readData("products.json");

    const newProduct = {
        id: products.length ? products.length + 1 : 1,
        name,
        price,
        category: category || "general",
        stock: stock ?? 0,
    };

    products.push(newProduct);
    await writeData("products.json", products);

    res.status(201).json(newProduct);
});

router.put("/:id", authenticate, authorize("admin"), async (req, res) => {
    let products = await readData("products.json");

    const productID = Number(req.params.id);

    const product = products.filter((p) => p.id === productID)[0];

    if (!product) {
        return res.status(404).json({ error: "Product not found!" });
    }

    const { name, price, category, stock } = req.body;

    const updatedProduct = {
        id: productID,
        name: name ? name : product.name,
        price: price ?? product.price,
        category: category ? category : product.category,
        stock: stock ?? product.stock,
    };

    products = products.filter((p) => p.id !== productID);
    products.push(updatedProduct);

    await writeData("products.json", products);

    res.status(200).json(updatedProduct);
});

router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
    let products = await readData("products.json");

    const productID = Number(req.params.id);

    const product = products.filter((p) => p.id === productID)[0];

    if (!product) {
        return res.status(404).json({ error: "Product not found!" });
    }

    products = products.filter((p) => p.id !== productID);

    await writeData("products.json", products);

    res.status(204).send();
});

module.exports = router;
