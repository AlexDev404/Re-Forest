import { and, count, desc, eq, gte, ilike, lte, sql } from 'drizzle-orm';
import { db } from '../db';
import { Trees, Trees_PlantingReasons, TreeSpecies, PlantingReasons, User } from '../db/schema';

export interface TreeCreateData {
  treeName: string;
  treeSpecies: number;
  height: number;
  health: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  age: number;
  image: string | null;
  lat: number;
  lng: number;
  plantedBy: number;
  planterType: 'INDIVIDUAL' | 'ORGANIZATION';
  organizationName?: string | null;
  hashtags?: string | null;
  quantity?: number;
  areaHectares?: number | null;
  plantingReasonId?: number | null;
}

export interface TreeFilters {
  q?: string;
  health?: string;
  date?: string;
  height?: string;
}

export class TreeRepository {
  /**
   * Create a new tree with optional planting reason
   */
  static async create(data: TreeCreateData): Promise<{ Id: number }> {
    const newTree = {
      TreeName: data.treeName,
      TreeSpecies: data.treeSpecies,
      Height: data.height,
      Health: data.health,
      Status: 'PENDING' as const,
      Age: data.age,
      Image: data.image,
      Lat: data.lat,
      Lng: data.lng,
      PlantedBy: data.plantedBy,
      PlantedOn: new Date().toISOString(),
      PlanterType: data.planterType,
      OrganizationName: data.organizationName ?? null,
      Hashtags: data.hashtags ?? null,
      Quantity: data.quantity ?? 1,
      AreaHectares: data.areaHectares ?? null,
      CreatedAt: new Date(),
      UpdatedAt: new Date()
    };

    const result = await db.insert(Trees).values(newTree).returning({ Id: Trees.Id });

    if (result.length === 0) throw new Error('Failed to create tree');

    const treeId = result[0].Id;

    // Link planting reason if provided
    if (data.plantingReasonId) {
      await db.insert(Trees_PlantingReasons).values({
        TreeId: treeId,
        PlantingReasonId: data.plantingReasonId
      });
    }

    return { Id: treeId };
  }

  /**
   * Get all approved trees with optional filters
   */
  static async getFiltered(filters: TreeFilters) {
    const conditions = [];

    if (filters.q) {
      conditions.push(ilike(Trees.TreeName, `%${filters.q}%`));
    }

    if (filters.health && filters.health !== 'all') {
      const healthMap: Record<string, string> = {
        poor: 'BAD',
        fair: 'FAIR',
        good: 'GOOD',
        excellent: 'EXCELLENT'
      };
      const healthValue = healthMap[filters.health];
      if (healthValue) {
        conditions.push(eq(Trees.Health, healthValue));
      }
    }

    if (filters.date && filters.date !== 'all') {
      const now = new Date();
      const startDate = new Date();
      switch (filters.date) {
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
      conditions.push(gte(Trees.PlantedOn, startDate.toISOString().split('T')[0]));
    }

    if (filters.height && filters.height !== 'all') {
      switch (filters.height) {
        case 'short':
          conditions.push(lte(Trees.Height, 10));
          break;
        case 'medium':
          conditions.push(and(gte(Trees.Height, 10), lte(Trees.Height, 20)));
          break;
        case 'tall':
          conditions.push(gte(Trees.Height, 20));
          break;
      }
    }

    const dbTrees = await db
      .select()
      .from(Trees)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const healthMap: Record<string, string> = {
      BAD: 'critical',
      POOR: 'poor',
      FAIR: 'fair',
      GOOD: 'good',
      EXCELLENT: 'excellent'
    };

    return dbTrees.map((tree) => ({
      name: tree.TreeName,
      plantedBy: tree.PlantedBy?.toString() || 'Unknown',
      health: healthMap[tree.Health || 'EXCELLENT'] || 'excellent',
      height: tree.Height?.toString() || '0',
      lat: tree.Lat,
      lng: tree.Lng,
      location_readable: undefined,
      plantedOn: tree.PlantedOn,
      image:
        tree.Image ||
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2613&q=80',
      age: tree.Age?.toString() || 'Unknown',
      description: `A ${healthMap[tree.Health || 'EXCELLENT'] || 'excellent'} tree that stands ${tree.Height?.toString() || '0'} meters tall.`
    }));
  }

  /**
   * Get all approved trees (enriched with planter info)
   */
  static async getAllApproved() {
    const result = await db
      .select()
      .from(Trees)
      .where(eq(Trees.Status, 'APPROVED'))
      .orderBy(desc(Trees.CreatedAt));

    const enriched = await Promise.all(
      result.map(async (tree) => {
        let planter = null;
        if (tree.PlantedBy) {
          const users = await db.select().from(User).where(eq(User.Id, tree.PlantedBy));
          if (users.length > 0) {
            const u = users[0];
            planter = {
              Id: u.Id,
              Role: u.Role,
              FirstName: u.FirstName,
              LastName: u.LastName,
              CreatedAt: u.CreatedAt
            };
          }
        }
        return {
          Id: tree.Id,
          TreeName: tree.TreeName,
          TreeSpecies: tree.TreeSpecies,
          Height: tree.Height,
          Health: tree.Health,
          Age: tree.Age,
          Image: tree.Image,
          Lat: tree.Lat,
          Lng: tree.Lng,
          PlantedBy: planter,
          PlantedOn: tree.PlantedOn,
          CreatedAt: tree.CreatedAt?.toISOString() ?? null,
          UpdatedAt: tree.UpdatedAt?.toISOString() ?? null
        };
      })
    );

    return enriched;
  }

  /**
   * Delete a tree
   */
  static async delete(treeId: number): Promise<boolean> {
    await db.delete(Trees).where(eq(Trees.Id, treeId));
    return true;
  }

  /**
   * Get tree species with optional search and filters
   */
  static async getSpecies(options: { q?: string; limit?: number; isTimber?: string }) {
    const conditions = [];

    if (options.q) {
      conditions.push(ilike(TreeSpecies.Name, `%${options.q}%`));
    }

    if (options.isTimber !== undefined && options.isTimber !== null) {
      const isTimberBool = options.isTimber === 'true';
      conditions.push(eq(TreeSpecies.IsTimber, isTimberBool));
    }

    let query = db
      .select({ id: TreeSpecies.Id, name: TreeSpecies.Name })
      .from(TreeSpecies);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(TreeSpecies.Id)).limit(options.limit ?? 20);

    return query;
  }

