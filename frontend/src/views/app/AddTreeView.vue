<script setup lang="ts">
import {
  treesAdapter,
  type PlantingReason,
  type TreeSpeciesData,
} from "@/adapters/trees";
import { uploadAdapter } from "@/adapters/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getCurrentLocation, getReverseLoc } from "@/composables/utility";
import type { ReverseGeoJSON } from "@/types/geo";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Edit,
  Hash,
  ImageUp,
  Leaf,
  List,
  Locate,
  MapPin,
  MessageSquare,
  MoveVertical,
  Plus,
  Trash2,
  UploadCloud,
  User,
  X,
} from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Form data
const treeName = ref("");
const treeHeight = ref<number | undefined>(undefined);
const treeAge = ref<number | undefined>(undefined);
const treeImage = ref("");
const treeSpecies = ref("");
const planterTypeField = ref<"INDIVIDUAL" | "ORGANIZATION">("INDIVIDUAL");
const organizationName = ref("");
const plantingReasonId = ref("1");
const hashtags = ref("");
const quantity = ref<number | undefined>(undefined);
const areaHectares = ref<number | undefined>(undefined);

// State
const treeImageSrc = ref<string | null>(null);
const speciesData = ref<TreeSpeciesData[] | null>(null);
const selectedSpeciesName = ref<string | null>(null);
const showNonTimber = ref(false);
const planterType = ref<"INDIVIDUAL" | "ORGANIZATION" | null>(null);
const plantingReasons = ref<PlantingReason[]>([]);

// Multi-tree batch
interface TreeEntry {
  id: string;
  tree_name: string;
  tree_species: string;
  tree_species_name: string;
  tree_height?: number;
  tree_age?: number;
  tree_image: string;
  planting_reason_id: string;
  hashtags?: string;
  quantity?: number;
  area_hectares?: number;
}

const treeEntries = ref<TreeEntry[]>([]);
const editingEntryId = ref<string | null>(null);
const batchSubmitting = ref(false);
const batchErrorMessage = ref<string | null>(null);

// Location
const location = ref<GeolocationCoordinates | null>(null);
const translatedLocation = ref<string | null>(null);

// Upload
const uploading = ref(false);

// Form state persistence
const FORM_STATE_KEY = "greening_belize_form_state";

// Error state
const formErrors = ref<Record<string, string>>({});
const generalError = ref("");

function saveFormState() {
  const state = {
    tree_name: treeName.value,
    tree_height: treeHeight.value,
    tree_age: treeAge.value,
    planter_type: planterTypeField.value,
    organization_name: organizationName.value,
    planting_reason_id: plantingReasonId.value,
    hashtags: hashtags.value,
    quantity: quantity.value,
    area_hectares: areaHectares.value,
    tree_image: treeImage.value,
    planterType: planterType.value,
    treeImageSrc: treeImageSrc.value,
    showNonTimber: showNonTimber.value,
  };
  sessionStorage.setItem(FORM_STATE_KEY, JSON.stringify(state));
}

function restoreFormState() {
  const saved = sessionStorage.getItem(FORM_STATE_KEY);
  if (!saved) return;
  try {
    const state = JSON.parse(saved);
    treeName.value = state.tree_name || "";
    treeHeight.value = state.tree_height || undefined;
    treeAge.value = state.tree_age || undefined;
    planterTypeField.value = state.planter_type || "INDIVIDUAL";
    organizationName.value = state.organization_name || "";
    plantingReasonId.value = state.planting_reason_id || "";
    hashtags.value = state.hashtags || "";
    quantity.value = state.quantity || undefined;
    areaHectares.value = state.area_hectares || undefined;
    treeImage.value = state.tree_image || "";
    planterType.value = state.planterType || null;
    treeImageSrc.value = state.treeImageSrc || null;
    showNonTimber.value = state.showNonTimber || false;
  } catch (e) {
    console.error("Error restoring form state:", e);
  }
}

function clearFormState() {
  sessionStorage.removeItem(FORM_STATE_KEY);
}

// Species search
let searchTimeout: ReturnType<typeof setTimeout>;

