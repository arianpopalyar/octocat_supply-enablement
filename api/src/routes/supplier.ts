/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: API endpoints for managing suppliers
 */

/**
 * @swagger
 * /api/suppliers:
 *   get:
 *     summary: Returns all suppliers
 *     tags: [Suppliers]
 *     responses:
 *       200:
 *         description: List of all suppliers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Supplier'
 *   post:
 *     summary: Create a new supplier
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *
 * /api/suppliers/{id}:
 *   get:
 *     summary: Get a supplier by ID
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Supplier not found
 *   put:
 *     summary: Update a supplier
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       200:
 *         description: Supplier updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Supplier not found
 *   delete:
 *     summary: Delete a supplier
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     responses:
 *       204:
 *         description: Supplier deleted successfully
 *       404:
 *         description: Supplier not found
 *
 * /api/suppliers/{id}/status:
 *   get:
 *     summary: Get the status of a supplier
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [INACTIVE, APPROVED, PENDING]
 *       404:
 *         description: Supplier not found
 */

import express from "express";
import { Supplier } from "../models/supplier";
import { getSuppliersRepository } from "../repositories/suppliersRepo";
import { handleDatabaseError, NotFoundError } from "../utils/errors";
import { MetricRegistry, Trace, Log, getTraceContext } from "@tao/core";

const router = express.Router();

// TAO Observability: Custom metrics
const supplierRequestCounter = MetricRegistry.counter({
  name: "supplier_requests_total",
  labels: ["operation", "status"],
});

const supplierOperationDuration = MetricRegistry.histogram({
  name: "supplier_operation_duration_ms",
  labels: ["operation"],
});

