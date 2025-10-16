import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  constructor() {}

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    return paths;
  }

  getPrivateObjectDir(): string {
    return process.env.PRIVATE_OBJECT_DIR || "";
  }

  async searchPublicObject(filePath: string): Promise<File | null> {
    const searchPaths = this.getPublicObjectSearchPaths();
    for (const searchPath of searchPaths) {
      const fullPath = `${searchPath}/${filePath}`;
      const file = objectStorageClient.bucket("").file(fullPath);
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }

  async getObjectEntityFile(objectPath: string): Promise<File> {
    const normalizedPath = this.normalizeObjectEntityPath(objectPath);
    const file = objectStorageClient.bucket("").file(normalizedPath);
    const [exists] = await file.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return file;
  }

  normalizeObjectEntityPath(urlOrPath: string): string {
    const privateDir = this.getPrivateObjectDir();
    if (urlOrPath.startsWith("/objects/")) {
      return `${privateDir}/${urlOrPath.replace("/objects/", "")}`;
    }
    if (urlOrPath.startsWith(privateDir)) {
      return urlOrPath;
    }
    return `${privateDir}/${urlOrPath}`;
  }

  async getObjectEntityUploadURL(): Promise<{ uploadURL: string; filePath: string }> {
    const privateDir = this.getPrivateObjectDir();
    const fileName = `${randomUUID()}`;
    const filePath = `${privateDir}/${fileName}`;
    const file = objectStorageClient.bucket("").file(filePath);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: "image/*",
    });

    return {
      uploadURL: url,
      filePath: `/objects/${fileName}`,
    };
  }

  downloadObject(file: File, res: Response): void {
    const readStream = file.createReadStream();
    readStream.on("error", (error) => {
      console.error("Error streaming object:", error);
      res.status(500).json({ error: "Failed to stream object" });
    });
    readStream.pipe(res);
  }
}