async function querySpecies(query: string = "") {
  try {
    const isTimberParam = showNonTimber.value ? "false" : "true";
    const data = await treesAdapter.getSpecies({
      q: query,
      limit: 10,
      is_timber: isTimberParam,
    });
    speciesData.value = data.species;
  } catch (error) {
    console.error("Error fetching species:", error);
    speciesData.value = null;
  }
}

function handleSpeciesSearch(value: string) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => querySpecies(value), 500);
}

async function handleTimberToggle(val: boolean) {
  showNonTimber.value = val;
  selectedSpeciesName.value = null;
  treeSpecies.value = "";
  await querySpecies();
}

// Location
function openMapPicker() {
  router.push("/configure/site-location");
}

async function useCurrentLocationFn() {
  try {
    const loc = await getCurrentLocation();
    if (loc) {
      localStorage.setItem("location", JSON.stringify(loc));
      location.value = loc;
      const reverse: ReverseGeoJSON | null = await getReverseLoc(
        loc.latitude,
        loc.longitude,
      );
      if (reverse) {
        translatedLocation.value = reverse.display_name;
      } else {
        translatedLocation.value = `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`;
      }
    }
  } catch (error) {
    console.error("Error getting current location:", error);
  }
}

// Photo handling
async function handlePhotoClick() {
  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
  uploading.value = true;
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
    });
    if (!photo.dataUrl) return;
    const res = await fetch(photo.dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `tree-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
    const data = await uploadAdapter.uploadImage(file);
    if (data.success) {
      treeImage.value = data.url;
      treeImageSrc.value = data.url;
    }
  } catch (error: any) {
    if (error?.message !== 'User cancelled photos app') {
      console.error('Error capturing photo:', error);
    }
  } finally {
    uploading.value = false;
  }
}

// Batch management
function addTreeToBatch() {
  if (!treeName.value || !treeSpecies.value || !treeImage.value) return;

  const entry: TreeEntry = {
    id:
      editingEntryId.value ||
      `tree-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    tree_name: treeName.value,
    tree_species: treeSpecies.value,
    tree_species_name: selectedSpeciesName.value || "Unknown Species",
    tree_height: treeHeight.value,
    tree_age: treeAge.value,
    tree_image: treeImage.value,
    planting_reason_id: plantingReasonId.value,
    hashtags: hashtags.value,
    quantity: quantity.value,
    area_hectares: areaHectares.value,
  };

  if (editingEntryId.value) {
    const idx = treeEntries.value.findIndex(
      (e) => e.id === editingEntryId.value,
    );
    if (idx !== -1) treeEntries.value[idx] = entry;
    editingEntryId.value = null;
  } else {
    treeEntries.value.push(entry);
  }

  resetFormForNextEntry();
}

function resetFormForNextEntry() {
  treeName.value = "";
  treeSpecies.value = "";
  treeHeight.value = undefined;
  treeAge.value = undefined;
  treeImage.value = "";
  plantingReasonId.value = "1";
  hashtags.value = "";
  quantity.value = undefined;
  areaHectares.value = undefined;
  treeImageSrc.value = null;
  selectedSpeciesName.value = null;
  editingEntryId.value = null;
}

function editEntry(entryId: string) {
  const entry = treeEntries.value.find((e) => e.id === entryId);
  if (!entry) return;

  treeName.value = entry.tree_name;
  treeSpecies.value = entry.tree_species;
  treeHeight.value = entry.tree_height;
  treeAge.value = entry.tree_age;
  treeImage.value = entry.tree_image;
  plantingReasonId.value = entry.planting_reason_id;
  hashtags.value = entry.hashtags || "";
  quantity.value = entry.quantity;
  areaHectares.value = entry.area_hectares;
  treeImageSrc.value = entry.tree_image;
  selectedSpeciesName.value = entry.tree_species_name;
  editingEntryId.value = entryId;
}

function removeEntry(entryId: string) {
  treeEntries.value = treeEntries.value.filter((e) => e.id !== entryId);
  if (editingEntryId.value === entryId) editingEntryId.value = null;
}

const canSubmitBatch = computed(() => {
  return treeEntries.value.length > 0 && location.value !== null;
});

