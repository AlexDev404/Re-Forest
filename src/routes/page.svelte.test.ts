import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Page from './+page.svelte';
import AddManagePage from './add/manage/+page.svelte';
import { actions } from './add/manage/+page.server';

describe('/+page.svelte', () => {
	test('should render h1', () => {
		render(Page);
		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});
});

describe('/add/manage/+page.svelte', () => {
	test('should render Add Tree form', () => {
		render(AddManagePage);
		expect(screen.getByText('Add Tree')).toBeInTheDocument();
		expect(screen.getByLabelText('Tree Name')).toBeInTheDocument();
		expect(screen.getByLabelText('Height (in meters)')).toBeInTheDocument();
		expect(screen.getByLabelText('Age (in years)')).toBeInTheDocument();
		expect(screen.getByLabelText('Species')).toBeInTheDocument();
	});

	test('should submit form and call createTree action', async () => {
		render(AddManagePage);

		const treeNameInput = screen.getByLabelText('Tree Name');
		const heightInput = screen.getByLabelText('Height (in meters)');
		const ageInput = screen.getByLabelText('Age (in years)');
		const speciesInput = screen.getByLabelText('Species');
		const submitButton = screen.getByText('Submit');

		await fireEvent.input(treeNameInput, { target: { value: 'Test Tree' } });
		await fireEvent.input(heightInput, { target: { value: '10' } });
		await fireEvent.input(ageInput, { target: { value: '5' } });
		await fireEvent.input(speciesInput, { target: { value: 'Test Species' } });

		await fireEvent.click(submitButton);

		expect(actions.createTree).toHaveBeenCalled();
	});

	test('should handle image upload', async () => {
		render(AddManagePage);

		const fileInput = screen.getByLabelText('Select from your gallery');
		const file = new File(['dummy content'], 'example.png', { type: 'image/png' });

		await fireEvent.change(fileInput, { target: { files: [file] } });

		expect(screen.getByAltText('Tree image')).toBeInTheDocument();
	});
});
