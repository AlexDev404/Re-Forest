<script setup lang="ts">
import { authAdapter } from "@/adapters/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ref } from "vue";

const email = ref("");
const loading = ref(false);
const submitted = ref(false);
const errorMessage = ref("");

async function handleSubmit() {
  errorMessage.value = "";
  loading.value = true;
  try {
    await authAdapter.forgotPassword(email.value);
    submitted.value = true;
  } catch (err: any) {
    errorMessage.value = err.message || "Something went wrong. Please try again.";
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

      <div v-if="submitted" class="flex w-full flex-col gap-4 text-center lg:px-12">
        <p class="text-sm text-muted-foreground">
          If an account exists for <strong>{{ email }}</strong>, a password reset link has been sent.
          Check your inbox.
        </p>
        <router-link to="/auth/login" class="text-sm text-primary">Back to login</router-link>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="flex w-full flex-col gap-5 lg:px-12">
        <p class="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <div class="grid w-full items-center gap-1.5">
          <Label for="email" class="w-fit">Email</Label>
          <Input
            type="email"
            v-model="email"
            id="email"
            placeholder="Enter your email"
            class="w-full"
            required
          />
        </div>
        <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
        <div class="flex flex-col gap-4">
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? "Sending..." : "Send reset link" }}
          </Button>
          <div class="flex w-full items-center justify-center">
            <router-link to="/auth/login" class="text-sm text-primary">Back to login</router-link>
          </div>
        </div>
      </form>
    </main>
  </div>
</template>
