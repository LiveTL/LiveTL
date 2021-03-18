<script>
  import { Slider } from 'svelte-materialify';
  import { isAndroid } from '../js/web-constants.js';

  export let min = isAndroid ? 0.25 : 0.5;
  export let max = isAndroid ? 1.5 : 2;
  export let name = "";
  export let store = null;

  let value = 50;
  // let value = store.get();
</script>

<Slider thumb value={50} inverseLabel>
  {name}
</Slider>

<!-- <Slider thumb persistentThumb bind:value min={min} max={max} inverseLabel>
  {name}
</Slider> -->