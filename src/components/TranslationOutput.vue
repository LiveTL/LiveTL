<template>
  <div class="translationOutput">
    <div v-for="translation in this.$store.getters.getTranslations" :key="translation">
      <span v-text="translation"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TranslationOutput',
  created() {
    this.$store.commit('addTranslation', 'this is a test translation');
  }
};
</script>
