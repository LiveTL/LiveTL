<script lang="ts">
  import '../../stylesheets/scrollbar.css';
  import { currentFilterPreset, chatFilterPresets, defaultFilterPresetId, confirmDialog, inputDialog, currentEditingPreset, getPresetById } from '../../ts/storage';
  import '../../stylesheets/ui.css';
  import '../../stylesheets/line.css';
  import '../../stylesheets/filters.css';
  import { exioButton, exioIcon, exioDropdown } from 'exio/svelte';
  import { getRandomString } from '../../ts/chat-utils';
  import { onDestroy, onMount, tick } from 'svelte';
  import { UNDONE_MSG } from '../../ts/chat-constants';
  import YtcFilterFilter from './YtcFilterFilter.svelte';
  import YtcFilterTriggers from './YtcFilterTriggers.svelte';

  const getLastFilterItem = (id: string) => {
    return document.querySelector(`.filter-item-${id}`)!;
  };

  $currentEditingPreset = $currentFilterPreset;
  const newFilter = async () => {
    const id = getRandomString();
    const newItem: YtcF.ChatFilter = {
      // nickname: UNNAMED_FILTER + ' ' + (($currentEditingPreset.filters.filter(item => {
      //   return item.nickname?.startsWith(UNNAMED_FILTER);
      // }).map(item => parseInt((item?.nickname ?? '').replace(/\D/g, '')))
      //   .filter(item => !isNaN(item)).sort().pop() ?? 0) + 1),
      type: 'basic',
      id,
      conditions: [{
        type: 'includes',
        property: 'message',
        value: '',
        invert: false,
        caseSensitive: false
      }],
      enabled: true
    };
    // $currentEditingPreset.filters = [...JSON.parse(JSON.stringify($currentEditingPreset.filters)), JSON.parse(JSON.stringify(newItem))];
    unsavedFilters = [...unsavedFilters, newItem];
    // $chatFilterPresets = $chatFilterPresets.map(x => x.id === $currentEditingPreset.id ? JSON.parse(JSON.stringify($currentEditingPreset)) : x);
    await tick();
    const lastFilterItem = getLastFilterItem(id);
    if (lastFilterItem) {
      (lastFilterItem.querySelector('.filter-edit-button')!).click();
      await tick();
      lastFilterItem.querySelectorAll('input')[2]?.select();
      lastFilterItem.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    }
  };

  const deleteFilter = (item: YtcF.ChatFilter) => {
    $currentEditingPreset.filters = $currentEditingPreset.filters.filter(x => x.id !== item.id);
    unsavedFilters = unsavedFilters.filter(x => x.id !== item.id);
    $chatFilterPresets = $chatFilterPresets.map(x => x.id === $currentEditingPreset.id ? $currentEditingPreset : x);
  };

  let unsavedFilters: YtcF.ChatFilter[] = [];

  defaultFilterPresetId.ready().then(async () => {
    await tick();
    $currentEditingPreset = $currentFilterPreset;
    unsavedFilters = JSON.parse(JSON.stringify($currentEditingPreset.filters));
  });

  let saveTimeout: any = null;

  const saveFilters = async (filter?: YtcF.ChatFilter) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
      $currentEditingPreset.filters = $currentEditingPreset.filters.map(x => x.id === filter?.id ? filter : x);
      if (filter && !$currentEditingPreset.filters.some(x => x.id === filter?.id)) {
        $currentEditingPreset.filters = [...$currentEditingPreset.filters, filter];
      }
      $chatFilterPresets = $chatFilterPresets.map(x => x.id === $currentEditingPreset.id ? $currentEditingPreset : x);
    }, 50);
  };

  onDestroy(() => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
  });

  const isTextFilter = (filter: YtcF.FilterCondition): filter is YtcF.StringCondition =>
    ['message', 'authorName', 'authorChannelId'].includes(filter.property);
  const isBooleanFilter = (filter: YtcF.FilterCondition): filter is YtcF.BooleanCondition =>
    [
      'moderator',
      'member',
      'owner',
      'verified',
      'superchat'
    ].includes(filter.property);

  const deleteCondition = (filter: YtcF.ChatFilter, index: number) => {
    filter.conditions.splice(index, 1);
    refreshFilters();
  };
  const addCondition = async (filter: YtcF.ChatFilter) => {
    const obj = {
      ...filter,
      conditions: [...filter.conditions, {
        type: 'includes',
        property: 'message',
        value: '',
        invert: false,
        caseSensitive: false
      }]
    };
    unsavedFilters = unsavedFilters.map(x => x.id === filter.id ? obj : x) as YtcF.ChatFilter[];
    refreshFilters();
    setTimeout(() => {
      const item = getLastFilterItem(filter.id);
      (Array.from(item?.querySelectorAll('.filter-content-item')).pop() as any)?.select();
      item?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    }, 100);
  };
  const commitNewPreset = async (name: string[]) => {
    const id = getRandomString();
    $chatFilterPresets = [...$chatFilterPresets, {
      id,
      nickname: name[0] || 'Unnamed Preset',
      filters: [],
      triggers: [],
      activation: 'manual'
    }];
    $currentEditingPreset = (await getPresetById(id))!;
    unsavedFilters = JSON.parse(JSON.stringify($currentEditingPreset.filters));
  };
  const newPreset = () => {
    $inputDialog = {
      title: 'Create New Preset',
      message: '',
      action: {
        text: 'Create',
        callback: commitNewPreset
      },
      prompts: [{
        originalValue: 'Preset ' + ((($chatFilterPresets.filter(item => {
          return item.nickname?.startsWith('Preset ');
        }).map(item => parseInt((item?.nickname ?? '').replace(/\D/g, '')))
          .filter(item => !isNaN(item))
          .sort((a, b) => (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0))
          .pop() ?? 0) + 1)),
        label: 'Preset Name',
        hideLabel: true
      }]
    };
  };
  const changeEditingPreset = (async (e: InputEvent) => {
    await tick();
    $currentEditingPreset = await getPresetById((e.target as HTMLSelectElement).value) ?? $currentEditingPreset;
    unsavedFilters = JSON.parse(JSON.stringify($currentEditingPreset.filters));
  }) as any;
  const deletePreset = () => {
    if ($chatFilterPresets.length === 1) {
      $chatFilterPresets = [{
        id: $currentEditingPreset.id,
        nickname: 'Preset 1',
        filters: [],
        triggers: [],
        activation: 'manual'
      }];
      $currentEditingPreset = $chatFilterPresets[0];
      unsavedFilters = JSON.parse(JSON.stringify($currentEditingPreset.filters));
      $defaultFilterPresetId = $currentEditingPreset.id;
    } else {
      $chatFilterPresets = $chatFilterPresets.filter(x => x.id !== $currentEditingPreset.id);
      $currentEditingPreset = $chatFilterPresets[0] ?? $currentEditingPreset;
      if ($defaultFilterPresetId === $currentEditingPreset.id) {
        $defaultFilterPresetId = $currentEditingPreset.id;
      }
      unsavedFilters = JSON.parse(JSON.stringify($currentEditingPreset.filters));
    }
  };
  const copyFilters = (async (e: InputEvent) => {
    await tick();
    const target = e.target as HTMLSelectElement;
    const preset = await getPresetById(target.value);
    if (preset) {
      const newItems = JSON.parse(JSON.stringify(preset.filters)) as YtcF.ChatFilter[];
      newItems.forEach(x => (x.id = getRandomString()));
      $currentEditingPreset.filters = [...$currentEditingPreset.filters, ...newItems];
      unsavedFilters = [...unsavedFilters, ...JSON.parse(JSON.stringify(newItems))];
      $chatFilterPresets = $chatFilterPresets.map(x => x.id === $currentEditingPreset.id ? $currentEditingPreset : x);
    }
    (target.querySelector('option')!).selected = true;
  }) as any;
  const renameItemCallback = (item: YtcF.FilterPreset) => {
    const renameItem = (name: string[]) => {
      item.nickname = name[0] || 'Unnamed Preset';
      $chatFilterPresets = $chatFilterPresets.map(x => x.id === item.id ? item : x);
    };
    return renameItem;
  };
  const discardUnsavedChanges = (filter?: YtcF.ChatFilter) => {
    if (filter) {
      unsavedFilters = unsavedFilters.map(x => {
        if (x.id === filter?.id) {
          return $currentEditingPreset.filters.find(y => y.id === filter?.id);
        }
        return x;
      }).filter(x => x) as YtcF.ChatFilter[];
    } else {
      unsavedFilters = JSON.parse(JSON.stringify($currentEditingPreset.filters));
    }
  };
  const refreshFilters = () => {
    unsavedFilters = [...unsavedFilters];
  };
  let loading = true;
  onMount(async () => {
    await defaultFilterPresetId.ready();
    await tick();
    loading = false;
  });
