import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import productRouter from "./product";
import { runMigrations } from "../db/migrate";
import { closeDatabase, getDatabase } from "../db/sqlite";
import { errorHandler } from "../utils/errors";

let app: express.Express;

describe("Product API", () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Seed required foreign key: supplier id 1
    const db = await getDatabase();
    await db.run(
      "INSERT INTO suppliers (supplier_id, name, contact_person, email, phone, active, verified) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [1, "Test Supplier", "John Doe", "john@supplier.com", "555-0100", 1, 1],
    );

    // Set up express app
    app = express();
    app.use(express.json());
    app.use("/products", productRouter);
    // Attach error handler to translate repo errors
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it("should create a new product", async () => {
    const newProduct = {
      name: "Cat Food Premium",
      description: "High quality cat food",
      price: 29.99,
      imgName: "catfood.png",
      sku: "CF-001",
      unit: "bag",
      supplierId: 1,
    };
    const response = await request(app).post("/products").send(newProduct);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newProduct);
    expect(response.body.productId).toBeDefined();
  });

  it("should get all products", async () => {
    const response = await request(app).get("/products");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should get a product by ID", async () => {
    // First create a product to test getting it
    const newProduct = {
      name: "Cat Toy",
      description: "Interactive cat toy",
      price: 12.99,
      imgName: "toy.png",
      sku: "TOY-001",
      unit: "piece",
      supplierId: 1,
    };
    const createResponse = await request(app)
      .post("/products")
      .send(newProduct);
    const productId = createResponse.body.productId;

    const response = await request(app).get(`/products/${productId}`);
    expect(response.status).toBe(200);
    expect(response.body.productId).toBe(productId);
    expect(response.body.name).toBe("Cat Toy");
  });

  it("should get a product by name", async () => {
    // First create a product to test getting it
    const newProduct = {
      name: "Unique Cat Collar",
      description: "Stylish cat collar",
      price: 15.99,
      imgName: "collar.png",
      sku: "COL-001",
      unit: "piece",
      supplierId: 1,
    };
    await request(app).post("/products").send(newProduct);

    const response = await request(app).get("/products/name/Unique Cat Collar");
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Unique Cat Collar");
  });

  it("should update a product by ID", async () => {
    // First create a product to test updating it
    const newProduct = {
      name: "Original Product",
      description: "Original description",
      price: 19.99,
      imgName: "original.png",
      sku: "ORIG-001",
      unit: "piece",
      supplierId: 1,
    };
    const createResponse = await request(app)
      .post("/products")
      .send(newProduct);
    const productId = createResponse.body.productId;

    const updatedProduct = {
      ...newProduct,
      name: "Updated Product Name",
      price: 24.99,
    };
    const response = await request(app)
      .put(`/products/${productId}`)
      .send(updatedProduct);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated Product Name");
    expect(response.body.price).toBe(24.99);
  });

  it("should delete a product by ID", async () => {
    // First create a product to test deleting it
    const newProduct = {
      name: "Delete Me Product",
      description: "This product will be deleted",
      price: 9.99,
      imgName: "delete.png",
      sku: "DEL-001",
      unit: "piece",
      supplierId: 1,
    };
    const createResponse = await request(app)
      .post("/products")
      .send(newProduct);
    const productId = createResponse.body.productId;

    const response = await request(app).delete(`/products/${productId}`);
    expect(response.status).toBe(204);
  });

  it("should return 404 for non-existing product by ID", async () => {
    const response = await request(app).get("/products/999");
    expect(response.status).toBe(404);
  });

  it("should return 404 for non-existing product by name", async () => {
    const response = await request(app).get(
      "/products/name/NonExistentProduct",
    );
    expect(response.status).toBe(404);
  });

  it("should return 404 when updating non-existing product", async () => {
    const updatedProduct = {
      name: "Updated Product",
      description: "Updated description",
      price: 29.99,
      imgName: "updated.png",
      sku: "UPD-001",
      unit: "piece",
      supplierId: 1,
    };
    const response = await request(app)
      .put("/products/999")
      .send(updatedProduct);
    expect(response.status).toBe(404);
  });

  it("should return 404 when deleting non-existing product", async () => {
    const response = await request(app).delete("/products/999");
    expect(response.status).toBe(404);
  });

  it("should handle multiple products correctly", async () => {
    // Create multiple products
    const products = [
      {
        name: "Product 1",
        description: "Description 1",
        price: 10.99,
        imgName: "prod1.png",
        sku: "PROD-001",
        unit: "piece",
        supplierId: 1,
      },
      {
        name: "Product 2",
        description: "Description 2",
        price: 20.99,
        imgName: "prod2.png",
        sku: "PROD-002",
        unit: "box",
        supplierId: 1,
      },
      {
        name: "Product 3",
        description: "Description 3",
        price: 30.99,
        imgName: "prod3.png",
        sku: "PROD-003",
        unit: "bag",
        supplierId: 1,
      },
    ];

    for (const product of products) {
      await request(app).post("/products").send(product);
    }

    const response = await request(app).get("/products");
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(3);
  });
});
