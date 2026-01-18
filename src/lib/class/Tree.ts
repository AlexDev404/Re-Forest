//file: src/lib/class/Tree.ts

import { DEBUG, VERBOSE } from '$env/static/private';
import { db } from '$lib/server/db/';
import { Trees as TreeSchema } from '$lib/server/db/schema';
import { typical_development_notice } from '$lib/utility/typicals';
import { desc, eq } from 'drizzle-orm';

export class Tree {
	Id: number;
	TreeName: string;
	TreeSpecies: number;
	TreeSpeciesText: string | null;
	Height: number;
	Health: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
	Status: 'PENDING' | 'APPROVED' | 'DECLINED';
	Age: number;
	Image: string | null;
	Lat: number;
	Lng: number;
	PlantedBy: number | App.Locals['user'];
	PlantedOn: Date | null;
	PlanterType: 'INDIVIDUAL' | 'ORGANIZATION';
	OrganizationName: string | null;
	PlantingReason: string | null;
	Hashtags: string | null;
	Quantity: number;
	AreaHectares: number | null;
	CreatedAt: Date | null;
	UpdatedAt: Date | null;

	constructor(
		id: number,
		treeName: string,
		treeSpecies: number,
		treeSpeciesText: string | null,
		height: number,
		health: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT',
		status: 'PENDING' | 'APPROVED' | 'DECLINED',
		age: number,
		image: string | null,
		lat: number,
		lng: number,
		plantedBy: number,
		plantedOn: Date | null,
		planterType: 'INDIVIDUAL' | 'ORGANIZATION',
		organizationName: string | null,
		plantingReason: string | null,
		hashtags: string | null,
		quantity: number,
		areaHectares: number | null,
		createdAt: Date | null,
		updatedAt: Date | null
	) {
		this.Id = id;
		this.TreeName = treeName;
		this.TreeSpecies = treeSpecies;
		this.TreeSpeciesText = treeSpeciesText;
		this.Height = height;
		this.Health = health;
		this.Status = status;
		this.Age = age;
		this.Image = image;
		this.Lat = lat;
		this.Lng = lng;
		this.PlantedBy = plantedBy;
		this.PlantedOn = plantedOn;
		this.PlanterType = planterType;
		this.OrganizationName = organizationName;
		this.PlantingReason = plantingReason;
		this.Hashtags = hashtags;
		this.Quantity = quantity;
		this.AreaHectares = areaHectares;
		this.CreatedAt = createdAt;
		this.UpdatedAt = updatedAt;
	}

	/**
	 * Creates a new Tree instance and initializes it
	 */
	static async create(
		treeName: string,
		treeSpecies: number,
		treeSpeciesText: string | null,
		height: number,
		health: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT',
		age: number,
		image: string | null,
		lat: number,
		lng: number,
		plantedBy: number,
		planterType: 'INDIVIDUAL' | 'ORGANIZATION' = 'INDIVIDUAL',
		organizationName: string | null = null,
		plantingReason: string | null = null,
		hashtags: string | null = null,
		quantity: number = 1,
		areaHectares: number | null = null
	): Promise<Tree> {
		const tree = new Tree(
			0,
			treeName,
			treeSpecies,
			treeSpeciesText,
			height,
			health,
			'PENDING', // Default status
			age,
			image,
			lat,
			lng,
			plantedBy,
			new Date(),
			planterType,
			organizationName,
			plantingReason,
			hashtags,
			quantity,
			areaHectares,
			new Date(),
			new Date()
		);

		// 🔧 INSERT the tree first!
		await tree.add();

		// ✅ Now rehydrate to get the actual ID from DB
		await tree.initializeTree();

		return tree;
	}

	/**
	 * Initializes the Tree instance by fetching data from the database
	 */
	private async initializeTree(): Promise<void | Error> {
		await db
			.select()
			.from(TreeSchema)
			.where(eq(TreeSchema.TreeName, this.TreeName))
			.then((result) => {
				if (result.length > 0) {
					const treeData = result[0];
					if (treeData.PlantedBy === null) {
						throw new Error('PlantedBy is null');
					}
					this.Id = treeData.Id;
					this.TreeName = treeData.TreeName ?? 'Untitled';
					this.TreeSpecies = treeData.TreeSpecies ?? 0;
					this.TreeSpeciesText = treeData.TreeSpeciesText ?? null;
					this.Height = treeData.Height ?? 0;
					this.Health = treeData.Health ?? 'EXCELLENT';
					this.Status = treeData.Status ?? 'PENDING';
					this.Age = treeData.Age ?? 0;
					this.Image = treeData.Image ?? null;
					this.Lat = treeData.Lat ?? 0;
					this.Lng = treeData.Lng ?? 0;
					this.PlantedBy = treeData.PlantedBy;
					this.PlantedOn = treeData.PlantedOn ? new Date(treeData.PlantedOn) : new Date();
					this.PlanterType = treeData.PlanterType ?? 'INDIVIDUAL';
					this.OrganizationName = treeData.OrganizationName ?? null;
					this.PlantingReason = treeData.PlantingReason ?? null;
					this.Hashtags = treeData.Hashtags ?? null;
					this.Quantity = treeData.Quantity ?? 1;
					this.AreaHectares = treeData.AreaHectares ?? null;
					this.CreatedAt = treeData.CreatedAt ?? new Date();
					this.UpdatedAt = treeData.UpdatedAt ?? new Date();
				} else {
					throw new Error('Tree not found');
				}
			})
			.catch((error) => {
				throw Error('Error initializing tree: ' + error);
			});
	}

