# Quick Start Guide - Re:Forest Updates

## What Changed?

The Re:Forest app now distinguishes between **individual** and **organization** tree plantings, with a simplified data entry process.

## For End Users

### 1. Adding a Tree Planting

1. **Navigate to the app** and click "Add Tree Planting"

2. **Select Planter Type:**
   - Click **"Individual"** if you're planting trees on your own
   - Click **"Organization"** if representing a school, NGO, company, or community group

3. **Upload Photo:** Take or upload a photo of your tree(s)

4. **Fill Out the Form:**
   
   **If Individual:**
   - Tree/Plant Name (e.g., "Mahogany Tree")
   - Quantity (e.g., "1" for single tree, "50" for hedge row)
   - Common species name from dropdown
   - Reason for planting (optional)
   - Tags (optional, e.g., "#climateaction")
   - Location (via map picker)
   
   **If Organization:**
   - Organization Name (required)
   - Planting Description (e.g., "Reforestation Project 2026")
   - Area in Hectares (optional, 1 hectare = 2.47 acres)
   - Common species name from dropdown
   - Reason for planting (optional)
   - Tags (optional)
   - Location (via map picker)

5. **Submit** - Your planting will be recorded!

## For Developers

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/AlexDev404/Re-Forest.git
cd Re-Forest
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `PUBLIC_GEOCODE_API_KEY` - Geocoding API key
- Other Firebase and session variables (see `.env.example`)

4. **Run database migrations**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

### Key Files Changed

- `src/lib/server/db/schema.ts` - Database schema with new fields
- `src/lib/class/Tree.ts` - Tree model class
- `src/routes/(app)/manage/add/+page.svelte` - Form UI
- `src/routes/(app)/manage/add/+page.server.ts` - Form validation
- `src/routes/+page.svelte` - Home page (map disabled)

### Database Migration

Run this SQL on your database before deploying:

```sql
-- Add new enum type
CREATE TYPE plantertype AS ENUM ('INDIVIDUAL', 'ORGANIZATION');

-- Add new columns to Trees table
ALTER TABLE "Trees" 
  ADD COLUMN "planter_type" plantertype DEFAULT 'INDIVIDUAL',
  ADD COLUMN "organization_name" VARCHAR(255),
  ADD COLUMN "planting_reason" TEXT,
  ADD COLUMN "hashtags" TEXT,
  ADD COLUMN "quantity" INTEGER DEFAULT 1,
  ADD COLUMN "area_hectares" DOUBLE PRECISION;

-- Make height and age nullable if not already
ALTER TABLE "Trees" 
  ALTER COLUMN "height" DROP NOT NULL,
  ALTER COLUMN "age" DROP NOT NULL;
```

### Testing

```bash
# Run type checking
npm run check

# Run tests (if database is configured)
npm test

# Build for production
npm run build
```

## For Administrators

### Viewing Data

The system now captures:
- **Individual Plantings**: Name, quantity, species, location, reason, tags
- **Organization Plantings**: Organization name, area (hectares), species, location, reason, tags

### Reports

Use the existing reports functionality to:
- Filter by planter type (Individual vs Organization)
- View total trees planted by individuals vs organizations
- Track reforestation areas in hectares for organizations
- Generate reports by district/village

### Gamification (Future)

The planter type data enables:
- Individual leaderboards by trees planted
- Organization leaderboards by area reforested
- District/village competitions for both categories

## Troubleshooting

### Map not showing on home page
This is expected - the map has been temporarily disabled. Use the "Add Tree Planting" or "Explore Trees" buttons to navigate.

### Form not showing after selecting planter type
Make sure JavaScript is enabled and the page has fully loaded. Try refreshing.

### Photo upload failing
Check that you have a stable internet connection and the file is under 5MB in size. Supported formats: JPEG, PNG, WebP, HEIC.

### Location not saving
Ensure you've clicked "Set Location via Map" and selected a location on the map picker before submitting.

## Support

For issues or questions:
1. Check `CHANGES_SUMMARY.md` for technical details
2. Review the chat conversation in the PR description
3. Contact the development team

## Next Steps

After Jan 9 demo:
- Gather feedback from Forestry Department
- Integrate logo and theme colors when provided
- Prepare for Jan 15 beta launch
- Plan for full production release (6 months)
