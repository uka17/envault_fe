<script setup lang="ts">
import { RouterView } from "vue-router";
import { darkTheme, NConfigProvider } from "naive-ui";
import { envaultThemeOverrides } from "@/theme/naiveTheme";
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="envaultThemeOverrides">
    <RouterView />
  </n-config-provider>
</template>
