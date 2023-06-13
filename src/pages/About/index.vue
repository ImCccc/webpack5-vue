<template>
  <div class="title">
    <Test></Test>
    <el-button type="primary">按钮</el-button>
  </div>
</template>

<script>
  import Test from '@/components/Test';

  export default {
    name: 'about',
    components: {
      Test
    }
  }
</script>

<style>
.title {
  font-size: 30px;
}
</style>