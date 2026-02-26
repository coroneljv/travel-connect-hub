import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

const BUCKET = "uploads";

/**
 * Upload a file to Supabase Storage and return the public URL.
 * @param file  The File object to upload
 * @param folder  Subfolder inside the bucket (e.g. "avatars", "posts", "courses")
 * @returns The public URL of the uploaded file, or null on error
 */
export async function uploadFile(
  file: File,
  folder: string
): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${uuidv4()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}

/**
 * Upload multiple files and return their public URLs.
 */
export async function uploadFiles(
  files: File[],
  folder: string
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadFile(file, folder);
    if (url) urls.push(url);
  }
  return urls;
}

/**
 * Delete a file from Supabase Storage by its full public URL.
 */
export async function deleteFileByUrl(publicUrl: string): Promise<boolean> {
  const match = publicUrl.match(/\/storage\/v1\/object\/public\/uploads\/(.+)$/);
  if (!match) return false;

  const { error } = await supabase.storage.from(BUCKET).remove([match[1]]);
  return !error;
}
