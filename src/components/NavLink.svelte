<script lang="ts">
    let { text, selected, onClick } = $props();

</script>
<a class="text-4xl {selected ? 'text-white text-shadow-2xs text-shadow-white' : 'text-gray-400'}" href="#top" onclick={onClick}>{text}</a>