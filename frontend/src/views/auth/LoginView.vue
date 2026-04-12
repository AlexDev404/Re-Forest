<script setup lang="ts">
import { authAdapter } from "@/adapters/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const loading = ref(false);

async function handleLogin() {
  errorMessage.value = "";
  loading.value = true;

  try {
    await authAdapter.login({ email: email.value, password: password.value });
    router.push("/");
  } catch (err: any) {
    errorMessage.value = err.message || "Invalid email or password";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="overflow-y-auto">
    <main
      class="mx-6 my-10 flex min-h-[80vh] flex-col items-center justify-center gap-9"
    >
      <div class="flex items-center justify-center gap-4 self-stretch">
        <img
          src="/static/assets/banner/Forest_Green.png"
          alt="Greening Belize Logo"
          class="object-contain"
          width="200"
        />
      </div>

      <form
        @submit.prevent="handleLogin"
        class="flex w-full flex-col gap-5 lg:px-12"
      >
        <div class="grid w-full items-center gap-1.5">
          <Label for="email" class="w-fit">Email</Label>
          <Input
            type="email"
            v-model="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            class="w-full"
            required
          />
        </div>
        <div class="grid w-full items-center gap-1.5">
          <Label for="password" class="w-fit">Password</Label>
          <Input
            type="password"
            v-model="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            class="w-full"
            required
          />
        </div>
        <p v-if="errorMessage" class="text-sm text-destructive">
          {{ errorMessage }}
        </p>
        <div></div>
        <div></div>
        <div class="flex flex-col gap-4">
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? "Logging in..." : "Login" }}
          </Button>
          <div class="flex w-full items-center justify-center">
            <router-link to="/auth/register" class="text-sm text-primary"
              >Create an account</router-link
            >
          </div>
        </div>
      </form>
    </main>
  </div>
</template>
