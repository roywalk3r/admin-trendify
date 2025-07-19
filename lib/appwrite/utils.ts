import { Client, Storage, ID, Query } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const storage = new Storage(client);

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
  preview?: string;
}

export async function uploadToAppwrite(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ id: string; url: string }> {
  try {
    const fileId = ID.unique();

    const uploadedFile = await storage.createFile(
      BUCKET_ID,
      fileId,
      file,
      undefined,
      onProgress
        ? (progress) => {
            const percentage = Math.round(
              (progress.chunksUploaded / progress.chunksTotal) * 100
            );
            onProgress(percentage);
          }
        : undefined
    );

    const fileUrl = storage.getFileView(BUCKET_ID, uploadedFile.$id);

    return {
      id: uploadedFile.$id,
      url: fileUrl.toString(),
    };
  } catch (error) {
    console.error("Upload failed:", error);
    throw new Error("Failed to upload file");
  }
}

export async function getMediaFiles(): Promise<MediaFile[]> {
  try {
    const response = await storage.listFiles(BUCKET_ID, [
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);

    return response.files
      .filter((file) => !file.mimeType.includes("svg"))
      .map((file) => ({
        id: file.$id,
        name: file.name,
        url: storage.getFileView(BUCKET_ID, file.$id).toString(),
        type: file.mimeType,
        size: file.sizeOriginal,
        createdAt: file.$createdAt,
        preview: file.mimeType.startsWith("image/")
          ? storage.getFileView(BUCKET_ID, file.$id).toString()
          : undefined,
      }));
  } catch (error) {
    console.error("Failed to fetch files:", error);
    throw new Error("Failed to fetch media files");
  }
}

export async function deleteMediaFile(fileId: string): Promise<void> {
  try {
    await storage.deleteFile(BUCKET_ID, fileId);
  } catch (error) {
    console.error("Failed to delete file:", error);
    throw new Error("Failed to delete file");
  }
}

export async function getFileUrl(fileId: string): Promise<string> {
  return storage.getFileView(BUCKET_ID, fileId).toString();
}

export async function getFilePreview(
  fileId: string,
  width = 300,
  height = 300
): Promise<string> {
  return storage.getFilePreview(BUCKET_ID, fileId, width, height).toString();
}
