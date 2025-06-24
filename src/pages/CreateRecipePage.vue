<template>
  <div></div>
</template>

<script>
export default {
  name: 'CreateRecipePage',
  mounted() {
    // Open the modal in App.vue when this page is loaded
    if (this.$root && this.$root.showCreateModal !== undefined) {
      this.$root.showCreateModal = true;
    } else if (this.$root && this.$root.$.appContext.config.globalProperties.showCreateModal !== undefined) {
      this.$root.$.appContext.config.globalProperties.showCreateModal = true;
    }
  }
}
</script> 