async function submitAllTrees() {
  if (!canSubmitBatch.value || !location.value) return;

  batchSubmitting.value = true;
  batchErrorMessage.value = null;

  try {
    const result = await treesAdapter.batchCreate(
      treeEntries.value.map((entry) => ({
        tree_name: entry.tree_name,
        tree_species: entry.tree_species,
        tree_height: entry.tree_height || 0,
        tree_age: entry.tree_age || 0,
        tree_image: entry.tree_image,
        tree_lat: location.value!.latitude,
        tree_lng: location.value!.longitude,
        planter_type: planterType.value!,
        organization_name: organizationName.value || null,
        planting_reason_id: entry.planting_reason_id,
        hashtags: entry.hashtags || null,
        quantity: entry.quantity || 1,
        area_hectares: entry.area_hectares || null,
      })),
    );

    if (result.success) {
      clearFormState();
      treeEntries.value = [];
      const ids = result.treeIds.join(",");
      router.push(`/confirmation?tree_ids=${ids}`);
    } else {
      batchErrorMessage.value = "Failed to submit trees. Please try again.";
    }
  } catch (error: any) {
    batchErrorMessage.value = error.message || "An unexpected error occurred.";
  } finally {
    batchSubmitting.value = false;
  }
}

async function submitSingleTree() {
  if (!location.value || !planterType.value) return;

  formErrors.value = {};
  generalError.value = "";

  if (!treeName.value) {
    formErrors.value.tree_name = "Tree name is required";
    return;
  }
  if (!treeSpecies.value) {
    formErrors.value.tree_species = "Species is required";
    return;
  }
  if (!treeImage.value) {
    formErrors.value.tree_image = "Image is required";
    return;
  }

  saveFormState();

  try {
    const result = await treesAdapter.create({
      tree_name: treeName.value,
      tree_image: treeImage.value,
      tree_lat: location.value.latitude,
      tree_lng: location.value.longitude,
      tree_height: treeHeight.value,
      tree_age: treeAge.value,
      tree_species: treeSpecies.value,
      planter_type: planterType.value,
      organization_name: organizationName.value || undefined,
      planting_reason_id: plantingReasonId.value,
      hashtags: hashtags.value || undefined,
      quantity: quantity.value,
      area_hectares: areaHectares.value,
    });

    if (result.success) {
      clearFormState();
      router.push(`/confirmation?tree_id=${result.treeId}`);
    }
  } catch (error: any) {
    generalError.value = error.message || "Failed to create tree";
  }
}

onMounted(async () => {
  restoreFormState();
  await querySpecies();

  // Load planting reasons
  try {
    const data = await treesAdapter.getPlantingReasons();
    plantingReasons.value = data.plantingReasons;
  } catch (e) {
    console.error("Error fetching planting reasons:", e);
  }

  // Restore location
  const storedLocation = localStorage.getItem("location");
  if (storedLocation) {
    try {
      const parsed = JSON.parse(storedLocation);
      if (parsed?.latitude && parsed?.longitude) {
        location.value = parsed;
        const reverse = await getReverseLoc(parsed.latitude, parsed.longitude);
        if (reverse) translatedLocation.value = reverse.display_name;
      }
    } catch (e) {
      console.error("Error parsing stored location:", e);
    }
  }
});
</script>

