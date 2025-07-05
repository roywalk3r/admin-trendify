import { Client, Storage, Account } from "appwrite"

// Create a single instance of the client to be used throughout the app
const client = new Client()

// Initialize the client with the project details
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")

// Initialize services
export const storage = new Storage(client)
export const account = new Account(client)

// Export the client for use in other files
export default client

