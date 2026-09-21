const express = require("express");
const { readData } = require("../utils/fileDB");
const router = express.Router();

router.get("/products", async (req, res) => {
    try {
        let products = await readData("products.json");

        if (!Array.isArray(products)) {
            products = [];
        }

        const categoryFilter = req.query.category;
        if (categoryFilter) {
            products = products.filter(
                (p) =>
                    p.category &&
                    p.category.toLowerCase() === categoryFilter.toLowerCase(),
            );
        }

        res.render("products/index", {
            products,
            selectedCategory: categoryFilter || "",
        });
    } catch (err) {
        res.status(500).render("products/index", {
            products: [],
            selectedCategory: "",
        });
    }
});

router.get("/products/new", (req, res) => {
    res.render("products/new");
});

router.get("/products/:id", async (req, res) => {
    const products = await readData("products.json");
    const product = products.find((p) => p.id === Number(req.params.id));
    if (!product) return res.status(404).send("Product not found");
    res.render("products/show", { product });
});

router.get("/login", (req, res) => res.render("login"));

module.exports = router;
