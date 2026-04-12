<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authAdapter } from '@/adapters/auth';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const loading = ref(false);

async function handleRegister() {
  errorMessage.value = '';

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords don't match";
    return;
  }

  loading.value = true;

  try {
    await authAdapter.register({
      name: name.value,
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value
    });
    router.push('/');
  } catch (err: any) {
    errorMessage.value = err.message || 'An error occurred during registration';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="overflow-y-auto pb-20">
    <main class="mx-6 my-10 flex min-h-[80vh] flex-col items-center justify-center gap-9">
      <div class="flex items-center justify-center gap-4 self-stretch">
        <img
          src="/static/assets/banner/Forest_Green.png"
          alt="Greening Belize Logo"
          class="object-contain"
          width="200"
        />
      </div>

      <form @submit.prevent="handleRegister" class="flex w-full flex-col gap-5 lg:px-12">
        <div class="grid w-full items-center gap-1.5">
          <Label for="name" class="w-fit">Full Name</Label>
          <Input
            type="text"
            v-model="name"
            id="name"
            name="name"
            placeholder="Enter your full name"
            class="w-full"
            required
          />
        </div>
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
            placeholder="Create a password"
            class="w-full"
            required
          />
        </div>
        <div class="grid w-full items-center gap-1.5">
          <Label for="confirmPassword" class="w-fit">Confirm Password</Label>
          <Input
            type="password"
            v-model="confirmPassword"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm your password"
            class="w-full"
            required
          />
        </div>
        <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
        <div class="flex flex-col gap-4">
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </Button>
          <div class="flex w-full items-center justify-center">
            <router-link to="/auth/login" class="text-sm text-primary">Already have an account? Log in</router-link>
          </div>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
:deep(body) {
  overflow: auto;
}
</style>
