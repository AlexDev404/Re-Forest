<script setup lang="ts">
import { authAdapter } from "@/adapters/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const token = ref("");
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const errorMessage = ref("");
const success = ref(false);

onMounted(() => {
  token.value = (route.query.token as string) || "";
  if (!token.value) {
    errorMessage.value = "Invalid or missing reset token.";
  }
});

async function handleSubmit() {
  errorMessage.value = "";
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }
  if (password.value.length < 8) {
    errorMessage.value = "Password must be at least 8 characters.";
    return;
  }
  loading.value = true;
  try {
    await authAdapter.resetPassword(token.value, password.value);
    success.value = true;
    setTimeout(() => router.push("/auth/login"), 2000);
  } catch (err: any) {
    errorMessage.value = err.message || "Invalid or expired reset link.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen overflow-y-auto bg-background">
    <main class="mx-6 my-10 flex min-h-[80vh] flex-col items-center justify-center gap-9">
      <div class="flex items-center justify-center gap-4 self-stretch">
        <img
          src="/static/assets/banner/Forest_Green.png"
          alt="Greening Belize Logo"
          class="object-contain"
          width="200"
        />
      </div>

      <div v-if="success" class="flex w-full flex-col gap-4 text-center lg:px-12">
        <p class="text-sm text-muted-foreground">
          Password updated successfully. Redirecting to login...
        </p>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="flex w-full flex-col gap-5 lg:px-12">
        <div class="grid w-full items-center gap-1.5">
          <Label for="password" class="w-fit">New password</Label>
          <Input
            type="password"
            v-model="password"
            id="password"
            placeholder="New password"
            class="w-full"
            required
          />
        </div>
        <div class="grid w-full items-center gap-1.5">
          <Label for="confirmPassword" class="w-fit">Confirm password</Label>
          <Input
            type="password"
            v-model="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm new password"
            class="w-full"
            required
          />
        </div>
        <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
        <Button type="submit" class="w-full" :disabled="loading || !token">
          {{ loading ? "Updating..." : "Update password" }}
        </Button>
      </form>
    </main>
  </div>
</template>
