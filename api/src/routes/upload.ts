import { Hono } from 'hono';
import sharp from 'sharp';

const upload = new Hono();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const IMGBB_API_KEY = 'b4b1966ab3854ae0983a0c0629260f23';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

/**
 * POST /upload - Upload and compress image
 */
upload.post('/', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file provided' }, 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return c.json({ error: 'Invalid file type' }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return c.json({ error: 'File too large' }, 400);
    }

    // Compress the image
    const buffer = await file.arrayBuffer();
    const compressedBuffer = await sharp(Buffer.from(buffer))
      .resize({ width: 800 })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Prepare form data for imgbb
    const formData = new FormData();
    formData.append('image', new Blob([compressedBuffer], { type: 'image/jpeg' }));

    // Upload to imgbb
    const uploadResponse = await fetch(`${IMGBB_API_URL}?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData
    });

    const uploadResult = await uploadResponse.json();

    if (!uploadResult.success) {
      return c.json({ error: 'Failed to upload image' }, 500);
    }

    return c.json({ success: true, url: uploadResult.data.url });
  } catch (error) {
    console.error('Image processing error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Image processing failed' },
      500
    );
  }
});

export default upload;