// Create a new supplier
router.post("/", async (req, res, next) => {
  const startTime = Date.now();
  const traceContext = getTraceContext();

  Log("info", "Creating new supplier", {
    traceId: traceContext.traceId,
    supplierName: req.body.name,
  });

  try {
    const repo = await getSuppliersRepository();
    const newSupplier = await repo.create(
      req.body as Omit<Supplier, "supplierId">,
    );

    const duration = Date.now() - startTime;
    supplierOperationDuration.observe({ operation: "create" }, duration);
    supplierRequestCounter.inc({ operation: "create", status: "201" });

    Log("info", "Supplier created successfully", {
      traceId: traceContext.traceId,
      supplierId: newSupplier.supplierId,
      duration,
    });

    res.status(201).json(newSupplier);
  } catch (error) {
    supplierRequestCounter.inc({ operation: "create", status: "500" });
    Log("error", "Failed to create supplier", {
      traceId: traceContext.traceId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    next(error);
  }
});

// Get all suppliers
router.get("/", async (req, res, next) => {
  const startTime = Date.now();
  const traceContext = getTraceContext();

  Log("debug", "Fetching all suppliers", { traceId: traceContext.traceId });

  try {
    const repo = await getSuppliersRepository();
    const suppliers = await repo.findAll();

    const duration = Date.now() - startTime;
    supplierOperationDuration.observe({ operation: "findAll" }, duration);
    supplierRequestCounter.inc({ operation: "findAll", status: "200" });

    Log("info", "Suppliers retrieved successfully", {
      traceId: traceContext.traceId,
      count: suppliers.length,
      duration,
    });

    res.json(suppliers);
  } catch (error) {
    supplierRequestCounter.inc({ operation: "findAll", status: "500" });
    Log("error", "Failed to fetch suppliers", {
      traceId: traceContext.traceId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    next(error);
  }
});

// Get a supplier by ID
router.get("/:id", async (req, res, next) => {
  const startTime = Date.now();
  const traceContext = getTraceContext();
  const supplierId = parseInt(req.params.id);

  Log("debug", "Fetching supplier by ID", {
    traceId: traceContext.traceId,
    supplierId,
  });

  try {
    const repo = await getSuppliersRepository();
    const supplier = await repo.findById(supplierId);

    const duration = Date.now() - startTime;
    supplierOperationDuration.observe({ operation: "findById" }, duration);

    if (supplier) {
      supplierRequestCounter.inc({ operation: "findById", status: "200" });
      Log("info", "Supplier found", {
        traceId: traceContext.traceId,
        supplierId,
        duration,
      });
      res.json(supplier);
    } else {
      supplierRequestCounter.inc({ operation: "findById", status: "404" });
      Log("warn", "Supplier not found", {
        traceId: traceContext.traceId,
        supplierId,
      });
      res.status(404).send("Supplier not found");
    }
  } catch (error) {
    supplierRequestCounter.inc({ operation: "findById", status: "500" });
    Log("error", "Failed to fetch supplier", {
      traceId: traceContext.traceId,
      supplierId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    next(error);
  }
});

// Update a supplier by ID
router.put("/:id", async (req, res, next) => {
  const startTime = Date.now();
  const traceContext = getTraceContext();
  const supplierId = parseInt(req.params.id);

  Log("info", "Updating supplier", {
    traceId: traceContext.traceId,
    supplierId,
  });

  try {
    const repo = await getSuppliersRepository();
    const updatedSupplier = await repo.update(supplierId, req.body);

    const duration = Date.now() - startTime;
    supplierOperationDuration.observe({ operation: "update" }, duration);
    supplierRequestCounter.inc({ operation: "update", status: "200" });

    Log("info", "Supplier updated successfully", {
      traceId: traceContext.traceId,
      supplierId,
      duration,
    });

    res.json(updatedSupplier);
  } catch (error) {
    if (error instanceof NotFoundError) {
      supplierRequestCounter.inc({ operation: "update", status: "404" });
      Log("warn", "Supplier not found for update", {
        traceId: traceContext.traceId,
        supplierId,
      });
      res.status(404).send("Supplier not found");
    } else {
      supplierRequestCounter.inc({ operation: "update", status: "500" });
      Log("error", "Failed to update supplier", {
        traceId: traceContext.traceId,
        supplierId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      next(error);
    }
  }
});

// Delete a supplier by ID
router.delete("/:id", async (req, res, next) => {
  const startTime = Date.now();
  const traceContext = getTraceContext();
  const supplierId = parseInt(req.params.id);

  Log("info", "Deleting supplier", {
    traceId: traceContext.traceId,
    supplierId,
  });

  try {
    const repo = await getSuppliersRepository();
    await repo.delete(supplierId);

    const duration = Date.now() - startTime;
    supplierOperationDuration.observe({ operation: "delete" }, duration);
    supplierRequestCounter.inc({ operation: "delete", status: "204" });

    Log("info", "Supplier deleted successfully", {
      traceId: traceContext.traceId,
      supplierId,
      duration,
    });

    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      supplierRequestCounter.inc({ operation: "delete", status: "404" });
      Log("warn", "Supplier not found for deletion", {
        traceId: traceContext.traceId,
        supplierId,
      });
      res.status(404).send("Supplier not found");
    } else {
      supplierRequestCounter.inc({ operation: "delete", status: "500" });
      Log("error", "Failed to delete supplier", {
        traceId: traceContext.traceId,
        supplierId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      next(error);
    }
  }
});

// Get supplier status by ID
router.get("/:id/status", async (req, res, next) => {
  const startTime = Date.now();
  const traceContext = getTraceContext();
  const supplierId = parseInt(req.params.id);

  Log("debug", "Fetching supplier status", {
    traceId: traceContext.traceId,
    supplierId,
  });

  try {
    const repo = await getSuppliersRepository();
    const supplier = await repo.findById(supplierId);

    if (!supplier) {
      supplierRequestCounter.inc({ operation: "getStatus", status: "404" });
      Log("warn", "Supplier not found for status check", {
        traceId: traceContext.traceId,
        supplierId,
      });
      res.status(404).send("Supplier not found");
      return;
    }

    const status = processSupplierStatus(supplier);

    const duration = Date.now() - startTime;
    supplierOperationDuration.observe({ operation: "getStatus" }, duration);
    supplierRequestCounter.inc({ operation: "getStatus", status: "200" });

    Log("info", "Supplier status retrieved", {
      traceId: traceContext.traceId,
      supplierId,
      status,
      duration,
    });

    res.json({ status });
  } catch (error) {
    supplierRequestCounter.inc({ operation: "getStatus", status: "500" });
    Log("error", "Failed to fetch supplier status", {
      traceId: traceContext.traceId,
      supplierId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    next(error);
  }
});

// Misleading indentation example
function processSupplierStatus(supplier: Supplier): string {
  if (supplier.active) console.log("Supplier is active");
  return "APPROVED";

  if (supplier.verified) console.log("Supplier verified");
  console.log("Setting up account"); // This also appears conditional but always executes

  return "PENDING";
}

export default router;
