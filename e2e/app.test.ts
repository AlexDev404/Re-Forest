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
	});
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

test.describe('Authentication', () => {
	test('login page has expected title and form elements', async ({ page }) => {
		await page.goto('/auth/login');
		await expect(await page.title()).toBe('Re:Forest :: Login to the site');

		// Check form elements
		const emailInput = page.locator('input[name="email"]');
		const passwordInput = page.locator('input[name="password"]');
		const loginButton = page.locator('button[type="submit"]');
		const registerLink = page.locator('a[href="/auth/register"]');

		await expect(emailInput).toBeVisible();
		await expect(passwordInput).toBeVisible();
		await expect(loginButton).toBeVisible();
		await expect(registerLink).toBeVisible();
	});

	test('register page has expected title and form elements', async ({ page }) => {
		await page.goto('/auth/register');
		await expect(await page.title()).toBe('Re:Forest :: Register an account');

		// Check form elements
		const nameInput = page.locator('input[name="name"]');
		const emailInput = page.locator('input[name="email"]');
		const passwordInput = page.locator('input[name="password"]');
		const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
		const registerButton = page.locator('button[type="submit"]');
		const loginLink = page.locator('a[href="/auth/login"]');

		await expect(nameInput).toBeVisible();
		await expect(emailInput).toBeVisible();
		await expect(passwordInput).toBeVisible();
		await expect(confirmPasswordInput).toBeVisible();
		await expect(registerButton).toBeVisible();
		await expect(loginLink).toBeVisible();
	});

	test('login flow with invalid credentials shows error', async ({ page }) => {
		await page.goto('/auth/login');

		// Fill in invalid credentials
		await page.fill('input[name="email"]', 'invalid@example.com');
		await page.fill('input[name="password"]', 'wrongpassword');

		// Submit form
		await page.click('button[type="submit"]');

		// Check for error message
		await expect(page.locator('text=Invalid email or password')).toBeVisible();
	});

	test('register flow with password mismatch shows error', async ({ page }) => {
		await page.goto('/auth/register');

		// Fill in form with mismatched passwords
		await page.fill('input[name="name"]', 'Test User');
		await page.fill('input[name="email"]', 'test@example.com');
		await page.fill('input[name="password"]', 'password123');
		await page.fill('input[name="confirmPassword"]', 'differentpassword');

		// Submit form
		await page.click('button[type="submit"]');

		// Check for error message
		await expect(page.locator("text=Passwords don't match")).toBeVisible();
	});
});

test.describe('Add/Manage Tree Page Extended Tests', () => {
	test('location is required for adding a tree', async ({ page }) => {
		// Clear localStorage to simulate no location set
		await page.evaluate(() => localStorage.removeItem('location'));

		await page.goto('/add/manage');

		// Since location is not set, the form should show a warning
		// and the Set site location button should be present
		const setLocationButton = page.locator('button:has-text("Set site location")');
		await expect(setLocationButton).toBeVisible();

		// Check if hidden inputs for lat/lng are empty or not present
		const hasLocationInputs = await page.evaluate(() => {
			const latInput = document.querySelector('input[name="tree_lat"]');
			const lngInput = document.querySelector('input[name="tree_lng"]');
			return latInput?.value && lngInput?.value;
		});

		expect(hasLocationInputs).toBeFalsy();
	});

	test('form validation works on add tree page', async ({ page }) => {
		// Set mock location in localStorage
		await page.evaluate(() => {
			localStorage.setItem(
				'location',
				JSON.stringify({
					latitude: 40.7128,
					longitude: -74.006
				})
			);
		});

		await page.goto('/add/manage');

		// Set tree image
		await page.evaluate(() => {
			const input = document.querySelector('input[type="hidden"][name="tree_image"]');
			if (input) {
				(input as HTMLInputElement).value = 'https://example.com/tree.jpg';
			}
		});

		// Submit form without filling required fields
		await page.click('button[type="submit"]');

		// Check for validation errors
		const errorMessages = await page.locator('p.text-destructive');
		await expect(errorMessages).toBeVisible();
	});
});