	/**
	 * Add a new tree
	 */
	async add(): Promise<boolean> {
		const newTree = {
			TreeName: this.TreeName,
			TreeSpecies: this.TreeSpecies,
			TreeSpeciesText: this.TreeSpeciesText,
			Height: this.Height,
			Health: this.Health,
			Status: this.Status,
			Age: this.Age,
			Image: this.Image,
			Lat: this.Lat,
			Lng: this.Lng,
			PlantedBy: this.PlantedBy as number,
			PlantedOn: this.PlantedOn !== null ? this.PlantedOn.toISOString() : new Date().toISOString(),
			PlanterType: this.PlanterType,
			OrganizationName: this.OrganizationName,
			PlantingReason: this.PlantingReason,
			Hashtags: this.Hashtags,
			Quantity: this.Quantity,
			AreaHectares: this.AreaHectares,
			CreatedAt: new Date(),
			UpdatedAt: new Date()
		};

		await db
			.insert(TreeSchema)
			.values(newTree)
			.returning()
			.then((result) => {
				if (JSON.parse(DEBUG) && JSON.parse(VERBOSE)) {
					typical_development_notice();
					console.log('Tree registered successfully:', result);
				}
			})
			.catch((error) => {
				throw Error('Error registering tree: ' + error);
			});

		return true;
	}

	/**
	 * View tree details
	 */
	viewDetails(): this {
		if (!this.Id) {
			throw new Error('Tree ID is not set');
		}
		return this;
	}

	/**
	 * Update tree details
	 */
	updateDetails(details: Partial<Tree>): boolean {
		if (details.TreeName !== undefined) this.TreeName = details.TreeName;
		if (details.TreeSpecies !== undefined) this.TreeSpecies = details.TreeSpecies;
		if (details.Height !== undefined) this.Height = details.Height;
		if (details.Health !== undefined) this.Health = details.Health;
		if (details.Status !== undefined) this.Status = details.Status;
		if (details.Age !== undefined) this.Age = details.Age;
		if (details.Image !== undefined) this.Image = details.Image;
		if (details.Lat !== undefined) this.Lat = details.Lat;
		if (details.Lng !== undefined) this.Lng = details.Lng;
		if (details.PlantedBy !== undefined) this.PlantedBy = details.PlantedBy;
		if (details.PlanterType !== undefined) this.PlanterType = details.PlanterType;
		if (details.OrganizationName !== undefined) this.OrganizationName = details.OrganizationName;
		if (details.PlantingReason !== undefined) this.PlantingReason = details.PlantingReason;
		if (details.Hashtags !== undefined) this.Hashtags = details.Hashtags;
		if (details.Quantity !== undefined) this.Quantity = details.Quantity;
		if (details.AreaHectares !== undefined) this.AreaHectares = details.AreaHectares;

		return true;
	}

	static async getAll(): Promise<Tree[]> {
		const result = await db
			.select()
			.from(TreeSchema)
			.where(eq(TreeSchema.Status, 'APPROVED'))
			.orderBy(desc(TreeSchema.CreatedAt));
		return result.map(
			(treeData) =>
				new Tree(
					treeData.Id,
					treeData.TreeName ?? '',
					treeData.TreeSpecies ?? 0,
					treeData.TreeSpeciesText ?? null,
					treeData.Height ?? 0,
					treeData.Health ?? 'EXCELLENT',
					treeData.Status ?? 'PENDING',
					treeData.Age ?? 0,
					treeData.Image ?? null,
					treeData.Lat ?? 0,
					treeData.Lng ?? 0,
					treeData.PlantedBy ?? 0,
					treeData.PlantedOn !== null ? new Date(treeData.PlantedOn) : null,
					treeData.PlanterType ?? 'INDIVIDUAL',
					treeData.OrganizationName ?? null,
					treeData.PlantingReason ?? null,
					treeData.Hashtags ?? null,
					treeData.Quantity ?? 1,
					treeData.AreaHectares ?? null,
					treeData.CreatedAt !== null ? new Date(treeData.CreatedAt) : null,
					treeData.UpdatedAt !== null ? new Date(treeData.UpdatedAt) : null
				)
		);
	}

	static async delete(treeId: number): Promise<boolean> {
		await db.delete(TreeSchema).where(eq(TreeSchema.Id, treeId));
		return true;
	}
}
