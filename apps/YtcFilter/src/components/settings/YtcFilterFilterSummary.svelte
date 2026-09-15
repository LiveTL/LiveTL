<script lang="ts">
  import { exioIcon } from 'exio/svelte';
  import { languageNameCode } from '../../ts/tl-tag-detect';
  import { isValidRegex } from '../../ts/ytcf-logic';
  export let filter: YtcF.ChatFilter;
  export let isTextFilter: (filter: YtcF.FilterCondition) => filter is YtcF.StringCondition;
  export let compact = false;

  const propertyMap = {
    message: 'message text',
    authorName: 'author name',
    authorChannelId: 'author channel id',
    moderator: 'author',
    member: 'author',
    owner: 'author',
    verified: 'author',
    superchat: 'item',
    membershipItem: 'item'
  };
  const trues = {
    includes: 'contains',
    startsWith: 'starts with',
    endsWith: 'ends with',
    equals: 'equals',
    regex: 'matches regex',
    tltag: 'has TL tag for'
  };
  const falses = {
    includes: 'does not contain',
    startsWith: 'does not start with',
    endsWith: 'does not end with',
    equals: 'does not equal',
    regex: 'does not match regex',
    tltag: 'does not have TL tag for'
  };
  const stringifyCondition = (condition: YtcF.FilterCondition) => {
    if (isTextFilter(condition)) {
      const prefix = propertyMap[condition.property];
      const value = condition.type === 'tltag' ? languageNameCode[condition.value].selectionName : condition.value;
      const trueFalse = condition.invert ? falses[condition.type] : trues[condition.type];
      const suffix = ['includes', 'startsWith', 'endsWith', 'equals'].includes(condition.type) && condition.caseSensitive ? '(case sensitive)' : '';
      const valid = condition.type === 'regex' ? isValidRegex(value) : Boolean(value);
      return [{
        type: 'string',
        value: `${prefix} ${trueFalse}`
      }, {
        type: 'literal',
        value,
        suffix,
        valid
      }];
    } else {
      const prefix = propertyMap[condition.property];
      const trueFalse = condition.invert ? 'is not' : 'is';
      const propertyName = condition.property === 'owner' ? 'channel owner' : (condition.property === 'membershipItem' ? 'membership message' : condition.property);
      return [{
        type: 'string',
        value: `${prefix} ${trueFalse} ${propertyName}`
      }];
    }
  };
</script>

<!-- <span class="blue-text">Show if</span> -->
{#each filter.conditions as condition, index}
  <span>
    {#each stringifyCondition(condition) as run, index1}
      {#if run.type === 'string'}
        <span>{index === index1 && index === 0 ? (run.value.charAt(0).toUpperCase() + run.value.slice(1)) : run.value}</span>
      {:else if run.type === 'literal'}
        &nbsp;"<code class:compact={compact}>{run.value}</code><span>"</span>
        {#if !run.valid}
          <span use:exioIcon style="vertical-align: -3px; color: #ff9800;" title="Warning: invalid condition!">warning</span>
        {/if}
        {#if run.suffix}
          <span>{run.suffix}</span>
        {/if}
      {/if}
    {/each}
  </span>
  {#if index !== filter.conditions.length - 1}
    <span class="blue-text">and&nbsp;</span>
  {/if}
{/each}

<style>
  .compact {
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
    overflow-x: hidden;
    vertical-align: bottom;
  }
</style>
