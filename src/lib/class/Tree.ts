import { db } from '$lib/server/db/';
import { Tree as TreeSchema } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export class Tree {
    Id: number;
    Species: string;
    Height: number;
    Age: number;
    Location: string;
    PlantedAt: Date;

    constructor(
        id: number,
        species: string,
        height: number,
        age: number,
        location: string,
        plantedAt: Date = new Date()
    ) {
        this.Id = id;
        this.Species = species;
        this.Height = height;
        this.Age = age;
        this.Location = location;
        this.PlantedAt = plantedAt;
    }

    /**
     * Creates a new Tree instance and initializes it
     */
    static async create(
        species: string,
        height: number,
        age: number,
        location: string
    ): Promise<Tree | Error> {
        const tree = new Tree(0, species, height, age, location);
        const ret_val = await tree.initializeTree().catch((error: Error) => {
            return error;
        });
        if (ret_val) {
            return ret_val;
        }
        return tree;
    }

    /**
     * Initializes the Tree instance by fetching data from the database
     */
    private async initializeTree(): Promise<void | Error> {
        await db
            .select()
            .from(TreeSchema)
            .where(eq(TreeSchema.Location, this.Location))
            .then((result) => {
                if (result.length > 0) {
                    this.Id = result[0].Id;
                    this.Species = result[0].Species as string;
                    this.Height = result[0].Height as number;
                    this.Age = result[0].Age as number;
                    this.Location = result[0].Location as string;
                    this.PlantedAt = result[0].PlantedAt as Date;
                } else {
                    return new Error('Tree not found');
                }
            })
            .catch((error) => {
                throw Error('Error initializing tree: ' + error);
            });
    }

    /**
     * Find a tree by location
     */
    static async findByLocation(location: string): Promise<Tree | Error> {
        const createdTree = await this.create('', 0, 0, location);
        if (createdTree instanceof Error) {
            throw createdTree;
        }
        if (createdTree instanceof Tree) {
            if (!isNaN(createdTree.Id)) {
                return createdTree;
            }
        }
        throw new Error('Tree not found');
    }

    /**
     * Register a new tree
     */
    async register(
        species: string,
        height: number,
        age: number,
        location: string
    ): Promise<boolean> {
        const newTree = {
            Species: species,
            Height: height,
            Age: age,
            Location: location,
            PlantedAt: new Date()
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
    updateDetails(details: Tree): boolean {
        this.Species = details.Species;
        this.Height = details.Height;
        this.Age = details.Age;
        this.Location = details.Location;

        return true;
    }
}
