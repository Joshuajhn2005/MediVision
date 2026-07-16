/**
 * Upload Service
 *
 * Handle file validation and upload operations.
 * Supports multiple file formats with future extensibility.
 */

import type { FileValidation } from '@/lib/types/api'

/**
 * Supported file formats
 */
export const SUPPORTED_FORMATS = {
  png: { mime: 'image/png', extensions: ['.png'] },
  jpeg: { mime: 'image/jpeg', extensions: ['.jpg', '.jpeg'] },
  dicom: { mime: 'application/dicom', extensions: ['.dcm'] },
  tiff: { mime: 'image/tiff', extensions: ['.tif', '.tiff'] },
  nifti: { mime: 'application/x-nifti', extensions: ['.nii', '.nii.gz'] },
}

/**
 * Maximum file size (100MB)
 */
export const MAX_FILE_SIZE = 104857600

/**
 * Magic numbers for file type detection
 */
const MAGIC_NUMBERS: Record<string, Uint8Array> = {
  dicom: new Uint8Array([0x44, 0x49, 0x43, 0x4d]), // "DICM" at offset 128
  png: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
  jpeg: new Uint8Array([0xff, 0xd8, 0xff]),
  tiff_ii: new Uint8Array([0x49, 0x49, 0x2a, 0x00]), // Little-endian
  tiff_mm: new Uint8Array([0x4d, 0x4d, 0x00, 0x2a]), // Big-endian
  nifti: new Uint8Array([0x6e, 0x2b, 0x31, 0x00]), // "n+1" in .nii files
}

/**
 * Validate file format by magic numbers
 */
async function validateMagicNumbers(file: File): Promise<string | null> {
  const buffer = await file.slice(0, 512).arrayBuffer()
  const view = new Uint8Array(buffer)

  // Check for DICOM (magic number at offset 128)
  if (buffer.byteLength >= 132) {
    const dicomMagic = new Uint8Array(buffer, 128, 4)
    if (
      dicomMagic[0] === 0x44 &&
      dicomMagic[1] === 0x49 &&
      dicomMagic[2] === 0x43 &&
      dicomMagic[3] === 0x4d
    ) {
      return 'dicom'
    }
  }

  // Check for PNG
  if (
    view[0] === 0x89 &&
    view[1] === 0x50 &&
    view[2] === 0x4e &&
    view[3] === 0x47
  ) {
    return 'png'
  }

  // Check for JPEG
  if (view[0] === 0xff && view[1] === 0xd8 && view[2] === 0xff) {
    return 'jpeg'
  }

  // Check for TIFF (both byte orders)
  if (
    (view[0] === 0x49 &&
      view[1] === 0x49 &&
      view[2] === 0x2a &&
      view[3] === 0x00) ||
    (view[0] === 0x4d &&
      view[1] === 0x4d &&
      view[2] === 0x00 &&
      view[3] === 0x2a)
  ) {
    return 'tiff'
  }

  // Check for NIfTI
  if (
    view[0] === 0x6e &&
    view[1] === 0x2b &&
    view[2] === 0x31 &&
    view[3] === 0x00
  ) {
    return 'nifti'
  }

  return null
}

/**
 * Validate file format by extension
 */
function validateExtension(file: File): string | null {
  const name = file.name.toLowerCase()

  for (const [format, config] of Object.entries(SUPPORTED_FORMATS)) {
    if (config.extensions.some((ext) => name.endsWith(ext))) {
      return format
    }
  }

  return null
}

/**
 * Comprehensive file validation
 */
export async function validateFile(file: File): Promise<FileValidation> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
    }
  }

  // Check file extension first
  const extensionFormat = validateExtension(file)

  // Try magic number validation
  const magicFormat = await validateMagicNumbers(file)

  const detectedFormat = magicFormat || extensionFormat

  if (!detectedFormat) {
    return {
      valid: false,
      error:
        'Unsupported file format. Please upload PNG, JPEG, DICOM, TIFF, or NIfTI.',
    }
  }

  return {
    valid: true,
    modality: undefined, // Modality detection handled separately
  }
}

/**
 * Get file format display name
 */
export function getFormatDisplayName(format: string): string {
  const names: Record<string, string> = {
    png: 'PNG Image',
    jpeg: 'JPEG Image',
    dicom: 'DICOM Image',
    tiff: 'TIFF Image',
    nifti: 'NIfTI Volume',
  }
  return names[format] || format.toUpperCase()
}

/**
 * Check if file requires server preprocessing
 */
export function requiresPreprocessing(file: File): boolean {
  // Only standard images don't need preprocessing
  // DICOM, NIfTI, multi-frame TIFF may need it
  const name = file.name.toLowerCase()
  return (
    name.endsWith('.dcm') ||
    name.endsWith('.nii') ||
    name.endsWith('.nii.gz') ||
    file.size > 10 * 1024 * 1024
  ) // > 10MB
}
