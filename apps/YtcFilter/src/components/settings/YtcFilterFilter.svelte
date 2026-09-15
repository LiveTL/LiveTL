<script lang="ts">
  import '../../stylesheets/ui.css';
  import '../../stylesheets/line.css';
  import '../../stylesheets/filters.css';
  import { exioButton, exioCheckbox, exioIcon, exioDropdown, exioTextbox } from 'exio/svelte';
  import { confirmDialog } from '../../ts/storage';
  import { UNDONE_MSG } from '../../ts/chat-constants';
  import { languageCodeArray, languagesInfo } from '../../ts/tl-tag-detect';
  import YtcFilterFilterSummary from './YtcFilterFilterSummary.svelte';
  export let filter: YtcF.ChatFilter;
  export let saveFilters: (filter?: YtcF.ChatFilter) => Promise<void>;
  export let deleteFilter: (item: YtcF.ChatFilter) => void;
  export let isTextFilter: (filter: YtcF.FilterCondition) => filter is YtcF.StringCondition;
  export let deleteCondition: (filter: YtcF.ChatFilter, index: number) => void;
  export let addCondition: (item: YtcF.ChatFilter) => void;
  export let discardUnsavedChanges: (filter?: YtcF.ChatFilter) => void;
  export let isBooleanFilter: (filter: YtcF.FilterCondition) => filter is YtcF.BooleanCondition;
  export let small = true;
  const changed = () => {
    for (const condition of filter.conditions) {
      if (!isTextFilter(condition)) {
        condition.type = 'boolean';
        delete (condition as any).value;
      } else if (
        (condition.type as string === 'boolean') ||
            (condition.type === 'tltag' && condition.property !== 'message')
      ) {
        condition.type = 'includes';
      }
      if (condition.needsClear && !isBooleanFilter(condition) && condition.type !== 'tltag') {
        condition.value = '';
        delete condition.needsClear;
      }
      if (condition.type === 'tltag') {
        condition.needsClear = true;
        if (!languageCodeArray.includes(condition.value)) {
          condition.value = 'en';
        }
      }
    }
  };
  $: small, filter = { ...filter };
</script>

