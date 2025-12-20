"use strict"

import fs from "fs"
import path from "path"
import sharp from "sharp"

const projectRoot = process.cwd()
const logoPath = path.join(projectRoot, "public", "images", "logo.svg")

const brandBg = "#000000"
const iconTargets = [
  { file: "android-chrome-192x192.png", size: 192 },
  { file: "android-chrome-512x512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
]

const splashTargets = [
  { file: "splash-1280x720.png", width: 1280, height: 720 },
  { file: "splash-1920x1080.png", width: 1920, height: 1080 },
]

async function ensureLogo() {
  if (!fs.existsSync(logoPath)) {
    throw new Error(`Logo not found at ${logoPath}`)
  }
}

async function generateIcons() {
  await Promise.all(
    iconTargets.map(async ({ file, size }) => {
      const logoBuffer = await sharp(logoPath)
        .resize(Math.round(size * 0.64), Math.round(size * 0.64), { fit: "contain" })
        .toBuffer()

      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite([{ input: logoBuffer, gravity: "center" }])
        .png()
        .toFile(path.join(projectRoot, "public", file))
    }),
  )
}

async function generateSplash() {
  await Promise.all(
    splashTargets.map(async ({ file, width, height }) => {
      const logoMax = Math.round(Math.min(width, height) * 0.35)
      const logoBuffer = await sharp(logoPath)
        .resize(logoMax, logoMax, { fit: "contain" })
        .toBuffer()

      await sharp({
        create: {
          width,
          height,
          channels: 4,
          background: brandBg,
        },
      })
        .composite([{ input: logoBuffer, gravity: "center" }])
        .png()
        .toFile(path.join(projectRoot, "public", file))
    }),
  )
}

async function main() {
  await ensureLogo()
  await generateIcons()
  await generateSplash()
  console.log("Generated PWA icons and splash screens.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
