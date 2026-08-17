<script lang="ts">
  import { deleteSavedMessageActions, downloadAsJson, downloadAsTxt, getAllMessageDumpInfoItems, saveMessageDumpInfo } from '../../ts/ytcf-logic';
  import { exioButton, exioIcon } from 'exio/svelte';
  import { inputDialog, confirmDialog, exportMode, dataTheme } from '../../ts/storage';
  import { UNNAMED_ARCHIVE, UNDONE_MSG } from '../../ts/chat-constants';
  import '../../stylesheets/line.css';
  import ExportSelector from './YtcFilterDownloadSelect.svelte';
  import FullFrame from '../FullFrame.svelte';
  // import { exioIcon } from 'exio/svelte';
  export let isArchiveLoadSelection = false;
  let data: YtcF.MessageDumpInfoItem[] = [];
  let loading = false;
  let sortBy = {
    key: 'lastEdited' as keyof YtcF.MessageDumpInfoItem,
    ascending: false
  };
  const sorter = (a: YtcF.MessageDumpInfoItem, b: YtcF.MessageDumpInfoItem) => {
    return sortBy.ascending ? (a[sortBy.key] as any) - (b[sortBy.key] as any) : (b[sortBy.key] as any) - (a[sortBy.key] as any);
  };
  export let searchQuery = '';
  const updateData = async () => {
    loading = true;
    data = (await getAllMessageDumpInfoItems()).filter((item) => {
      const name = computeName(item);
      const videoId = item.info?.video.videoId ?? '';
      const channelId = item.info?.channel.channelId ?? '';
      const date = dateConvert(item.lastEdited);
      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        videoId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        date.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }).sort(sorter);
    startIndex = 0;
    loading = false;
  };
  export const refreshFunc = updateData;
  $: searchQuery, updateData();

  const editArchiveEntry = (item: YtcF.MessageDumpInfoItem) => {
    return () => {
      $inputDialog = {
        title: 'Edit Archive Entry',
        action: {
          text: 'Save',
          callback: async (data: string[]) => {
            await saveMessageDumpInfo(
              item.key,
              {
                nickname: data[0] || '',
                continuation: item.continuation,
                info: {
                  video: {
                    title: data[1],
                    videoId: data[2]
                  },
                  channel: {
                    name: data[3],
                    handle: data[4],
                    channelId: data[5]
                  }
                },
                key: item.key,
                lastEdited: new Date().getTime(),
                presetId: item.presetId
              }
            );
            updateData();
          },
          cancelled: () => {
            $inputDialog = null;
          }
        },
        prompts: [{
          originalValue: item.nickname || '',
          label: 'Archive Name'
        }, {
          originalValue: item.info?.video.title ?? '',
          label: 'Video Title'
        }, {
          originalValue: item.info?.video.videoId ?? '',
          label: 'Video ID'
        }, {
          originalValue: item.info?.channel.name ?? '',
          label: 'Channel Name'
        }, {
          originalValue: item.info?.channel.handle ?? '',
          label: 'Channel Handle'
        }, {
          originalValue: item.info?.channel.channelId ?? '',
          label: 'Channel ID'
        }]
      };
    };
  };
  const downloadArchiveEntry = (item: YtcF.MessageDumpInfoItem) => {
    return () => {
      $inputDialog = {
        action: {
          callback: async () => {
            if ($exportMode === 'json') {
              downloadAsJson(item);
            } else if ($exportMode === 'txt') {
              downloadAsTxt(item);
            }
          },
          text: 'Export',
          cancelled: () => {
            $inputDialog = null;
          }
        },
        title: `Export Archive "${item.nickname || UNNAMED_ARCHIVE}"`,
        component: ExportSelector,
        prompts: []
      };
    };
  };
  const deleteArchiveEntry = (item: YtcF.MessageDumpInfoItem) => {
    return () => {
      $confirmDialog = {
        title: `Delete Archive "${item.nickname || UNNAMED_ARCHIVE}"?`,
        message: UNDONE_MSG,
        action: {
          callback: async () => {
            await deleteSavedMessageActions(item.key);
            updateData();
          },
          text: 'Delete'
        }
      };
    };
  };
  export const loadArchiveEntry = (entry: YtcF.MessageDumpInfoItem) => async () => {
    window.parent.postMessage({
      type: 'loadArchiveRequest',
      key: entry.key
    }, '*');
  };

  let startIndex = 0;

  const dateConvert = (dateNum: number) => {
    const date = new Date(dateNum);
    const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hoursColonMinutes = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${month} ${day} ${year}, ${hoursColonMinutes}`;
  };
  const computeName = (item: YtcF.MessageDumpInfoItem) => {
    return item.nickname || (
      item.info?.video.title ? `${item.info?.video.title}${item.info?.channel.name ? ` (${item.info?.channel.name})` : ''}` : ''
    ) || UNNAMED_ARCHIVE;
  };
  let archiveEntryUrl = '';
  const viewArchiveEntry = (item: YtcF.MessageDumpInfoItem) => {
    const paramsClone = new URLSearchParams();
    paramsClone.set('archiveKey', item.key);
    paramsClone.set('ytDark', $dataTheme === 'dark' ? 'true' : 'false');
    return () => {
      archiveEntryUrl = `/hyperchat.html?${paramsClone.toString()}`;
    };
  };
</script>

<FullFrame bind:src={archiveEntryUrl} />

<div style="padding-bottom: 1px; padding: 2px 10px 10px 10px;">
  {#if loading}
    <div style="text-align: center; margin: 10px 0px 5px 0px;">Loading...</div>
  {:else if data.length === 0}
    <div style="text-align: center; margin: 10px 0px 5px 0px;">No Archives Found</div>
  {/if}
  {#if !loading && data.length > 0}
    <!-- <div class="full-flex" style="justify-content: flex-end;">
      <button
        use:exioButton
        style="white-space: nowrap;"
      >
        Search
        <span use:exioIcon style="vertical-align: -2px;">search</span>
      </button>
    </div> -->
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Video ID</th>
          <th>Name/Title</th>
          <th>Size</th>
          <th class="hover-highlight" on:click={() => {
            sortBy = { key: 'lastEdited', ascending: !sortBy.ascending };
            updateData();
          }}>
            <span class:underline={sortBy.key === 'lastEdited'}>Last Edited</span>
            <span use:exioIcon style="vertical-align: -1px;">
              {sortBy.ascending ? 'arrow_downward' : 'arrow_upward'}
            </span>
          </th>
          <th style="display: {isArchiveLoadSelection ? 'none' : 'unset'};"></th>
        </tr>
      </thead>
      <tr>
        <td colspan="5" style="padding: 0px !important;">
          <div class="line"  />
          <div class="line"  />
        </td>
      </tr>
      {#each data.slice(startIndex, startIndex + 10) as item, i (item.key)}
        <tr class="hover-highlight" style="padding: 0x 5px;" on:click={isArchiveLoadSelection ? loadArchiveEntry(item) : undefined}>
          <td style="white-space: nowrap;">{item.info?.video.videoId}</td>
          <td style="width: 100%;">
            {computeName(item)}
          </td>
          <td style="font-style: italic;" class="snap-small">{item.size ?? 0}</td>
          <td style="font-style: italic;" class="snap-small">{dateConvert(item.lastEdited)}</td>
          {#if !isArchiveLoadSelection}
            <td style="font-style: italic; text-align: center;" class="snap-small">
              <span style="white-space: nowrap;">
                <span class="material-icons link-button" on:click={editArchiveEntry(item)} title="Edit Archive">edit</span>
                <span class="material-icons link-button" title="Open Archive" on:click={viewArchiveEntry(item)}>visibility</span>
              </span>
                <span style="white-space: nowrap;">
                  <span class="material-icons link-button" on:click={downloadArchiveEntry(item)} title="Download Archive">download</span>
                  <span class="material-icons link-button red" on:click={deleteArchiveEntry(item)} title="Delete Archive">delete</span>
                </span>
            </td>
          {/if}
        </tr>
        {#if i < data.slice(startIndex, startIndex + 10).length - 1}
          <tr>
            <td colspan="5" style="padding: 0px !important;">
              <div class="line" />
            </td>
          </tr>
        {/if}
      {/each}
      <!-- <div class="item triple-buttons" style="padding: 0px;">
        {#if isArchiveLoadSelection}
        <button use:exioButton on:click={loadArchiveEntry(item)} style="white-space: nowrap;">
          Load
          <span use:exioIcon style="vertical-align: -1px;">open_in_browser</span>
        </button>
        {:else}
        <button use:exioButton on:click={editArchiveEntry(item)}>
          <span use:exioIcon style="vertical-align: -1px;">edit</span>
        </button>
        <button use:exioButton class="blue-bg" on:click={downloadArchiveEntry(item)}>
          <span use:exioIcon style="vertical-align: -2px;">download</span>
        </button>
        <button use:exioButton class="red-bg" on:click={deleteArchiveEntry(item)}>
          <span use:exioIcon style="vertical-align: -1px;">delete_forever</span>
        </button>
        {/if}
    </div>
      </div> -->
    </table>
  {/if}
  <div class="full-flex spaced">
    <button
      use:exioButton
      style="white-space: nowrap;"
      on:click={() => (startIndex = Math.max(startIndex - 10, 0))}
      disabled={startIndex === 0}
    >
      <span use:exioIcon style="vertical-align: -1px;">chevron_left</span>
    </button>
    <div>
      {startIndex + 1}-{Math.min(startIndex + 10, data.length)} of {data.length}
    </div>
    <button
      use:exioButton
      style="white-space: nowrap;"
      on:click={() => (startIndex = Math.min(startIndex + 10, data.length - 1))}
      disabled={startIndex >= data.length - 10}
    >
      <span use:exioIcon style="vertical-align: -1px;">chevron_right</span>
    </button>
  </div>
</div>

<style>
  .underline {
    text-decoration: underline;
  }
  .link-button {
    cursor: default;
    visibility: hidden;
  }
  .hover-highlight:hover .link-button {
    visibility: visible;
  }
  .link-button:hover {
    color: #0064d1 !important;
  }
  :global([data-theme=dark]) .link-button:hover {
    color: #3ba7ff !important;
  }
  .link-button.red:hover {
    color: #ff5656 !important;
  }
  :global([data-theme=dark]) .link-button.red:hover {
    color: #c80000 !important;
  }
  .hover-highlight:hover {
    background-color: #80808040;
  }
  td, th {
    padding: 5px 5px;
  }
  td {
    user-select: text !important;
  }
  th {
    text-align: left;
    white-space: nowrap;
  }
  button {
    font-size: 1rem;
  }
  /* .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    gap: 10px;
  } */
  @media (min-width: 850px) {
    .snap-small {
      white-space: nowrap;
    }
  }
  .full-flex {
    display: flex;
    width: 100%;
    align-items: center;
    margin: 5px 0px;
  }
  .spaced {
    justify-content: center;
    gap: 10px;
  }
</style>
