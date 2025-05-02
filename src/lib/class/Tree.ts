//file: src/lib/class/Tree.ts

import { db } from '$lib/server/db/';
import { Trees as TreeSchema } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export class Tree {
    Id: number;
    TreeName: string;
    TreeSpecies: number;
    Height: number;
    Health: string;
    Age: number;
    Image: string | null;
    Lat: number;
    Lng: number;
    PlantedBy: number | null;
    PlantedOn: Date;
    CreatedAt: Date;
    UpdatedAt: Date;

    constructor(
        id: number,
        treeName: string,
        treeSpecies: number,
        height: number,
        health: string,
        age: number,
        image: string | null,
        lat: number,
        lng: number,
        plantedBy: number | null,
        plantedOn: Date,
        createdAt: Date,
        updatedAt: Date
    ) {
        this.Id = id;
        this.TreeName = treeName;
        this.TreeSpecies = treeSpecies;
        this.Height = height;
        this.Health = health;
        this.Age = age;
        this.Image = image;
        this.Lat = lat;
        this.Lng = lng;
        this.PlantedBy = plantedBy;
        this.PlantedOn = plantedOn;
        this.CreatedAt = createdAt;
        this.UpdatedAt = updatedAt;
    }

    /**
     * Creates a new Tree instance and initializes it
     */
    static async create(
        treeName: string,
        treeSpecies: number,
        height: number,
        health: string,
        age: number,
        image: string | null,
        lat: number,
        lng: number,
        plantedBy: number | null
    ): Promise<Tree> {
        const tree = new Tree(
            0,
            treeName,
            treeSpecies,
            height,
            health,
            age,
            image,
            lat,
            lng,
            plantedBy,
            new Date(),
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
                    this.Id = treeData.Id;
                    this.TreeName = treeData.TreeName ?? '';
                    this.TreeSpecies = treeData.TreeSpecies ?? 0;
                    this.Height = treeData.Height ?? 0;
                    this.Health = treeData.Health ?? '';
                    this.Age = treeData.Age ?? 0;
                    this.Image = treeData.Image ?? null;
                    this.Lat = treeData.Lat ?? 0;
                    this.Lng = treeData.Lng ?? 0;
                    this.PlantedBy = treeData.PlantedBy ?? null;
                    this.PlantedOn = treeData.PlantedOn ? new Date(treeData.PlantedOn) : new Date();
                    this.CreatedAt = treeData.CreatedAt ?? new Date();
                    this.UpdatedAt = treeData.UpdatedAt ?? new Date();
                } else {
                    return new Error('Tree not found');
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
            Height: this.Height,
            Health: this.Health as "BAD" | "FAIR" | "GOOD" | "EXCELLENT",
            Age: this.Age,
            Image: this.Image,
            Lat: this.Lat,
            Lng: this.Lng,
            PlantedBy: this.PlantedBy,
            PlantedOn: this.PlantedOn.toISOString(),
            CreatedAt: new Date(),
            UpdatedAt: new Date()
        };

        await db.insert(TreeSchema)
            .values(newTree)
            .returning()
            .then((result) => {
                console.log('Tree registered successfully:', result);
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
        if (details.Age !== undefined) this.Age = details.Age;
        if (details.Image !== undefined) this.Image = details.Image;
        if (details.Lat !== undefined) this.Lat = details.Lat;
        if (details.Lng !== undefined) this.Lng = details.Lng;
        if (details.PlantedBy !== undefined) this.PlantedBy = details.PlantedBy;

        return true;
    }

    static async getAll(): Promise<Tree[]> {
        const result = await db.select().from(TreeSchema);
        return result.map(treeData =>
            new Tree(
                treeData.Id,
                treeData.TreeName ?? '',
                treeData.TreeSpecies ?? 0,
                treeData.Height ?? 0,
                treeData.Health ?? '',
                treeData.Age ?? 0,
                treeData.Image ?? null,
                treeData.Lat ?? 0,
                treeData.Lng ?? 0,
                treeData.PlantedBy ?? null,
                new Date(treeData.PlantedOn ?? Date.now()),
                new Date(treeData.CreatedAt ?? Date.now()),
                new Date(treeData.UpdatedAt ?? Date.now())
            )
        );
    }

    static async delete(treeId: number): Promise<boolean> {
        await db.delete(TreeSchema).where(eq(TreeSchema.Id, treeId));
        return true;
    }
    
}
