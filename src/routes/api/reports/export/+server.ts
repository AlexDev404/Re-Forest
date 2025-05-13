import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export async function GET(event: RequestEvent) {
	const user = event.locals.user;
	if (!user || (user.Role !== 1 && user.Role !== 2)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Get query parameters
	const reportType = event.url.searchParams.get('type') || 'tree-health';
	const format = event.url.searchParams.get('format') || 'json';

	// Get the report data from the main reports API
	const reportUrl = new URL(`${event.url.origin}/api/reports?type=${reportType}`);
	// Add user information to the request
	const response = await fetch(reportUrl.toString(), {
		headers: {
			// Pass the cookie 🍪 --> 🍪😋
			Cookie: event.request.headers.get('cookie') || ''
		}
	});
	console.log(response.status);

	if (!response.ok) {
		return json({ error: 'Failed to generate report' }, { status: 500 });
	}

	const reportData = await response.json();

	if (format === 'csv') {
		// Convert the data to CSV
		const csvHeader = `${reportData.columns[0]},${reportData.columns[1]}\n`;
		const csvRows = reportData.data
			.map((item: { label: string; value: number }) => `${item.label},${item.value}`)
			.join('\n');
		const csvContent = csvHeader + csvRows;

		// Set appropriate headers for CSV download
		const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;

		return new Response(csvContent, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': `attachment; filename="${filename}"`
			}
		});
	}

	return json(reportData);
}
