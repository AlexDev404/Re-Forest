import { Hono } from 'hono';
import sharp from 'sharp';

const upload = new Hono();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const NHOST_STORAGE_URL =
  'https://cdbqhiieeuwfxbjbopis.storage.us-east-1.nhost.run/v1/files';
const NHOST_ADMIN_SECRET = process.env.NHOST_ADMIN_SECRET ?? '';

upload.post('/', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file provided' }, 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP' }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return c.json({ error: 'File too large. Maximum size is 10MB' }, 400);
    }

    const buffer = await file.arrayBuffer();
    const compressedBuffer = await sharp(Buffer.from(buffer))
      .resize({ width: 800 })
      .jpeg({ quality: 80 })
      .toBuffer();

    const formData = new FormData();
    formData.append('bucket-id', 'greeningbz_assets');
    formData.append(
      'metadata[]',
      new Blob([JSON.stringify({ name: file.name })], { type: 'application/json' }),
      ''
    );
    formData.append(
      'file[]',
      new Blob([new Uint8Array(compressedBuffer)], { type: 'image/jpeg' }),
      file.name
    );

    const uploadResponse = await fetch(NHOST_STORAGE_URL, {
      method: 'POST',
      headers: { 'x-hasura-admin-secret': NHOST_ADMIN_SECRET },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errText = await uploadResponse.text();
      console.error('Nhost storage error:', errText);
      return c.json({ error: 'Failed to upload file to storage' }, 500);
    }

    const result = await uploadResponse.json();
    const uploadedFile = result.processedFiles?.[0];
    const url = `${NHOST_STORAGE_URL}/${uploadedFile?.id}`;

    return c.json({ success: true, url, file: uploadedFile });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      500
    );
  }
});

export default upload;
