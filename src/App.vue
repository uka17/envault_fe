<script setup lang="ts">
import { RouterView } from "vue-router";
import { darkTheme, NConfigProvider, NMessageProvider } from "naive-ui";
import { envaultThemeOverrides } from "@/theme/naiveTheme";
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="envaultThemeOverrides">
    <n-message-provider>
      <RouterView />
    </n-message-provider>
  </n-config-provider>
</template>