<template>
  <div
    class="block min-h-screen overflow-y-auto bg-slate-50 pb-24 font-sans dark:bg-slate-900"
  >
    <main
      class="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16"
    >
      <header class="flex flex-col items-start gap-2.5 pb-8">
        <h1
          class="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Plant a New Tree
        </h1>
        <p class="text-sm text-muted-foreground">
          Provide details about your tree planting activity.
        </p>
      </header>

      <!-- Planter Type Selection -->
      <div
        v-if="!planterType"
        class="flex flex-col gap-6 rounded-xl border border-border bg-card p-8 shadow"
      >
        <div class="text-center">
          <h2 class="mb-2 text-lg font-semibold text-foreground">
            Who is planting?
          </h2>
          <p class="text-sm text-muted-foreground">
            Select whether you are planting as an individual or on behalf of an
            organization.
          </p>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            @click="
              planterType = 'INDIVIDUAL';
              planterTypeField = 'INDIVIDUAL';
            "
            class="group flex cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-border bg-background p-6 transition-all duration-200 hover:border-primary hover:bg-primary/5"
          >
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20"
            >
              <User class="h-8 w-8 text-primary" />
            </div>
            <div class="text-center">
              <h3 class="mb-1 font-semibold text-foreground">Individual</h3>
              <p class="text-xs text-muted-foreground">
                Planting trees on your own or as a personal effort
              </p>
            </div>
          </button>
          <button
            type="button"
            @click="
              planterType = 'ORGANIZATION';
              planterTypeField = 'ORGANIZATION';
            "
            class="group flex cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-border bg-background p-6 transition-all duration-200 hover:border-primary hover:bg-primary/5"
          >
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20"
            >
              <Building2 class="h-8 w-8 text-primary" />
            </div>
            <div class="text-center">
              <h3 class="mb-1 font-semibold text-foreground">Organization</h3>
              <p class="text-xs text-muted-foreground">
                Planting as part of a school, NGO, company, or community group
              </p>
            </div>
          </button>
        </div>
      </div>

      <template v-if="planterType">
        <!-- Selected Planter Type -->
        <div
          class="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
            >
              <User
                v-if="planterType === 'INDIVIDUAL'"
                class="h-5 w-5 text-primary"
              />
              <Building2 v-else class="h-5 w-5 text-primary" />
            </div>
            <div>
              <p class="text-sm font-medium text-foreground">
                Planting as
                {{
                  planterType === "INDIVIDUAL" ? "Individual" : "Organization"
                }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{
                  planterType === "INDIVIDUAL"
                    ? "Personal tree planting effort"
                    : "Organization or group planting effort"
                }}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            @click="planterType = null"
            class="text-xs"
            >Change</Button
          >
        </div>

        <!-- Image Upload Card -->
        <div
          class="flex flex-col items-center gap-6 rounded-xl border border-border bg-card p-8 text-center shadow"
        >
          <div
            class="mb-2 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted shadow-inner transition-all duration-300 sm:h-32 sm:w-32"
            :class="
              treeImageSrc
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                : 'ring-1 ring-border'
            "
          >
            <img
              v-if="treeImageSrc"
              :src="treeImageSrc"
              alt="Tree preview"
              class="h-full w-full object-cover"
            />
            <ImageUp
              v-else
              class="h-10 w-10 text-muted-foreground opacity-60 sm:h-12 sm:w-12"
            />
          </div>
          <h2 class="text-md font-medium text-card-foreground">
            Tree Photograph
          </h2>
          <p class="max-w-xs text-xs text-muted-foreground/80">
            {{
              treeImageSrc
                ? "Current photo. Use button below to change."
                : "Upload a clear photograph of the tree(s)."
            }}
          </p>
          <Button
            variant="outline"
            @click="handlePhotoClick"
            :disabled="uploading"
            class="mt-2 w-full rounded-md px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted sm:w-auto"
          >
            <UploadCloud v-if="uploading" class="mr-2 h-4 w-4 animate-spin" />
            <ImageUp v-else-if="treeImageSrc" class="mr-2 h-4 w-4" />
            <UploadCloud v-else class="mr-2 h-4 w-4" />
            {{
              uploading
                ? "Processing..."
                : treeImageSrc
                  ? "Update Photo"
                  : "Upload Photo"
            }}
          </Button>
          <p
            v-if="formErrors.tree_image"
            class="mt-1 flex items-center gap-1 text-xs text-destructive"
          >
            <AlertTriangle class="h-3.5 w-3.5" /> {{ formErrors.tree_image }}
          </p>
        </div>

        <!-- Form -->
        <form
          @submit.prevent="submitSingleTree"
          class="flex w-full flex-col gap-6 rounded-xl border border-border bg-card p-8 shadow sm:p-10"
        >
          <!-- Organization Name -->
          <div
            v-if="planterType === 'ORGANIZATION'"
            class="grid w-full items-center gap-2"
          >
            <Label
              for="organization_name"
              class="flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <Building2 class="h-4 w-4 text-primary/80" /> Organization Name
              <span class="text-xs text-destructive">*</span>
            </Label>
            <Input
              type="text"
              id="organization_name"
              v-model="organizationName"
              placeholder="e.g., Belize Forest Department, Green Earth NGO"
              class="w-full"
              :required="planterType === 'ORGANIZATION'"
            />
          </div>

          <!-- Tree Name -->
          <div class="grid w-full items-center gap-2">
            <Label
              for="tree_name"
              class="flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <Leaf class="h-4 w-4 text-primary/80" />
              {{
                planterType === "INDIVIDUAL"
                  ? "Tree/Plant Name"
                  : "Planting Description"
              }}
              <span class="text-xs text-destructive">*</span>
            </Label>
            <Input
              type="text"
              id="tree_name"
              v-model="treeName"
              :placeholder="
                planterType === 'INDIVIDUAL'
                  ? 'e.g., Mahogany Tree, Coconut Palm'
                  : 'e.g., Reforestation Project 2026'
              "
              class="w-full"
              required
              @input="saveFormState"
            />
            <p
              v-if="formErrors.tree_name"
              class="flex items-center gap-1 text-xs text-destructive"
            >
              <AlertTriangle class="h-3.5 w-3.5" /> {{ formErrors.tree_name }}
            </p>
          </div>

          <!-- Quantity / Area -->
          <div
            v-if="planterType === 'INDIVIDUAL'"
            class="grid w-full items-center gap-2"
          >
            <Label
              for="quantity"
              class="flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <Hash class="h-4 w-4 text-primary/80" />Quantity (number of
              trees/plants)</Label
            >
            <Input
              type="number"
              id="quantity"
              v-model="quantity"
              placeholder="e.g., 1, 50"
              class="w-full"
              min="1"
            />
            <p class="text-xs text-muted-foreground">
              If planting multiple trees of the same type, enter the quantity
              here.
            </p>
          </div>
          <div v-else class="grid w-full items-center gap-2">
            <Label
              for="area_hectares"
              class="flex items-center gap-1.5 text-sm font-medium text-foreground"
              >Area (hectares)</Label
            >
            <Input
              type="number"
              id="area_hectares"
              v-model="areaHectares"
              placeholder="e.g., 2.5"
              class="w-full"
              min="0.01"
              step="0.01"
            />
            <p class="text-xs text-muted-foreground">
              1 hectare = 2.47 acres. Enter the approximate area being
              planted/reforested.
            </p>
          </div>

          <!-- Height -->
          <div class="grid w-full items-center gap-2">
            <Label
              for="tree_height"
              class="flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <MoveVertical class="h-4 w-4 text-primary/80" />
              Height (feet)
              <span class="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              type="number"
              id="tree_height"
              v-model="treeHeight"
              placeholder="e.g., 1.5"
              class="w-full"
              min="0.1"
              step="0.01"
            />
          </div>

          <!-- Species Selector -->
          <div class="grid w-full items-center gap-2">
            <div class="flex items-center justify-between">
              <Label
                class="flex items-center gap-1.5 text-sm font-medium text-foreground"
              >
                <Leaf class="h-4 w-4 text-primary/80" /> Plant Species (Common
                Name)
              </Label>
              <div class="flex items-center gap-2">
                <span class="text-xs text-muted-foreground">{{
                  showNonTimber ? "Fruit" : "Timber"
                }}</span>
                <Switch
                  :checked="showNonTimber"
                  @update:checked="handleTimberToggle"
                />
              </div>
            </div>

            <!-- Selected species display -->
            <div
              v-if="selectedSpeciesName"
              class="mb-1 flex items-center justify-between rounded-md border border-input bg-muted/50 p-2.5 shadow-sm"
            >
              <div class="flex items-center gap-2 text-foreground">
                <CheckCircle2 class="h-4 w-4 text-green-600" />
                <span class="text-sm font-medium">{{
                  selectedSpeciesName
                }}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                class="h-7 px-2 text-xs"
                @click="
                  selectedSpeciesName = null;
                  treeSpecies = '';
                  querySpecies();
                "
              >
                <X class="mr-1 h-3.5 w-3.5" /> Change
              </Button>
            </div>

            <!-- Species search -->
            <div
              v-if="!selectedSpeciesName"
              class="rounded-md border border-input bg-background shadow-sm"
            >
              <input
                type="text"
                placeholder="Search and select species..."
                class="h-9 w-full border-0 bg-transparent px-3 text-sm placeholder-muted-foreground/60 focus:outline-none focus:ring-0"
                @input="
                  (e: Event) =>
                    handleSpeciesSearch((e.target as HTMLInputElement).value)
                "
              />
              <div
                v-if="speciesData && speciesData.length > 0"
                class="max-h-[180px] overflow-y-auto border-t border-input p-1"
              >
                <button
                  v-for="sp in speciesData"
                  :key="sp.id"
                  type="button"
                  class="flex w-full cursor-pointer items-center rounded p-2 text-sm text-foreground transition-colors hover:bg-muted"
                  @click="
                    treeSpecies = sp.id.toString();
                    selectedSpeciesName = sp.name;
                  "
                >
                  <Leaf class="mr-2 h-3.5 w-3.5 text-primary/70" />
                  <span class="text-xs">{{ sp.name }}</span>
                </button>
              </div>
              <div
                v-else-if="speciesData && speciesData.length === 0"
                class="p-3 text-center text-xs text-muted-foreground"
              >
                No species found.
              </div>
            </div>
            <p
              v-if="formErrors.tree_species"
              class="mt-0.5 flex items-center gap-1 text-xs text-destructive"
            >
              <AlertTriangle class="h-3.5 w-3.5" />
              {{ formErrors.tree_species }}
            </p>
          </div>

          <!-- Planting Reason -->
          <div class="grid w-full items-center gap-3">
            <Label
              class="flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <MessageSquare class="h-4 w-4 text-primary/80" /> Reason for
              Planting</Label
            >
            <div class="flex flex-col gap-2">
              <div
                v-for="reason in plantingReasons"
                :key="reason.Id"
                class="flex items-center space-x-3 rounded-md border border-input bg-background px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer"
                @click="plantingReasonId = reason.Id.toString()"
              >
                <div
                  class="aspect-square h-4 w-4 rounded-full border border-primary"
                  :class="
                    plantingReasonId === reason.Id.toString()
                      ? 'bg-primary'
                      : ''
                  "
                ></div>
                <label
                  class="flex-1 cursor-pointer text-sm font-normal leading-relaxed"
                  >{{ reason.Name }}</label
                >
              </div>
            </div>
            <p class="text-xs text-muted-foreground">
              Select the primary reason for planting.
            </p>
          </div>

          <!-- Hashtags -->
          <div class="grid w-full items-center gap-2">
            <Label
              for="hashtags"
              class="flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <Hash class="h-4 w-4 text-primary/80" />Tags
              <span class="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              type="text"
              id="hashtags"
              v-model="hashtags"
              placeholder="e.g., #climateaction #reforestation #belize"
              class="w-full"
            />
            <p class="text-xs text-muted-foreground">
              Add relevant tags to categorize your planting (separate with
              spaces or commas).
            </p>
          </div>

          <!-- Location -->
          <div
            class="grid w-full items-center gap-3 rounded-xl border border-border bg-muted/30 p-6 shadow dark:bg-slate-800/30"
          >
            <Label
              class="flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <MapPin class="h-4 w-4 text-primary/80" /> Planting Location
            </Label>
            <template v-if="translatedLocation">
              <p class="text-xs text-muted-foreground">
                Current:
                <strong class="font-medium text-foreground">{{
                  translatedLocation
                }}</strong>
              </p>
              <p v-if="location" class="text-xs text-muted-foreground/70">
                (Lat: {{ location.latitude.toFixed(5) }}, Lng:
                {{ location.longitude.toFixed(5) }})
              </p>
            </template>
            <p
              v-else
              class="flex items-center gap-1.5 rounded-md border border-orange-200 bg-orange-50 p-2.5 text-xs text-orange-600 dark:border-orange-500/30 dark:bg-orange-900/30 dark:text-orange-400"
            >
              <AlertTriangle class="h-4 w-4" /> Location not set. Please specify
              location.
            </p>
            <Button
              type="button"
              variant="outline"
              @click="openMapPicker"
              class="mt-1 w-full sm:w-auto"
            >
              <MapPin class="mr-1.5 h-4 w-4" />
              {{ translatedLocation ? "Modify Location" : "Set Location" }}
            </Button>
            <Button
              type="button"
              variant="outline"
              :disabled="!!translatedLocation"
              @click="useCurrentLocationFn"
              class="w-full sm:w-auto"
            >
              <Locate class="mr-1.5 h-4 w-4" /> Use Current Location
            </Button>
          </div>

          <!-- Error display -->
          <p
            v-if="generalError"
            class="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
          >
            <AlertTriangle class="h-5 w-5" /> {{ generalError }}
          </p>

          <!-- Submit buttons -->
          <div class="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              :disabled="uploading || !location || !planterType"
              class="group flex w-full items-center justify-center gap-2 sm:flex-1"
            >
              <Leaf
                class="mr-1.5 h-5 w-5 transition-transform group-hover:scale-110"
              />
              Submit Single Tree
            </Button>
            <Button
              type="button"
              variant="outline"
              @click="addTreeToBatch"
              :disabled="
                uploading ||
                !location ||
                !planterType ||
                !treeName ||
                !treeSpecies ||
                !treeImage
              "
              class="group flex w-full items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground sm:flex-1"
            >
              <Plus
                class="h-5 w-5 transition-transform group-hover:scale-110"
              />
              {{
                editingEntryId ? "Update Tree in Batch" : "Add Tree to Batch"
              }}
            </Button>
          </div>

          <div
            v-if="treeEntries.length > 0"
            class="mt-2 text-center text-xs text-muted-foreground"
          >
            Or add multiple trees to a batch and submit all at once
          </div>
        </form>

        <!-- Batch Tree Entries -->
        <div
          v-if="treeEntries.length > 0"
          class="rounded-xl border border-border bg-card p-6 shadow"
        >
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <List class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold text-foreground">
                Batch Tree Entries ({{ treeEntries.length }})
              </h2>
            </div>
            <Button
              @click="submitAllTrees"
              :disabled="batchSubmitting"
              class="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <UploadCloud
                v-if="batchSubmitting"
                class="mr-2 h-4 w-4 animate-spin"
              />
              <CheckCircle2 v-else class="mr-2 h-4 w-4" />
              {{
                batchSubmitting
                  ? "Submitting..."
                  : `Submit All ${treeEntries.length} Trees`
              }}
            </Button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(entry, index) in treeEntries"
              :key="entry.id"
              class="flex items-start gap-4 rounded-lg border border-border bg-background p-4 transition-all hover:border-primary/50"
            >
              <div
                class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border"
              >
                <img
                  :src="entry.tree_image"
                  :alt="entry.tree_name"
                  class="h-full w-full object-cover"
                />
              </div>
              <div class="flex-1">
                <div class="mb-1 flex items-start justify-between">
                  <div>
                    <h3 class="font-medium text-foreground">
                      {{ entry.tree_name }}
                    </h3>
                    <p class="text-xs text-muted-foreground">
                      {{ entry.tree_species_name }}
                    </p>
                  </div>
                  <span
                    class="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                    >#{{ index + 1 }}</span
                  >
                </div>
                <div
                  class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"
                >
                  <span v-if="entry.tree_height"
                    >Height: {{ entry.tree_height }}m</span
                  >
                  <span v-if="entry.tree_age"
                    >Age: {{ entry.tree_age }} years</span
                  >
                  <span v-if="entry.quantity">Qty: {{ entry.quantity }}</span>
                  <span v-if="entry.area_hectares"
                    >Area: {{ entry.area_hectares }} ha</span
                  >
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  @click="editEntry(entry.id)"
                  class="h-8 w-8 p-0"
                >
                  <Edit class="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  @click="removeEntry(entry.id)"
                  class="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div
            v-if="batchErrorMessage"
            class="mt-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertTriangle class="h-5 w-5 flex-shrink-0" />
            <p>{{ batchErrorMessage }}</p>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
:deep(body) {
  overflow: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