<div class="filter filter-item-{filter.id}">
  <!-- <select bind:value={filter.type} use:exioDropdown>
    <option value="basic">Basic</option>
  </select> -->
  {#if !small}
    <div class="filter-header">
      <div class="item">
        <input
          class="filter-name"
          bind:value={filter.nickname}
          use:exioTextbox
          placeholder="Filter Name (Optional)"
        />
        <div class="condition-no-break">
          <input
            id="enable-{filter.id}"
            type="checkbox"
            use:exioCheckbox
            bind:checked={filter.enabled}
            />
          <label for="enable-{filter.id}">Enabled</label>
        </div>
        <div>
          <button
            use:exioButton
            on:click={() => {
              discardUnsavedChanges(filter);
              small = true;
            }}
          >
            <span use:exioIcon class="offset-1px">close</span>
          </button>
          <button
            use:exioButton
            class="blue-bg btn-5rem"
            on:click={() => {
              saveFilters(filter);
              small = true;
            }}
          >
            Save
            <span use:exioIcon class="offset-1px">save</span>
          </button>
        </div>
      </div>
    </div>
    <div class="condition-separator">
      <span class="line" />
      <span class="blue-text">SHOW MESSAGE IF...</span>
      <span class="line" />
    </div>
    {#each filter.conditions as condition, i}
      <div class="filter-items-wrapper">
        <div class="items">
          <select
            bind:value={condition.property}
            use:exioDropdown
            on:change={changed}
          >
            <option value="message">Message Text</option>
            <option value="authorName">Author Name</option>
            <option value="authorChannelId">Author Channel ID</option>
            <option value="moderator">Author is Moderator</option>
            <option value="member">Author is Member</option>
            <option value="owner">Author is Owner</option>
            <option value="verified">Author is Verified</option>
            <option value="superchat">Is Superchat Item</option>
            <option value="membershipItem">Is Membership Item</option>
            <!-- <option value="videoId">Video ID</option>
            <option value="videoChannelId">Video Channel ID</option> -->
          </select>
          {#if isTextFilter(condition)}
            <select
              bind:value={condition.type}
              use:exioDropdown
              on:change={changed}
            >
              <option value="includes">Contains</option>
              {#if condition.property === 'message'}
                <option value="tltag">Has TL Tag</option>
              {/if}
              <option value="startsWith">Starts With</option>
              <option value="endsWith">Ends With</option>
              <option value="equals">Equals</option>
              <option value="regex">Regex</option>
            </select>
            {#if condition.type === 'tltag'}
              <select
                bind:value={condition.value}
                use:exioDropdown
              >
                {#each languagesInfo as lang}
                  <option value={lang.code}>{lang.selectionName}</option>
                {/each}
              </select>
            {:else}
              <input
                class="filter-content filter-content-item"
                bind:value={condition.value}
                use:exioTextbox
                placeholder="Filter Content"
              />
            {/if}
          {/if}
        </div>
        <div class="condition-options">
          <div class="condition-checkboxes">
            <div class="condition-no-break">
              <input
                id="invert-{filter.id}-{i}"
                type="checkbox"
                class="condition-checkbox"
                use:exioCheckbox
                bind:checked={condition.invert}
              />
              <label for="invert-{filter.id}-{i}">Invert Condition</label>
            </div>
            {#if isTextFilter(condition) && condition.type !== 'regex' && condition.type !== 'tltag'}
              <div class="condition-no-break">
                <input
                  id="case-{filter.id}-{i}"
                  type="checkbox"
                  class="condition-checkbox"
                  use:exioCheckbox
                  bind:checked={condition.caseSensitive}
                />
                <label for="case-{filter.id}-{i}">Case Sensitive</label>
              </div>
            {/if}
          </div>
          <div>
            <button
              use:exioButton
              class="red-bg delete"
              on:click={() => deleteCondition(filter, i)}
            >
              <span use:exioIcon class="offset-1px">delete_forever</span>
            </button>
          </div>
        </div>
      </div>
      {#if i !== filter.conditions.length - 1}
        <div class="condition-separator">
          <span class="line" />
          <span class="blue-text">AND</span>
          <span class="line" />
        </div>
      {/if}
    {/each}
    <div class="condition-no-break" style="margin-top: 10px; height: 0.8rem;">
      <span class="line" />
    </div>
    <button class="add-condition-button lighter-gray" use:exioButton on:click={() => addCondition(filter)}>
      <div class="add-condition-inner blue-text">
        <span>
          <span use:exioIcon class="offset-1px add-icon" style="color: inherit;">add</span>
          Add AND Condition
        </span>
      </div>
    </button>
  {:else}
  <div class="filter-header">
    <div class="item">
      <span style="font-weight: bold; font-size: 1.25rem; display: flex; align-items: center;">
        {#if filter.nickname}
          {filter.nickname}
        {:else}
          <span>
            {#if filter.conditions.length > 0}
              <YtcFilterFilterSummary {filter} {isTextFilter} compact />
            {:else}
              Empty Filter&nbsp;
            {/if}
          </span>
          {#if filter.conditions.length === 0}
            <span use:exioIcon style="transform: translateY(2px); color: #ff9800;">warning</span>
          {/if}
        {/if}
      </span>
        <div class="condition-no-break">
          {#if small}
            {#if !filter.enabled}
              [disabled]
            {/if}
          {:else}
            <input
              id="enable-{filter.id}"
              type="checkbox"
              use:exioCheckbox
              bind:checked={filter.enabled}
              />
            <label for="enable-{filter.id}">Enabled</label>
          {/if}
        </div>
      <div style="display: flex; gap: 5px; align-items: center;">
        <button
          use:exioButton
          class="red-bg delete"
          on:click={() => {
            $confirmDialog = {
              action: {
                text: 'Delete',
                callback: () => {
                  deleteFilter(filter);
                }
              },
              title: 'Delete Filter?', // `Delete Filter "${filter.nickname}"?`,
              message: UNDONE_MSG
            };
          }}
        >
          <span use:exioIcon class="offset-1px">delete_forever</span>
        </button>
        <button
          use:exioButton
          class="blue-bg btn-5rem filter-edit-button"
          on:click={() => {
            small = false;
          }}
        >
          Edit
          <span use:exioIcon class="offset-1px">edit</span>
        </button>
      </div>
    </div>
    {#if filter.nickname}
      {#if filter.conditions.length > 0}
        <div style="margin-top: -5px;">
          <YtcFilterFilterSummary {filter} {isTextFilter} />
        </div>
      {/if}
    {/if}
  </div>
  {/if}
</div>

<style>
  .btn-5rem {
    width: 5.25rem;
  }
</style>
