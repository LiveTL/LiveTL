<template>
  <v-app>
    <viewer style="height: 100%; width: 100%"></viewer>
  </v-app>
</template>

<script>
import Viewer from '@/components/Viewer';
export default {
  name: 'Stream',
  components: { Viewer },
  props: {
    id: String,
    continuation: String
  },
  computed: {
    videoEmbedUrl() {
      const ytUrl = encodeURIComponent(`https://youtube.com/embed/${this.id}`);
      return `https://livetl.app/iframeproxy.html?url=${ytUrl}`;
    },
    chatEmbedUrl() {
      const ytUrl = encodeURIComponent(
        `https://youtube.com/live_chat_replay?continuation=${this.continuation}`
      );
      return `https://livetl.app/iframeproxy.html?url=${ytUrl}&param=embed_domain`;
    }
  }
};
</script>

<style>
html {
  overflow-y: hidden;
}
</style>
