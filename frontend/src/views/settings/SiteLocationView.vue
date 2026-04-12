<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Button from '@/components/ui/Button.vue';
import Label from '@/components/ui/Label.vue';
import MenuItem from '@/components/ui/MenuItem.vue';
import { Building, House, Locate, Map as MapIcon } from 'lucide-vue-next';
import { getCurrentLocation, getReverseLoc } from '@/composables/utility';
import type { GeoJSON, ReverseGeoJSON } from '@/types/geo';

const translatedLocation = ref<string | null>(null);
const location = ref<GeolocationCoordinates | null>(null);
const cityData = ref<GeoJSON | null>(null);
const searchQuery = ref('');

let backoff = 500;
let timeout: ReturnType<typeof setTimeout>;

onMounted(async () => {
  const storedLocation = localStorage.getItem('location');
  if (!storedLocation) return;
  try {
    const parsed = JSON.parse(storedLocation);
    if (!parsed) return;
    location.value = parsed;
    const reverse = await getReverseLoc(parsed.latitude, parsed.longitude);
    if (reverse) translatedLocation.value = reverse.display_name;
  } catch {
    // ignore
  }
});

async function queryLocations(query: string) {
  const response = await fetch(`https://photon.komoot.io/api/?q=${query}&limit=5`);
  if (!response.ok) throw new Error('Network response was not ok');
  cityData.value = await response.json();
}

function handleSearchInput(value: string) {
  searchQuery.value = value;
  if (!value) {
    cityData.value = null;
    return;
  }
  clearTimeout(timeout);
  timeout = setTimeout(() => queryLocations(value), backoff);
}

async function handleGrabLocation() {
  const loc = await getCurrentLocation();
  if (loc) {
    const reverse = await getReverseLoc(loc.latitude, loc.longitude);
    if (reverse) translatedLocation.value = reverse.display_name;
    localStorage.setItem('location', JSON.stringify(loc));
    location.value = loc;
  }
}

async function selectCity(lat: number, lng: number) {
  const reverse = await getReverseLoc(lat, lng);
  if (reverse) translatedLocation.value = reverse.display_name;
  localStorage.setItem('location', JSON.stringify({ latitude: lat, longitude: lng }));
  location.value = { latitude: lat, longitude: lng } as GeolocationCoordinates;
}

function getLocationIcon(type?: string) {
  switch (type) {
    case 'state':
    case 'other':
      return 'map';
    case 'county':
    case 'city':
    case 'district':
      return 'building';
    default:
      return 'locate';
  }
}
</script>

<template>
  <div class="overflow-y-auto">
    <main class="mx-6 my-10 flex min-h-[80vh] flex-col items-start gap-9">
      <div class="flex flex-col items-start self-stretch">
        <h1 class="text-2xl font-semibold">
          <router-link to="/configure">Settings</router-link> <span> &gt; Site Location</span>
        </h1>
        <br />
        <div class="flex w-full flex-col items-start space-y-14">
          <div class="flex w-full flex-col items-center space-y-4">
            <div class="w-full rounded-sm border border-slate-100 px-2 pb-2">
              <MenuItem title="Site Location" class="border-0 px-0">
                <template #start-icon>
                  <MapIcon class="h-4 w-4" />
                </template>
              </MenuItem>
              <p class="text-xs font-light">
                Currently set to: <b>{{ translatedLocation ?? 'Set a default location.' }}</b>
              </p>
            </div>
            <Button class="w-full" @click="handleGrabLocation">
              <Locate class="mr-2 h-4 w-4" />
              Grab my current location
            </Button>
          </div>

          <div class="grid w-full items-center gap-1.5">
            <Label for="location">Custom Location</Label>
            <div class="w-full rounded-lg border">
              <input
                type="text"
                :value="searchQuery"
                @input="(e: Event) => handleSearchInput((e.target as HTMLInputElement).value)"
                placeholder="Type a command or search..."
                class="h-10 w-full rounded-t-lg border-0 bg-background px-3 text-sm focus:outline-none focus:ring-0"
              />

              <div v-if="cityData && cityData.features.length > 0" class="border-t">
                <button
                  v-for="city in cityData.features"
                  :key="city.properties.osm_id"
                  type="button"
                  class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                  @click="selectCity(city.geometry.coordinates[1], city.geometry.coordinates[0])"
                >
                  <Locate v-if="getLocationIcon(city.properties.type) === 'locate'" class="h-4 w-4" />
                  <MapIcon v-else-if="getLocationIcon(city.properties.type) === 'map'" class="h-4 w-4" />
                  <Building v-else class="h-4 w-4" />
                  <div>
                    <div>{{ city.properties.name }}</div>
                    <div class="text-xs font-light">{{ city.properties.country }}</div>
                  </div>
                  <span class="ml-auto text-xs text-muted-foreground">
                    {{ (city.properties.type ?? '').charAt(0).toUpperCase() + (city.properties.type ?? '').slice(1).toLowerCase() }}
                  </span>
                </button>
              </div>
              <div v-else-if="cityData && cityData.features.length === 0" class="border-t p-3 text-center text-xs text-muted-foreground">
                No results found.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
:deep(body) {
  overflow: auto;
}
</style>
