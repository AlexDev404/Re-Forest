import { Hono } from 'hono';
import type { UserData } from '../repositories/UserRepository';
import { TreeRepository } from '../repositories/TreeRepository';

const reports = new Hono();

/**
 * GET /reports - Generate report data
 */
reports.get('/', async (c) => {
  const user = c.get('user') as UserData | null;
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  if (user.Role !== 1 && user.Role !== 2) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const reportType = c.req.query('type') || 'tree-health';
  const timeFrame = c.req.query('timeFrame') || 'all-time';

  let startDate: Date | null = null;
  const now = new Date();

  if (timeFrame !== 'all-time') {
    startDate = new Date();
    switch (timeFrame) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
  }

  try {
    switch (reportType) {
      case 'tree-health':
        return c.json(await TreeRepository.getTreeHealthReport(startDate));
      case 'trees-by-species':
        return c.json(await TreeRepository.getTreesBySpeciesReport(startDate));
      case 'planting-activity':
        return c.json(await TreeRepository.getPlantingActivityReport(startDate));
      case 'user-contributions':
        return c.json(await TreeRepository.getUserContributionsReport(startDate));
      case 'tree-growth':
        return c.json(await TreeRepository.getTreeGrowthReport(startDate));
      default:
        return c.json({ error: 'Invalid report type' }, 400);
    }
  } catch (error) {
    console.error(`Error generating ${reportType} report:`, error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

/**
 * GET /reports/export - Export report as CSV or JSON
 */
reports.get('/export', async (c) => {
  const user = c.get('user') as UserData | null;
  if (!user || (user.Role !== 1 && user.Role !== 2)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const reportType = c.req.query('type') || 'tree-health';
  const format = c.req.query('format') || 'json';
  const timeFrame = c.req.query('timeFrame') || 'all-time';

  let startDate: Date | null = null;
  const now = new Date();

  if (timeFrame !== 'all-time') {
    startDate = new Date();
    switch (timeFrame) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
  }

  try {
    let reportData;
    switch (reportType) {
      case 'tree-health':
        reportData = await TreeRepository.getTreeHealthReport(startDate);
        break;
      case 'trees-by-species':
        reportData = await TreeRepository.getTreesBySpeciesReport(startDate);
        break;
      case 'planting-activity':
        reportData = await TreeRepository.getPlantingActivityReport(startDate);
        break;
      case 'user-contributions':
        reportData = await TreeRepository.getUserContributionsReport(startDate);
        break;
      case 'tree-growth':
        reportData = await TreeRepository.getTreeGrowthReport(startDate);
        break;
      default:
        return c.json({ error: 'Invalid report type' }, 400);
    }

    if (format === 'csv') {
      const csvHeader = `${reportData.columns[0]},${reportData.columns[1]}\n`;
      const csvRows = reportData.data
        .map((item: { label: string; value: number }) => `${item.label},${item.value}`)
        .join('\n');
      const csvContent = csvHeader + csvRows;
      const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    return c.json(reportData);
  } catch (error) {
    console.error('Error exporting report:', error);
    return c.json({ error: 'Failed to export report' }, 500);
  }
});

export default reports;
