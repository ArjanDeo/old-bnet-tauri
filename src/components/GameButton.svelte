<script lang="ts">
    let {onClick, text, icon, selected} = $props();
</script>
<button onclick={onClick} class="-mt-4 2xl:-mt-0 text-center w-full h-32 cursor-pointer border-2  {selected == true ? 'bg-blue-800/25 border-blue-900 ' : 'border-transparent'}">
    <img src={icon} alt={text + ' logo'} class="w-12 h-12 mx-auto" />
    <p class="text-white  2xl:text-lg">{text}</p>
</button>