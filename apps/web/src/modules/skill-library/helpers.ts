export function isZipFileName(fileName: string): boolean {
  return fileName.trim().toLowerCase().endsWith(".zip");
}

export function skillNameFromZip(fileName: string): string {
  const base = fileName.trim().replace(/\.zip$/iu, "");
  return base.length > 0 ? base : "Uploaded skill";
}
