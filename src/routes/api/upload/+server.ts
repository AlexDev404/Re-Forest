import { json } from '@sveltejs/kit';
import sharp from 'sharp';
import type { RequestHandler } from './$types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const IMGBB_API_KEY = 'b4b1966ab3854ae0983a0c0629260f23';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.formData();
		const file = data.get('file') as File;

		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}

		if (!ALLOWED_TYPES.includes(file.type)) {
			return json({ error: 'Invalid file type' }, { status: 400 });
		}

		if (file.size > MAX_FILE_SIZE) {
			return json({ error: 'File too large' }, { status: 400 });
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
			return json({ error: 'Failed to upload image' }, { status: 500 });
		}

		return json({
			success: true,
			url: uploadResult.data.url
		});
	} catch (error) {
		console.error('Image processing error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Image processing failed' },
			{ status: 500 }
		);
	}
};
