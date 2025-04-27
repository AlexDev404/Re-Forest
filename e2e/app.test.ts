import { expect, test } from '@playwright/test';

test.describe('Root page', () => {
	test('home page has expected title', async ({ page }) => {
		await page.goto('/');
		await expect(await page.title()).toBe('Re:Forest :: Home');
	});
	test('home page has mapbox container', async ({ page }) => {
		await page.goto('/');
		const mapboxContent = page.locator('canvas.mapboxgl-canvas');
		await expect(mapboxContent).toBeVisible();
		console.log('Mapbox container found');
	});
});

test.describe('Manage Tree page', () => {
	test('add tree page has expected title', async ({ page }) => {
		await page.goto('/add/manage');
		await expect(await page.title()).toBe('Re:Forest :: Manage Trees > Add Tree');
	});
	test('add tree page has form elements', async ({ page }) => {
		await page.goto('/add/manage');
		const formElements = [
			page.locator('input[name="tree_name"]'),
			page.locator('input[name="tree_height"]'),
			page.locator('input[name="tree_age"]'),
			page.locator('input[name="tree_species"]')
		];

		const invisibleFormElements = [
			page.locator('input[name="tree_lat"]'),
			page.locator('input[name="tree_lng"]'),
			page.locator('input[name="tree_image"]')
		];
		for (const element of invisibleFormElements) {
			await expect(element).not.toBeVisible();
		}

		for (const element of formElements) {
			await expect(element).toBeVisible();
		}
		console.log('Form elements found');
	});

	test('image uploading capability', async ({ page }) => {
		await page.goto('/add/manage');
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles('./static/favicon.png');
		const imagePreview = page.locator('img[alt="Tree image"]');
		await expect(imagePreview).toBeVisible();
		console.log('Image upload capability passed');
	}
	);
});

test.describe('Tree Explore page', () => {
	test('tree explore page has expected title', async ({ page }) => {
		await page.goto('/explore');
		await expect(await page.title()).toBe('Re:Forest :: Explore');
		console.log('Tree explore page title passed');
	});
	test('tree explore page has <information-container/>', async ({ page }) => {
		await page.goto('/explore');
		const information_containers = page.locator('information-container');
		await expect(await information_containers.count()).toBeGreaterThanOrEqual(1);
		console.log('Tree explore page information container passed');
	});
});