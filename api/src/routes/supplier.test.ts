import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import supplierRouter from "./supplier";
import { runMigrations } from "../db/migrate";
import { closeDatabase, getDatabase } from "../db/sqlite";
import { errorHandler } from "../utils/errors";

let app: express.Express;

describe("Supplier API", () => {
  beforeEach(async () => {
    // Ensure a fresh in-memory database for each test
    await closeDatabase();
    await getDatabase(true);
    await runMigrations(true);

    // Set up express app
    app = express();
    app.use(express.json());
    app.use("/suppliers", supplierRouter);
    // Attach error handler to translate repo errors
    app.use(errorHandler);
  });

  afterEach(async () => {
    await closeDatabase();
  });

  it("should create a new supplier", async () => {
    const newSupplier = {
      name: "Premium Cat Supplies Co",
      contactPerson: "Jane Smith",
      email: "jane@premiumcat.com",
      phone: "555-0200",

      active: true,
      verified: true,
    };
    const response = await request(app).post("/suppliers").send(newSupplier);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newSupplier);
    expect(response.body.supplierId).toBeDefined();
  });

  it("should get all suppliers", async () => {
    const response = await request(app).get("/suppliers");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should get a supplier by ID", async () => {
    // First create a supplier to test getting it
    const newSupplier = {
      name: "Test Supplier",
      contactPerson: "John Doe",
      email: "john@test.com",
      phone: "555-0100",

      active: true,
      verified: false,
    };
    const createResponse = await request(app)
      .post("/suppliers")
      .send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).get(`/suppliers/${supplierId}`);
    expect(response.status).toBe(200);
    expect(response.body.supplierId).toBe(supplierId);
    expect(response.body.name).toBe("Test Supplier");
  });

  it("should update a supplier by ID", async () => {
    // First create a supplier to test updating it
    const newSupplier = {
      name: "Original Supplier",
      contactPerson: "Original Contact",
      email: "original@supplier.com",
      phone: "555-0001",

      active: true,
      verified: false,
    };
    const createResponse = await request(app)
      .post("/suppliers")
      .send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const updatedSupplier = {
      ...newSupplier,
      name: "Updated Supplier Name",
      verified: true,
    };
    const response = await request(app)
      .put(`/suppliers/${supplierId}`)
      .send(updatedSupplier);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Updated Supplier Name");
    expect(response.body.verified).toBe(1); // SQLite returns 1 for true
  });

  it("should delete a supplier by ID", async () => {
    // First create a supplier to test deleting it
    const newSupplier = {
      name: "Delete Me Supplier",
      contactPerson: "Delete Person",
      email: "delete@supplier.com",
      phone: "555-9999",

      active: false,
      verified: false,
    };
    const createResponse = await request(app)
      .post("/suppliers")
      .send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).delete(`/suppliers/${supplierId}`);
    expect(response.status).toBe(204);
  });

  it("should return 404 for non-existing supplier", async () => {
    const response = await request(app).get("/suppliers/999");
    expect(response.status).toBe(404);
  });

  it("should return 404 when updating non-existing supplier", async () => {
    const updatedSupplier = {
      name: "Updated Supplier",
      contactPerson: "Updated Contact",
      email: "updated@supplier.com",
      phone: "555-0001",

      active: true,
      verified: true,
    };
    const response = await request(app)
      .put("/suppliers/999")
      .send(updatedSupplier);
    expect(response.status).toBe(404);
  });

  it("should return 404 when deleting non-existing supplier", async () => {
    const response = await request(app).delete("/suppliers/999");
    expect(response.status).toBe(404);
  });

  it("should get supplier status when supplier is active and verified", async () => {
    // Create an active and verified supplier
    const newSupplier = {
      name: "Active Supplier",
      contactPerson: "Active Contact",
      email: "active@supplier.com",
      phone: "555-0300",

      active: true,
      verified: true,
    };
    const createResponse = await request(app)
      .post("/suppliers")
      .send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).get(`/suppliers/${supplierId}/status`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("APPROVED");
  });

  it("should get supplier status when supplier is verified but not active", async () => {
    // Create a verified but inactive supplier
    const newSupplier = {
      name: "Inactive Supplier",
      contactPerson: "Inactive Contact",
      email: "inactive@supplier.com",
      phone: "555-0400",

      active: false,
      verified: true,
    };
    const createResponse = await request(app)
      .post("/suppliers")
      .send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).get(`/suppliers/${supplierId}/status`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("PENDING");
  });

  it("should get supplier status when supplier is neither active nor verified", async () => {
    // Create an inactive and unverified supplier
    const newSupplier = {
      name: "Pending Supplier",
      contactPerson: "Pending Contact",
      email: "pending@supplier.com",
      phone: "555-0500",

      active: false,
      verified: false,
    };
    const createResponse = await request(app)
      .post("/suppliers")
      .send(newSupplier);
    const supplierId = createResponse.body.supplierId;

    const response = await request(app).get(`/suppliers/${supplierId}/status`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("PENDING");
  });

  it("should return 404 for status of non-existing supplier", async () => {
    const response = await request(app).get("/suppliers/999/status");
    expect(response.status).toBe(404);
  });

  it("should handle multiple suppliers correctly", async () => {
    // Create multiple suppliers
    const suppliers = [
      {
        name: "Supplier 1",
        contactPerson: "Contact 1",
        email: "supplier1@test.com",
        phone: "555-0001",
        address: "111 Supplier St",
        active: true,
        verified: true,
      },
      {
        name: "Supplier 2",
        contactPerson: "Contact 2",
        email: "supplier2@test.com",
        phone: "555-0002",
        address: "222 Supplier St",
        active: false,
        verified: true,
      },
      {
        name: "Supplier 3",
        contactPerson: "Contact 3",
        email: "supplier3@test.com",
        phone: "555-0003",
        address: "333 Supplier St",
        active: true,
        verified: false,
      },
    ];

    for (const supplier of suppliers) {
      await request(app).post("/suppliers").send(supplier);
    }

    const response = await request(app).get("/suppliers");
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(3);
  });

  it("should create supplier with minimal required fields", async () => {
    const newSupplier = {
      name: "Minimal Supplier",
      contactPerson: "Min Contact",
      email: "min@supplier.com",
      phone: "555-0600",
    };
    const response = await request(app).post("/suppliers").send(newSupplier);
    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Minimal Supplier");
    expect(response.body.supplierId).toBeDefined();
  });
});
