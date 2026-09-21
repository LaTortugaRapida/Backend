require("dotenv").config({quiet: true});
const path = require("node:path");
const express = require("express");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");

const views = require("./routes/views");

const app = express();
const PORT = process.env.PORT;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/view", views);

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({error: "Internal server error"});
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});