import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFactorySchema, insertNetworkSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/factories", async (req, res) => {
    try {
      const factories = await storage.getAllFactories();
      res.json(factories);
    } catch (error) {
      console.error("Error fetching factories:", error);
      res.status(500).json({ error: "Failed to fetch factories" });
    }
  });

  app.get("/api/factories/:id", async (req, res) => {
    try {
      const factory = await storage.getFactory(req.params.id);
      if (!factory) {
        return res.status(404).json({ error: "Factory not found" });
      }
      res.json(factory);
    } catch (error) {
      console.error("Error fetching factory:", error);
      res.status(500).json({ error: "Failed to fetch factory" });
    }
  });

  app.post("/api/factories", async (req, res) => {
    try {
      const cleanedData = {
        ...req.body,
        latitude: req.body.latitude === "" ? null : req.body.latitude,
        longitude: req.body.longitude === "" ? null : req.body.longitude,
        photo1: req.body.photo1 === "" ? null : req.body.photo1,
        photo2: req.body.photo2 === "" ? null : req.body.photo2,
        photo3: req.body.photo3 === "" ? null : req.body.photo3,
      };
      const validatedData = insertFactorySchema.parse(cleanedData);
      const factory = await storage.createFactory(validatedData);
      res.status(201).json(factory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating factory:", error);
      res.status(500).json({ error: "Failed to create factory" });
    }
  });

  app.put("/api/factories/:id", async (req, res) => {
    try {
      const cleanedData = {
        ...req.body,
        latitude: req.body.latitude === "" ? null : req.body.latitude,
        longitude: req.body.longitude === "" ? null : req.body.longitude,
        photo1: req.body.photo1 === "" ? null : req.body.photo1,
        photo2: req.body.photo2 === "" ? null : req.body.photo2,
        photo3: req.body.photo3 === "" ? null : req.body.photo3,
      };
      const validatedData = insertFactorySchema.partial().parse(cleanedData);
      const factory = await storage.updateFactory(req.params.id, validatedData);
      if (!factory) {
        return res.status(404).json({ error: "Factory not found" });
      }
      res.json(factory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating factory:", error);
      res.status(500).json({ error: "Failed to update factory" });
    }
  });

  app.delete("/api/factories/:id", async (req, res) => {
    try {
      const success = await storage.deleteFactory(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Factory not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting factory:", error);
      res.status(500).json({ error: "Failed to delete factory" });
    }
  });

  app.get("/api/networks", async (req, res) => {
    try {
      const networks = await storage.getAllNetworks();
      res.json(networks);
    } catch (error) {
      console.error("Error fetching networks:", error);
      res.status(500).json({ error: "Failed to fetch networks" });
    }
  });

  app.get("/api/networks/:id", async (req, res) => {
    try {
      const network = await storage.getNetwork(req.params.id);
      if (!network) {
        return res.status(404).json({ error: "Network not found" });
      }
      res.json(network);
    } catch (error) {
      console.error("Error fetching network:", error);
      res.status(500).json({ error: "Failed to fetch network" });
    }
  });

  app.post("/api/networks", async (req, res) => {
    try {
      const validatedData = insertNetworkSchema.parse(req.body);
      const network = await storage.createNetwork(validatedData);
      res.status(201).json(network);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating network:", error);
      res.status(500).json({ error: "Failed to create network" });
    }
  });

  app.put("/api/networks/:id", async (req, res) => {
    try {
      const validatedData = insertNetworkSchema.partial().parse(req.body);
      const network = await storage.updateNetwork(req.params.id, validatedData);
      if (!network) {
        return res.status(404).json({ error: "Network not found" });
      }
      res.json(network);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating network:", error);
      res.status(500).json({ error: "Failed to update network" });
    }
  });

  app.delete("/api/networks/:id", async (req, res) => {
    try {
      const success = await storage.deleteNetwork(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Network not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting network:", error);
      res.status(500).json({ error: "Failed to delete network" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const result = await objectStorageService.getObjectEntityUploadURL();
      res.json(result);
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
