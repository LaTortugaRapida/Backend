require("dotenv").config({quiet: true});
const express = require("express");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({error: "Internal server error"});
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});