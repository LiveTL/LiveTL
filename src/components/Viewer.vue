<template>
  <div class="flex vertical">
    <div class="tile"></div>
    <div class="tile">
      <div class="flex horizontal">
        <div class="tile"></div>
        <div class="tile"></div>
      </div>
    </div>
  </div>
</template>

<script>
import TranslationOutput from '@/components/TranslationOutput';
import $ from 'jquery';
import 'jquery-ui-bundle';
import 'jquery-ui-bundle/jquery-ui.css';
export default {
  name: 'ChatUI',
  data: () => {
    return {};
  },
  metaInfo: {
    title: 'YTC (Optimized)',
    titleTemplate: '%s | LiveTL'
  },
  created() {},
  mounted: function() {
    this.$nextTick(function() {
      $($('.tile')[0]).resizable({
        handles: 'e, w',
        start: () => {},
        stop: () => {},
        resize: (event, ui) => {},
        containment: 'body'
      });
    });
  },
  methods: {},
  components: { TranslationOutput }
};
</script>

<style>
.tile {
  background-color: red;
  border: 5px solid blue;
  /* flex: 1; */
  display: flex;
}

.flex>.tile:last-child {
  flex-grow: 1;
}

.horizontal {
  flex-direction: column;
}
.vertical {
  flex-direction: row;
}
.flex {
  display: flex;
  height: 100%;
  width: 100%;
}
body {
  margin: 0px;
}
</style>
