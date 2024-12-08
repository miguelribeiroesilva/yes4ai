<template>
    <div class="card">
        <h1>Administration</h1>
        <p>Welcome to the administration section. Select a category from the menu to manage users or roles.</p>
        
        <div class="grid mt-4">
            <div class="col-12 md:col-6">
                <div class="card">
                    <NuxtLink to="/admin/users" class="no-underline">
                        <div class="flex align-items-center p-4 hover:surface-100 border-round cursor-pointer">
                            <i class="pi pi-users text-2xl text-primary mr-3"></i>
                            <div>
                                <h2 class="mt-0 mb-1 text-900">User Management</h2>
                                <p class="mt-0 mb-0 text-600">Manage system users and their permissions</p>
                            </div>
                        </div>
                    </NuxtLink>
                </div>
            </div>
            <div class="col-12 md:col-6">
                <div class="card">
                    <NuxtLink to="/admin/roles" class="no-underline">
                        <div class="flex align-items-center p-4 hover:surface-100 border-round cursor-pointer">
                            <i class="pi pi-shield text-2xl text-primary mr-3"></i>
                            <div>
                                <h2 class="mt-0 mb-1 text-900">Role Management</h2>
                                <p class="mt-0 mb-0 text-600">Configure user roles and access levels</p>
                            </div>
                        </div>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'default',
    title: 'Administration'
});
</script>

<style scoped>
.card {
    background: var(--surface-card);
    padding: 1.5rem;
    margin-bottom: 1rem;
    border-radius: var(--border-radius);
}
</style>
