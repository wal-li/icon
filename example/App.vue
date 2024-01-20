<script setup>
import { ref } from 'vue';
import * as icons from '../dist/index.js';

const currentType = ref('');

const randomColor = '0891b2';
</script>
<template>
  <div>
    <div>
      <button @click="currentType = 'soild'">Solid</button>
      <button @click="currentType = 'outline'">Outline</button>
      <button @click="currentType = 'sharp'">Sharp</button>
    </div>
    <div class="icon-wrap">
      <div v-for="icon in icons" :title="icon.__name">
        <component
          :is="icon"
          class="icon"
          :type="currentType"
          :style="`color: #${randomColor};`"
        ></component>
      </div>
    </div>
  </div>
</template>
