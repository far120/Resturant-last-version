require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../src/models/category");
const Product = require("../src/models/product");

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedProductsAndCategories() {
  try {
    const mongoUri = "mongodb://localhost:27017/Restaurant";
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    await mongoose.connect(mongoUri);

    await Product.deleteMany({});
    await Category.deleteMany({});

    const categories = Array.from({ length: 50 }, (_, index) => ({
      name: `Category ${index + 1}`,
    }));

    const insertedCategories = await Category.insertMany(categories);

    const products = insertedCategories.map((category, index) => {
      const stock = randomBetween(0, 40);
      return {
        name: `Product ${index + 1}`,
        description: `Fresh menu item number ${index + 1}`,
        price: randomBetween(10, 200),
        stock,
        category: category._id,
        image: "default.png",
      };
    });

    await Product.insertMany(products);

    console.log("Seed completed successfully");
    console.log(`Categories inserted: ${insertedCategories.length}`);
    console.log(`Products inserted: ${products.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeder failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedProductsAndCategories();
