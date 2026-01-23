-- Add is_timber column to Tree_Species table
ALTER TABLE "Tree_Species" ADD COLUMN "is_timber" boolean DEFAULT true;

-- Remove tree_species_text column from Trees table
ALTER TABLE "Trees" DROP COLUMN IF EXISTS "tree_species_text";