  /**
   * Get planting reasons
   */
  static async getPlantingReasons() {
    return db.select().from(PlantingReasons);
  }

  // ===== Report Methods =====

  static async getTreeHealthReport(startDate: Date | null) {
    let condition = eq(Trees.Status, 'APPROVED');
    if (startDate) {
      condition = and(condition, gte(Trees.PlantedOn, startDate.toISOString().split('T')[0]));
    }

    const healthDistribution = await db
      .select({ health: Trees.Health, count: count() })
      .from(Trees)
      .where(condition)
      .groupBy(Trees.Health);

    return {
      title: 'Tree Health Distribution',
      data: healthDistribution.map((item) => ({
        label: formatHealthStatus(item.health),
        value: item.count
      })),
      columns: ['Health Status', 'Count'],
      colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107']
    };
  }

  static async getTreesBySpeciesReport(startDate: Date | null) {
    let condition = eq(Trees.Status, 'APPROVED');
    if (startDate) {
      condition = and(condition, gte(Trees.PlantedOn, startDate.toISOString().split('T')[0]));
    }

    const speciesDistribution = await db
      .select({
        speciesId: Trees.TreeSpecies,
        speciesName: TreeSpecies.Name,
        count: count()
      })
      .from(Trees)
      .innerJoin(TreeSpecies, eq(Trees.TreeSpecies, TreeSpecies.Id))
      .where(condition)
      .groupBy(Trees.TreeSpecies, TreeSpecies.Name)
      .orderBy(desc(sql<number>`count(*)`));

    return {
      title: 'Trees by Species',
      data: speciesDistribution.map((item) => ({
        label: item.speciesName || 'Unknown',
        value: item.count
      })),
      columns: ['Species', 'Count']
    };
  }

  static async getPlantingActivityReport(startDate: Date | null) {
    let periodStartDate = startDate;
    if (!periodStartDate) {
      periodStartDate = new Date(0);
    }

    const plantingActivity = await db
      .select({
        month: sql<string>`date_trunc('month', ${Trees.PlantedOn})::date`,
        count: count()
      })
      .from(Trees)
      .where(
        and(
          eq(Trees.Status, 'APPROVED'),
          gte(Trees.PlantedOn, periodStartDate.toISOString().split('T')[0])
        )
      )
      .groupBy(sql`date_trunc('month', ${Trees.PlantedOn})::date`)
      .orderBy(sql`date_trunc('month', ${Trees.PlantedOn})::date`);

    return {
      title: 'Planting Activity Over Time',
      data: plantingActivity.map((item) => ({
        label: formatDate(item.month),
        value: item.count
      })),
      columns: ['Month', 'Trees Planted']
    };
  }

  static async getUserContributionsReport(startDate: Date | null) {
    let condition = eq(Trees.Status, 'APPROVED');
    if (startDate) {
      condition = and(condition, gte(Trees.PlantedOn, startDate.toISOString().split('T')[0]));
    }

    const contributions = await db
      .select({
        userId: Trees.PlantedBy,
        firstName: User.FirstName,
        lastName: User.LastName,
        count: count()
      })
      .from(Trees)
      .innerJoin(User, eq(Trees.PlantedBy, User.Id))
      .where(condition)
      .groupBy(Trees.PlantedBy, User.FirstName, User.LastName)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(10);

    return {
      title: 'Top Contributors',
      data: contributions.map((item) => ({
        label: `${item.firstName} ${item.lastName}`,
        value: item.count
      })),
      columns: ['User', 'Trees Planted']
    };
  }

  static async getTreeGrowthReport(startDate: Date | null) {
    let condition = eq(Trees.Status, 'APPROVED');
    if (startDate) {
      condition = and(condition, gte(Trees.PlantedOn, startDate.toISOString().split('T')[0]));
    }

    const ageRanges = [
      { label: '0-1 years', min: 0, max: 1 },
      { label: '2-3 years', min: 2, max: 3 },
      { label: '4-5 years', min: 4, max: 5 },
      { label: '6-10 years', min: 6, max: 10 },
      { label: '10+ years', min: 11, max: 1000 }
    ];

    const result = [];
    for (const range of ageRanges) {
      const ageCondition = and(
        condition,
        sql`${Trees.Age} >= ${range.min} AND ${Trees.Age} <= ${range.max}`
      );

      const countResult = await db
        .select({
          count: count(),
          avgHeight: sql<number>`AVG(${Trees.Height})::numeric(10,2)`
        })
        .from(Trees)
        .where(ageCondition);

      result.push({
        label: range.label,
        value: countResult[0].avgHeight || 0
      });
    }

    return {
      title: 'Average Tree Height by Age',
      data: result,
      columns: ['Age Range', 'Avg Height (m)']
    };
  }
}

// Helpers
function formatHealthStatus(status: string | null): string {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}
