<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({
    line: Object,
});

// Obtener el array de sectores
const sectorArray = computed(() => {
    return Array.isArray(props.line?.Sectors) ? props.line.Sectors : Object.values(props.line?.Sectors ?? {});
});

// Método para obtener un array de segmentos para un sector dado
const segmentArray = (sector) => {
    return sector?.Segments;
    return Array.isArray(sector?.Segments) ? sector?.Segments : Object.values(sector?.Segments ?? {});
};

// Método para obtener el color del segmento basado en su estado
const getSegmentColour = ({ Status }) => {
    // Implementa tu lógica aquí para determinar el color del segmento basado en su estado
    // Puedes modificar este método según tus requisitos
    // Por ejemplo:
    switch (Status) {
        case 2048:
            return "yellow";
        case 2049:
            return "limegreen";
        case 2051:
            return "magenta";
        case 2064:
            return "blue";
        default:
            return "#222";
    }
};
</script>


<template>
    <span style="display: flex; justify-content: center;">
        <!-- Iterar sobre los sectores de la línea -->
        <span v-for="(sector, i) in sectorArray" class="sectorWrapper" :key="`timing-data-}-sector-${i}`"
            :title="`Sector ${i + 1}`" style="margin-right: 10px;">
            <span v-if="sector.Value"
                :style="{ color: sector.OverallFastest ? 'magenta' : sector.PersonalFastest ? 'limegreen' : 'yellow', marginTop: 'var(--space-2)', display: 'inline-block' }">
                {{ sector.Value }}
            </span>
            <span v-else
                :style="{ color: sector.OverallFastest ? 'magenta' : sector.PersonalFastest ? 'limegreen' : 'yellow', marginTop: 'var(--space-2)', display: 'inline-block' }">
                -
            </span>
            <span style=" display: flex">
                <!-- Iterar sobre los segmentos del sector -->
                <span v-for="(segment, j) in segmentArray(sector)" :key="`timing-data-$-sector-${i}-segment-${j}`"
                    :style="{ width: '.5rem', height: '12px', display: 'block', marginRight: '2px', backgroundColor: getSegmentColour(segment) }"></span>
            </span>
            <!-- Mostrar el valor del sector si existe -->
        </span>
    </span>
</template>

<style scoped></style>