</script>

<div class="settings-title big-text filters-title" style="margin-top: 5px;">
  <div class="preset-selector">
    <span>Filters</span>
  </div>
</div>

{#if loading}
  <div style="text-align: center; margin: 10px 0px 5px 0px;">Loading...</div>
{:else}
  <div class="filters-title" style="margin-top: 5px;">
    <span style="
      display: grid;
      grid-template-columns: auto 1fr auto auto auto;
      width: 100%;
      margin-right: 5px;
      gap: 5px;
      align-items: center;
      height: calc(100px / 3);
    ">
      <span class="big-text">Currently Editing:</span>
      <select use:exioDropdown on:change={changeEditingPreset} style="width: 100%; height: 100%;">
        {#each $chatFilterPresets as preset}
          <option value={preset.id} selected={preset.id === $currentEditingPreset.id}>
            {preset.nickname}
          </option>
        {/each}
      </select>
      <button on:click={async () => {
        $inputDialog = {
          title: 'Rename Preset',
          action: {
            callback: renameItemCallback($currentEditingPreset),
            cancelled: () => {
            },
            text: 'Save'
          },
          prompts: [{
            originalValue: $currentEditingPreset.nickname,
            label: 'Preset Name',
            hideLabel: true
          }]
        };
      }} use:exioButton style="height: 100%;">
        <span use:exioIcon style="vertical-align: -1px;">edit_square</span>
      </button>
      <button on:click={() => {
        $confirmDialog = {
          title: `Delete Preset "${$currentEditingPreset.nickname}"?`,
          message: UNDONE_MSG,
          action: {
            callback: deletePreset,
            text: 'Delete'
          }
        };
      }} use:exioButton class="red-bg" style="height: 100%;">
        <span style="white-space: nowrap;">
          <span use:exioIcon class="offset-1px">disabled_by_default</span>
        </span>
      </button>
      <button on:click={newPreset} use:exioButton class="blue-bg" style="height: 100%;">
        <span style="white-space: nowrap;">
          <span use:exioIcon class="offset-1px">add_box</span>
        </span>
      </button>
    </span>
  </div>
  <div class="settings-content" style="padding-top: 0px;">
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-top: 5px;">
      <button on:click={async () => {
        $defaultFilterPresetId = $currentEditingPreset.id;
      }} use:exioButton class="full-btn" disabled={$defaultFilterPresetId === $currentEditingPreset.id}>
        Set as
        <span style="white-space: nowrap;">
          Default
          <span use:exioIcon style="vertical-align: -2px;">
            {#if $defaultFilterPresetId === $currentEditingPreset.id}
              check_box
            {:else}
              check_box_outline_blank
            {/if}
          </span>
        </span>
      </button>
      <button on:click={async () => {
        const component = YtcFilterTriggers;
        const beforeEdit = JSON.parse(JSON.stringify($currentEditingPreset));
        $inputDialog = {
          title: `Edit "${$currentEditingPreset.nickname}" Triggers`,
          action: {
            callback: () => {
              $chatFilterPresets = $chatFilterPresets.map(x => x.id === $currentEditingPreset.id ? $currentEditingPreset : x);
            },
            cancelled: () => {
              setTimeout(() => {
                $currentEditingPreset = beforeEdit;
              }, 100);
            },
            text: 'Save'
          },
          prompts: [],
          component
        };
      }} use:exioButton class="full-btn">
        Edit
        <span style="white-space: nowrap;">
          Triggers
          <span use:exioIcon style="vertical-align: -2px;">rule</span>
        </span>
      </button>
      <select use:exioDropdown on:change={copyFilters} disabled={$chatFilterPresets.length <= 1} class="full-btn" style="white-space: pre-wrap; text-align: center;">
        <option disabled selected>
          Copy Filters From...
        </option>
        {#each $chatFilterPresets as preset}
          {#if preset.id !== $currentEditingPreset.id}
            <option value={preset.id}>
              {preset.nickname}
            </option>
          {/if}
        {/each}
      </select>
    </div>
    <div class="condition-separator">
      <span class="line" />
      <span class="blue-text">Filters for "<code>{$currentEditingPreset.nickname}</code>"</span>
      <span class="line" />
    </div>
    {#each unsavedFilters as filter (filter.id)}
      <YtcFilterFilter {filter} {saveFilters} {deleteFilter} {isTextFilter} {deleteCondition} {addCondition} {discardUnsavedChanges} {isBooleanFilter} />
    {/each}
    <button class="add-filter-button lighter-gray" use:exioButton on:click={newFilter}>
      <div class="add-condition-inner blue-text">
        <!-- <span class="line" /> -->
        <span>
          <span use:exioIcon class="offset-1px add-icon" style="color: inherit;">add</span>
          Create New Filter
        </span>
        <!-- <span class="line" /> -->
      </div>
    </button>
    <!-- {#if unsavedFilters.length === 0}
      <div style="display: flex; justify-content: center; align-items: center; font-size: 0.9rem; margin-top: 5px; flex-direction: column;">
        <span use:exioIcon style="font-size: 2em; position: absolute; pointer-events: none; touch-action: none;" class="floating-animation">expand_less</span>
        <div class="blue-bg" style="padding: 0px 10px; border-radius: 1000px; line-height: 2rem;">
          <span>
            Tip: Create your first filter!
          </span>
        </div>
      </div>
    {/if} -->
  </div>
{/if}

<style>
  .full-btn {
    width: 100%;
    height: 100%;
    background-color: var(--filter-color);
  }
</style>
