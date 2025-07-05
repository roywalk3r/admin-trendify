import { NextResponse } from "next/server"
import { Client, Storage, ID } from "appwrite"

const client = new Client()
client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!).setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const storage = new Storage(client)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert the file into a Blob, then a new File object
    const arrayBuffer = await file.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: file.type })
    const newFile = new File([blob], file.name, { type: file.type })

    // Upload the converted file to Appwrite
    const response = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
      ID.unique(),
      newFile, // 👈 Properly formatted File object
    )

    return NextResponse.json({ fileId: response.$id }, { status: 200 })
  } catch (error) {
    console.error("Upload Error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
