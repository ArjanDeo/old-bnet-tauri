<script lang="ts">
    let {onClick, text, icon, selected} = $props();
</script>
<button onclick={onClick} class="text-center w-full h-32 p-2 cursor-pointer {selected == true ? 'bg-blue-800/25 border-blue-900 border-2' : ''}">
    <img src={icon} alt={text + ' logo'} class="w-12 h-12 mx-auto" />
    <p class="text-white  2xl:text-lg">{text}</p>
</button>