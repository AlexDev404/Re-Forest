# Re:Forest Reports Engine

This module provides reporting capabilities for the Re:Forest application. It allows administrators and environmentalists to analyze tree planting data through various reports.

## Features

- **Dashboard Reports**: View summary statistics and key metrics
- **Interactive Charts**: Visual representation of tree data
- **Export Capabilities**: Export reports in CSV format
- **Trend Analysis**: Track planting activity over time

## User Roles

Access to the reports is restricted based on user roles:

- **Administrators** (Role ID: 1): Full access to all reports
- **Environmentalists** (Role ID: 2): Full access to all reports
- **Regular Users** (Role ID: 3): No access to reports

## Available Reports

1. **Tree Health Distribution**: Shows the distribution of trees by health status
2. **Trees by Species**: Shows the breakdown of trees by species
3. **Planting Activity**: Shows tree planting activity over time
4. **User Contributions**: Shows top contributors by number of trees planted
5. **Tree Growth**: Shows average tree height by age group

## How to Use

1. Navigate to the Reports Dashboard from the main navigation bar
2. Select a report type and time frame
3. Click "Generate Report" to view the data
4. Use the tabs to switch between chart and table views
5. Export reports as CSV files for further analysis

## Integration with Other Features

The Reports Engine integrates with:

- The Tree Management system for accessing tree data
- The User Authentication system for role-based access control
- The Export API for generating downloadable reports

## Technical Implementation

The Reports Engine uses:

- SvelteKit for the UI components
- Svelte-Charts for data visualization
- Drizzle ORM for database queries
- CSV export functionality for data portability

## Future Enhancements

- Additional report types (geographical distribution, environmental impact)
- Enhanced filtering options
- Scheduled report generation
- PDF export format
- Custom report builder
