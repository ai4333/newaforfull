import { createClient } from "@supabase/supabase-js";

export const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "order-files";

export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function buildStoragePath(userId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  return `${userId}/${timestamp}-${safeName}`;
}

export async function resolveStoredFileUrl(fileUrl: string) {
  if (!fileUrl.startsWith("sb://")) {
    return fileUrl;
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return fileUrl;
  }

  const withoutPrefix = fileUrl.slice(5);
  const slashIndex = withoutPrefix.indexOf("/");
  if (slashIndex <= 0) {
    return fileUrl;
  }

  const bucket = withoutPrefix.slice(0, slashIndex);
  const path = withoutPrefix.slice(slashIndex + 1);

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) {
    return fileUrl;
  }

  return data.signedUrl;
}
