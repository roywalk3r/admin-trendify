import { Client, Storage, Databases, Account, ID, Query } from "appwrite"

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")

// Initialize Appwrite services
const storage = new Storage(client)
const databases = new Databases(client)
const account = new Account(client)

// Helper function to generate a unique ID
const uniqueId = () => ID.unique()

export { client, storage, databases, account, uniqueId, ID, Query }

