<script lang="ts">
  import {
    currentFilterPreset,
    videoInfo
  } from '../ts/storage';
  import Changelog from './changelog/YtcFilterChangelog.svelte';
  const appVersion = __VERSION__;
  const classes = 'p-2 rounded inline-flex flex-col overflow-hidden pointer-events-none touch-none select-none';
</script>

<div class={classes}>
  <!-- <span style="margin-bottom: 0.5rem;">Filtered messages will appear here.</span> -->
  <p style="text-align: center;">
    <span style="margin-bottom: 0.5rem;">Filtered messages will appear here.</span>
    <br />
    <!-- <strong>Preset:</strong> -->
    <span class="trimmed">
      {$currentFilterPreset?.nickname}
    </span>
    <span>
      ({$currentFilterPreset?.filters.filter(f => f.enabled).length} filters)
    </span>,
    <!-- <br /> -->
    <!-- <strong>Video:</strong> -->
    {#if $videoInfo}
      {#if $videoInfo?.video?.title}
        <span class="trimmed">{$videoInfo?.video?.title ? $videoInfo.video.title : 'Unknown'}</span>
        {#if $videoInfo?.channel?.name}
          (<span class="trimmed">{$videoInfo?.channel?.name}</span>)
        {/if}
      {:else}
        <span>{$videoInfo.video.videoId ? $videoInfo.video.videoId : 'Unknown'}</span>
      {/if}
    {:else}
      <span>Unknown Video</span>
    {/if}
    <br />
    <strong>v{appVersion}:</strong>
    <span>
      <Changelog />
    </span>
  </p>
</div>

<style>
  .trimmed {white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 75px;
    display: inline-block;
    vertical-align: bottom;
  }
</style>
