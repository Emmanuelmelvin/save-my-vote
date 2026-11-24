import { api } from './api/services'

/** Bigger than any reasonable photo or logo, even before it is shrunk. */
export const MAX_SOURCE_IMAGE_BYTES = 20 * 1024 * 1024

/** Size for an SVG that declares no width or height. */
const FALLBACK_SIDE = 512

/**
 * Scales an image down so its longer side is at most `maxSide` pixels and
 * re-encodes it as WebP (PNG where the browser can't encode WebP). Candidate
 * photos show as small circles, so a multi-megabyte phone photo becomes a few
 * dozen KB. Smaller images keep their size. SVGs become raster images, which
 * the server requires anyway (SVG can carry scripts).
 */
export async function shrinkImage(file: File, maxSide: number): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const sourceWidth = image.naturalWidth || FALLBACK_SIDE
    const sourceHeight = image.naturalHeight || FALLBACK_SIDE
    const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight))

    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(sourceWidth * scale))
    canvas.height = Math.max(1, Math.round(sourceHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is not available')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the image'))),
        'image/webp',
        0.85,
      )
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Shrinks the image, uploads it, and returns its public URL. */
export async function uploadImage(file: File, maxSide: number): Promise<string> {
  const blob = await shrinkImage(file, maxSide)
  const extension = blob.type === 'image/webp' ? 'webp' : 'png'
  return api.uploads.image(blob, `image.${extension}`)
}
