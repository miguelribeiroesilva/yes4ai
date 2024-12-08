<template>
    <div class="card overflow-y-auto" v-if="modelValue">
        <Tree :value="menu" 
              :filter="true"
              :filterMode="'strict'"
              :filterPlaceholder="'Search menu...'"
              filterBy="label"
              class="w-full md:w-30rem"
              :pt="{
                  root: { class: 'p-2' },
                  filterContainer: { class: 'p-2' }
              }"
              v-model:filterValue="filterValue">
            <template #default="slotProps">
                <NuxtLink 
                    v-if="slotProps.node.to"
                    :to="slotProps.node.to" 
                    class="no-underline text-700 hover:text-primary"
                    @click="handleClick">
                    {{ slotProps.node.label }}
                </NuxtLink>
                <span v-else>
                    {{ slotProps.node.label }}
                </span>
            </template>
        </Tree>
        
        <div class="mt-auto">
            <hr class="mb-3 mx-3 border-top-1 border-none surface-border" />
            <a v-ripple class="m-3 flex align-items-center cursor-pointer p-3 gap-2 border-round text-700 hover:surface-100 transition-duration-150 transition-colors p-ripple">
                <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle" />
                <span class="font-medium">Amy Elsner</span>
            </a>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);
const filterValue = ref('');

const handleClick = () => {
    emit('update:modelValue', false);
};

const menu = ref([
    {
        key: '0',
        label: 'Dashboard',
        icon: 'pi pi-home',
        to: '/'
    },
    {
        key: '1',
        label: 'Administration',
        icon: 'pi pi-cog',
        to: '/admin',
        children: [
            {
                key: '1-0',
                label: 'Users',
                icon: 'pi pi-users',
                to: '/admin/users'
            },
            {
                key: '1-1',
                label: 'Roles',
                icon: 'pi pi-shield',
                to: '/admin/roles'
            }
        ]
    },
    {
        key: '2',
        label: 'Reports',
        icon: 'pi pi-chart-bar',
        children: [
            {
                key: '2-0',
                label: 'Sales',
                icon: 'pi pi-dollar',
                to: '/reports/sales'
            },
            {
                key: '2-1',
                label: 'Performance',
                icon: 'pi pi-chart-line',
                to: '/reports/performance'
            }
        ]
    },
    {
        key: '3',
        label: 'Settings',
        icon: 'pi pi-cog',
        to: '/settings'
    }
]);
</script>

<style scoped>
.p-tree {
    border: none;
    background: transparent;
}

.no-underline {
    text-decoration: none;
}

:deep(.p-tree-container) {
    padding: 0.5rem;
}

:deep(.p-treenode-content) {
    padding: 0.5rem !important;
}

:deep(.p-tree-toggler) {
    margin-right: 0.5rem;
}

:deep(.p-tree-filter-container) {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--surface-border);
    position: sticky;
    top: 0;
    background: var(--surface-card);
    z-index: 1;
}

.card {
    margin-top: 4rem;
    height: calc(100vh - 4rem);
    display: flex;
    flex-direction: column;
}

:deep(.p-tree) {
    flex: 1;
    overflow-y: auto;
}
</style>
