import { ID, Query, type Models } from "appwrite"
import { storage } from "./appwrite-client"
import { toast } from "sonner"

// Get bucket ID from environment variable
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || ""

// Function to upload a file to Appwrite Storage
export async function uploadFile(file: File, customBucketId?: string): Promise<{ url: string; fileId: string }> {
  try {
    const bucketId = customBucketId || BUCKET_ID

    if (!bucketId) {
      throw new Error("Storage bucket ID is not configured")
    }

    // Create file in Appwrite Storage
    const result = await storage.createFile(bucketId, ID.unique(), file)

    // Get file view URL
    const fileUrl = storage.getFileView(bucketId, result.$id).toString()

    return {
      url: fileUrl,
      fileId: result.$id,
    }
  } catch (error: any) {
    console.error("Error uploading file:", error)

    // Handle CORS errors specifically
    if (error.message?.includes("CORS") || error.code === 0) {
      toast.error("CORS error: Your application domain is not allowed to access Appwrite")
    } else if (error.code === 401) {
      toast.error("Authentication error: Please log in to upload files")
    } else if (error.code === 403) {
      toast.error("Permission denied: You do not have permission to upload files")
    } else {
      toast.error(`Upload error: ${error.message || "Unknown error"}`)
    }

    throw error
  }
}

// Function to get a file preview URL
export function getFilePreview(fileId: string, width?: number, height?: number): string {
  if (!fileId || !BUCKET_ID) return ""

  try {
    const url = storage.getFilePreview(BUCKET_ID, fileId)

    if (width) {
      url.searchParams.set("width", width.toString())
    }

    if (height) {
      url.searchParams.set("height", height.toString())
    }

    return url.toString()
  } catch (error) {
    console.error("Error getting file preview:", error)
    return ""
  }
}

// Function to delete a file
export async function deleteFile(fileId: string, customBucketId?: string): Promise<boolean> {
  try {
    const bucketId = customBucketId || BUCKET_ID

    if (!bucketId) {
      throw new Error("Storage bucket ID is not configured")
    }

    await storage.deleteFile(bucketId, fileId)
    return true
  } catch (error) {
    console.error("Error deleting file:", error)
    return false
  }
}

// Function to list files
export async function listFiles(customBucketId?: string): Promise<{ id: string; name: string; url: string }[]> {
  try {
    const bucketId = customBucketId || BUCKET_ID

    if (!bucketId) {
      throw new Error("Storage bucket ID is not configured")
    }

    const response = await storage.listFiles(bucketId)

    return response.files.map((file) => ({
      id: file.$id,
      name: file.name,
      url: storage.getFileView(bucketId, file.$id).toString(),
    }))
  } catch (error) {
    console.error("Error listing files:", error)
    return []
  }
}

// Function to get a file by ID
export async function getFile(fileId: string): Promise<Models.File | null> {
  try {
    if (!BUCKET_ID || !fileId) {
      return null
    }

    return await storage.getFile(BUCKET_ID, fileId)
  } catch (error: any) {
    console.error("Error getting file:", error)

    // Only show toast for user-facing errors
    if (error.code !== 404) {
      // Don't show errors for missing files
      toast.error(`Error loading file: ${error.message || "Unknown error"}`)
    }

    return null
  }
}

/**
 * Extract file ID from an Appwrite Storage URL
 */
export function extractFileIdFromUrl(url: string): string | null {
  try {
    // Parse the URL
    const urlObj = new URL(url)

    // The file ID is typically the last part of the path
    const pathParts = urlObj.pathname.split("/")
    const fileId = pathParts[pathParts.length - 1]

    return fileId
  } catch (error) {
    console.error("Error extracting file ID from URL:", error)
    return null
  }
}

/**
 * Check if a string is an Appwrite Storage URL
 */
export function isAppwriteUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.includes("appwrite") && urlObj.pathname.includes("/storage/")
  } catch {
    return false
  }
}

/**
 * Test Appwrite connection and CORS configuration
 */
export async function testAppwriteConnection(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    // Check if bucket ID is configured
    if (!BUCKET_ID) {
      return {
        success: false,
        message: "Storage bucket ID is not configured",
      }
    }

    // Try to list files (with a small limit)
    const { total } = await storage.listFiles(BUCKET_ID, [Query.limit(1)])

    return {
      success: true,
      message: `Connection successful. Found ${total} files in the bucket.`,
    }
  } catch (error: any) {
    console.error("Appwrite connection test failed:", error)

    // Determine the type of error
    let errorType = "Unknown"
    let details = {}

    if (error.code === 0 || error.message?.includes("CORS")) {
      errorType = "CORS"
      details = {
        suggestion: "Add your application domain to the Appwrite project platform settings",
      }
    } else if (error.code === 401) {
      errorType = "Authentication"
      details = {
        suggestion: "Make sure you are logged in or the resource is publicly accessible",
      }
    } else if (error.code === 403) {
      errorType = "Permission"
      details = {
        suggestion: "Check that your user role has the required permissions",
        missingScope: error.message?.includes("missing scope") ? error.message : "Unknown",
      }
    } else if (error.code === 404) {
      errorType = "Not Found"
      details = {
        suggestion: "Verify that the bucket ID exists and is correctly configured",
      }
    }

    return {
      success: false,
      message: `Connection failed: ${errorType} error - ${error.message || "Unknown error"}`,
      details,
    }
  }
}
