<template>
  <div class="title">
    <li>
      <router-link to="/home">home</router-link>
    </li>
    <li>
      <router-link to="/about">about</router-link>
    </li>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app",
};
</script>
