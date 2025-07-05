import { Client, Storage, ID } from "appwrite"

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")

// Initialize the Storage service
const storage = new Storage(client)

// Function to upload a file to Appwrite Storage
export async function uploadFile(file: File) {
  try {
    const result = await storage.createFile(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "", ID.unique(), file)

    // Generate the file URL
    const fileUrl = getFilePreview(result.$id)
    return { id: result.$id, url: fileUrl }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// Function to get a file preview URL
export function getFilePreview(fileId: string) {
  return storage.getFilePreview(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "", fileId).href
}

// Function to delete a file from Appwrite Storage
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "", fileId)
    return { success: true }
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

export { client, storage }
