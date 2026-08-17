<script lang="ts">
  import { Theme, TimeUnit } from '../../ts/chat-constants';
  import { theme, showProfileIcons, showUsernames, showTimestamps, showUserBadges, errorDialog, confirmDialog, inputDialog, filterInBackground, initialSetupDone, autoOpenFilterPanel, autoClear } from '../../ts/storage';
  import { exioButton, exioCheckbox, exioDropdown, exioIcon, exioTextbox } from 'exio/svelte';
  import { forceReloadAll, readFromJson, exportSettingsAsJson, importSettingsFromJson } from '../../ts/ytcf-logic';
  import '../../stylesheets/ui.css';
  import YtcFilterErrorDialog from '../YtcFilterErrorDialog.svelte';
  import LoadingBar from '../common/LoadingBar.svelte';
  import { onMount, tick } from 'svelte';
  const appVersion = __VERSION__;
  let loading: false | string = false;
  const importData = async () => {
    const data = await readFromJson();
    try {
      loading = 'Importing Data...';
      await importSettingsFromJson(data);
      $initialSetupDone = true;
      loading = false;
    } catch (e) {
      loading = false;
      $errorDialog = {
        action: {
          text: 'Close',
          callback: () => {
            $errorDialog = null;
          }
        },
        title: 'Data Import Error',
        message: (e).message
      };
    }
  };
  const resetData = () => {
    $confirmDialog = {
      title: 'Reset Data',
      message: 'Are you sure you want to reset all your data? This cannot be undone.',
      action: {
        text: 'Reset',
        callback: async () => {
          loading = 'Resetting Data...';
          await chrome.storage.local.clear();
          $confirmDialog = null;
          forceReloadAll();
        }
      }
    };
  };

  $: if (loading) {
    $inputDialog = {
      title: loading,
      component: LoadingBar,
      prompts: [],
      action: {
        text: 'Cancel',
        callback: () => {
        },
        noAction: true
      }
    };
  } else {
    $inputDialog = null;
  }

  let waitingForStore = true;
  let boolAutoClear = false;
  let numberAutoClear = 2;
  let unitAutoClear = TimeUnit.WEEKS;

  onMount(async () => {
    await autoClear.ready();
    boolAutoClear = $autoClear.enabled;
    numberAutoClear = $autoClear.duration;
    unitAutoClear = $autoClear.unit;
    await tick();
    await tick();
    waitingForStore = false;
  });

  const updateAutoClear = () => {
    if (waitingForStore) return;
    $autoClear = {
      enabled: boolAutoClear,
      duration: numberAutoClear,
      unit: unitAutoClear
    };
  };
</script>

<YtcFilterErrorDialog />

<div class="settings-title big-text">Appearance</div>
<div class="settings-content">
  <div class="setting-item" style="margin: 5px;">
    <span>Theme: </span>
    <select use:exioDropdown bind:value={$theme}>
      <option value={Theme.YOUTUBE}>Auto</option>
      <option value={Theme.LIGHT}>Light</option>
      <option value={Theme.DARK}>Dark</option>
    </select>
  </div>
  <div class="setting-item">
    <input class="check" type="checkbox" use:exioCheckbox bind:checked={$showProfileIcons} id="show-profile-icons" />
    <label for="show-profile-icons">Show Profile Icons</label>
  </div>
  <div class="setting-item">
    <input class="check" type="checkbox" use:exioCheckbox bind:checked={$showTimestamps} id="show-timestamps" />
    <label for="show-timestamps">Show Timestamps</label>
  </div>
  <div class="setting-item">
    <input class="check" type="checkbox" use:exioCheckbox bind:checked={$showUsernames} id="show-usernames" />
    <label for="show-usernames">Show Usernames</label>
  </div>
  <div class="setting-item" style="margin-bottom: 5px;">
    <input class="check" type="checkbox" use:exioCheckbox bind:checked={$showUserBadges} id="show-user-badges" />
    <label for="show-user-badges">Show User Badges</label>
  </div>
</div>
<!-- <div class="settings-title big-text">Background Activity</div> -->
<div class="settings-title big-text">Storage & Background Activity</div>
<div class="settings-content">
  <div class="setting-item" style="margin-top: 0px;">
    <span>Storage Data: </span>
    <button use:exioButton on:click={async () => {
      exportSettingsAsJson();
    }}>
      Export as JSON
      <span use:exioIcon style="vertical-align: -2px;">download</span>
    </button>
    <button use:exioButton on:click={importData}>
      Import and Merge
      <span use:exioIcon style="vertical-align: -2px;">upload</span>
    </button>
    <button use:exioButton class="red-bg" on:click={resetData}>
      Reset All
      <span use:exioIcon style="vertical-align: -2px;">restart_alt</span>
    </button>
  </div>
  <div class="setting-item" style="margin-bottom: 5px;">
    <input class="check" type="checkbox" use:exioCheckbox bind:checked={$autoOpenFilterPanel} id="open-auto" />
    <label for="open-auto">Automatically show filtered messages panel on load</label>
  </div>
  <div class="setting-item" style="margin-bottom: 5px;">
    <input class="check" type="checkbox" use:exioCheckbox bind:checked={$filterInBackground} id="silently-filter" />
    <label for="silently-filter">Silently begin filtering messages in the background on load</label>
  </div>
  <div class="setting-item" style="margin-bottom: 5px;">
    <input
      class="check"
      type="checkbox"
      use:exioCheckbox
      bind:checked={boolAutoClear}
      id="clear-auto"
      on:change={updateAutoClear}
      style="transform: translateY(-0.4em);"
    />
    <label for="clear-auto">
      Periodically delete stale archives older than
      <input
        type="number"
        min="1"
        disabled={!boolAutoClear}
        on:change={updateAutoClear}
        bind:value={numberAutoClear}
        use:exioTextbox
        style="width: 4em;"
      />
      <select
        use:exioDropdown
        disabled={!boolAutoClear}
        bind:value={unitAutoClear}
        on:change={updateAutoClear}
      >
        <option value={TimeUnit.HOURS}>Hours</option>
        <option value={TimeUnit.DAYS}>Days</option>
        <option value={TimeUnit.WEEKS}>Weeks</option>
        <option value={TimeUnit.MONTHS}>Months</option>
      </select>
    </label>    
  </div>
</div>
<div class="settings-title big-text">About</div>
<div class="settings-content">
  <div class="setting-item" style="margin-top: 0px;">
    <div><strong>YtcFilter v{appVersion}</strong></div>
    <div>
      <strong>Support:</strong> via <a href="https://discord.com/invite/uJrV3tmthg" style="color: #3ba7ff;" target="_blank">
        Discord
      </a>
    </div>
    <div>
      <strong>Website:</strong> <a href="https://livetl.app/" style="color: #3ba7ff;" target="_blank">
        livetl.app
      </a>
    </div>
    <div>
      <strong>Source Code:</strong> <a href="https://github.com/LiveTL/ytcfilter" style="color: #3ba7ff;" target="_blank">
        github.com/LiveTL/ytcfilter
      </a>
    </div>
  </div>
</div>

<style>
  .setting-item {
    display: block;
    margin-top: 10px;
  }
  .check {
    display: inline-block;
    vertical-align: bottom;
    margin: 0px 10px;
  }
  input[type=number]::-webkit-inner-spin-button {
    opacity: 1;
  }
</style>
