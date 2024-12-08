<template>
    <div class="hierarchical-teams">
        <div class="grid">
            <!-- Main Workspace -->
            <div class="col-12 lg:col-8">
                <div class="card">
                    <!-- Header -->
                    <div class="flex justify-content-between align-items-center mb-4">
                        <h2 class="text-xl font-bold m-0">{{ t('hierarchical.title') }}</h2>
                        <div class="flex gap-2">
                            <Button :label="t('hierarchical.actions.reset')" icon="pi pi-refresh" severity="secondary" @click="resetSimulation" />
                            <Button :label="t('hierarchical.actions.start')" icon="pi pi-play" severity="primary" @click="startSimulation" :loading="isRunning" />
                        </div>
                    </div>

                    <!-- Task Input -->
                    <div class="mb-4">
                        <span class="p-float-label">
                            <Textarea
                                v-model="taskInput"
                                :placeholder="t('hierarchical.input.placeholder')"
                                rows="3"
                                class="w-full"
                                :disabled="isRunning"
                            />
                            <label>{{ t('hierarchical.input.label') }}</label>
                        </span>
                    </div>

                    <!-- Team Hierarchy Visualization -->
                    <div class="hierarchy-visualization surface-ground p-3 border-round mb-4">
                        <h3 class="text-lg font-semibold mb-3">{{ t('hierarchical.visualization.title') }}</h3>
                        <div class="team-tree">
                            <!-- Manager Level -->
                            <div class="team-level manager-level">
                                <div :class="['team-member p-3 border-round', getAgentStatus('manager')]">
                                    <i class="pi pi-user-plus text-xl mb-2"></i>
                                    <div class="font-semibold">{{ t('hierarchical.roles.manager') }}</div>
                                    <small class="text-500">{{ t('hierarchical.roles.managerDesc') }}</small>
                                </div>
                            </div>

                            <!-- Team Leaders Level -->
                            <div class="team-level leaders-level grid">
                                <div v-for="(leader, index) in teamLeaders" :key="index" class="col-6">
                                    <div :class="['team-member p-3 border-round', getAgentStatus(leader.id)]">
                                        <i class="pi pi-users text-xl mb-2"></i>
                                        <div class="font-semibold">{{ leader.name }}</div>
                                        <small class="text-500">{{ leader.description }}</small>
                                    </div>
                                </div>
                            </div>

                            <!-- Team Members Level -->
                            <div class="team-level members-level grid">
                                <div v-for="(member, index) in teamMembers" :key="index" class="col-4">
                                    <div :class="['team-member p-3 border-round', getAgentStatus(member.id)]">
                                        <i class="pi pi-user text-xl mb-2"></i>
                                        <div class="font-semibold">{{ member.name }}</div>
                                        <small class="text-500">{{ member.role }}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Activity Log -->
                    <div class="activity-log surface-ground p-3 border-round" style="height: 300px; overflow-y: auto;">
                        <h3 class="text-lg font-semibold mb-3">{{ t('hierarchical.log.title') }}</h3>
                        <div v-for="(log, index) in activityLog" :key="index" class="mb-3">
                            <div :class="['log-entry p-3 border-round surface-card', {'border-primary': log.highlight}]">
                                <div class="flex align-items-center gap-2 mb-2">
                                    <i :class="getLogIcon(log.type)"></i>
                                    <span class="font-semibold">{{ log.agent }}</span>
                                    <small class="text-500 ml-auto">{{ log.timestamp }}</small>
                                </div>
                                <div class="log-content">{{ log.message }}</div>
                                <div v-if="log.result" class="mt-2 text-500">
                                    {{ t('hierarchical.log.result') }}: {{ log.result }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Configuration Panel -->
            <div class="col-12 lg:col-4">
                <div class="card">
                    <h3 class="text-xl font-bold mb-4">{{ t('hierarchical.config.title') }}</h3>

                    <!-- Team Structure -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('hierarchical.config.structure.title') }}</h4>
                        <div class="field mb-2">
                            <label class="block mb-1">{{ t('hierarchical.config.structure.teamSize') }}</label>
                            <Dropdown
                                v-model="teamConfig.size"
                                :options="teamSizes"
                                optionLabel="name"
                                class="w-full"
                            />
                        </div>
                        <div class="field">
                            <label class="block mb-1">{{ t('hierarchical.config.structure.hierarchy') }}</label>
                            <Dropdown
                                v-model="teamConfig.hierarchy"
                                :options="hierarchyTypes"
                                optionLabel="name"
                                class="w-full"
                            />
                        </div>
                    </div>

                    <!-- Communication Settings -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('hierarchical.config.communication.title') }}</h4>
                        <div class="field-checkbox mb-2">
                            <Checkbox v-model="communicationConfig.crossTeam" :binary="true" />
                            <label class="ml-2">{{ t('hierarchical.config.communication.crossTeam') }}</label>
                        </div>
                        <div class="field-checkbox mb-2">
                            <Checkbox v-model="communicationConfig.directToManager" :binary="true" />
                            <label class="ml-2">{{ t('hierarchical.config.communication.directToManager') }}</label>
                        </div>
                    </div>

                    <!-- Specializations -->
                    <div class="mb-4">
                        <h4 class="font-medium mb-2">{{ t('hierarchical.config.specializations.title') }}</h4>
                        <div v-for="(spec, index) in specializations" :key="index" class="field-checkbox mb-2">
                            <Checkbox v-model="spec.enabled" :binary="true" />
                            <label class="ml-2">{{ spec.name }}</label>
                            <small class="block text-500 ml-4">{{ spec.description }}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// State
const isRunning = ref(false);
const taskInput = ref('');
const activityLog = ref([]);

// Team Configuration
const teamSizes = ref([
    { name: t('hierarchical.sizes.small'), value: 'small' },
    { name: t('hierarchical.sizes.medium'), value: 'medium' },
    { name: t('hierarchical.sizes.large'), value: 'large' }
]);

const hierarchyTypes = ref([
    { name: t('hierarchical.hierarchyTypes.flat'), value: 'flat' },
    { name: t('hierarchical.hierarchyTypes.pyramid'), value: 'pyramid' },
    { name: t('hierarchical.hierarchyTypes.matrix'), value: 'matrix' }
]);

const teamConfig = ref({
    size: teamSizes.value[1],
    hierarchy: hierarchyTypes.value[1]
});

// Communication Configuration
const communicationConfig = ref({
    crossTeam: true,
    directToManager: false
});

// Specializations
const specializations = ref([
    {
        name: t('hierarchical.specializations.research'),
        description: t('hierarchical.specializations.researchDesc'),
        enabled: true
    },
    {
        name: t('hierarchical.specializations.analysis'),
        description: t('hierarchical.specializations.analysisDesc'),
        enabled: true
    },
    {
        name: t('hierarchical.specializations.implementation'),
        description: t('hierarchical.specializations.implementationDesc'),
        enabled: true
    }
]);

// Team Structure
const teamLeaders = ref([
    {
        id: 'leader1',
        name: t('hierarchical.teams.research'),
        description: t('hierarchical.teams.researchDesc')
    },
    {
        id: 'leader2',
        name: t('hierarchical.teams.implementation'),
        description: t('hierarchical.teams.implementationDesc')
    }
]);

const teamMembers = ref([
    {
        id: 'member1',
        name: t('hierarchical.members.researcher'),
        role: t('hierarchical.roles.researcher')
    },
    {
        id: 'member2',
        name: t('hierarchical.members.analyst'),
        role: t('hierarchical.roles.analyst')
    },
    {
        id: 'member3',
        name: t('hierarchical.members.developer'),
        role: t('hierarchical.roles.developer')
    }
]);

// Methods
const getAgentStatus = (agentId) => {
    if (!isRunning.value) return 'surface-card';
    // Simulate different states
    const states = {
        manager: 'surface-card border-primary-500 border-2',
        leader1: 'surface-card border-green-500 border-2',
        leader2: 'surface-card border-blue-500 border-2',
        member1: 'surface-card border-yellow-500 border-2',
        member2: 'surface-card border-pink-500 border-2',
        member3: 'surface-card border-purple-500 border-2'
    };
    return states[agentId] || 'surface-card';
};

const getLogIcon = (type) => {
    const icons = {
        task: 'pi pi-check-circle text-success',
        communication: 'pi pi-comments text-primary',
        decision: 'pi pi-star text-warning',
        error: 'pi pi-exclamation-circle text-danger'
    };
    return icons[type] || 'pi pi-info-circle';
};

const startSimulation = async () => {
    if (!taskInput.value.trim()) return;

    isRunning.value = true;
    activityLog.value = [];

    // Simulate hierarchical team interaction
    const simulateActivity = async (agent, type, message, delay = 1000) => {
        await new Promise(resolve => setTimeout(resolve, delay));
        activityLog.value.push({
            agent,
            type,
            message,
            timestamp: new Date().toLocaleTimeString(),
            highlight: type === 'decision'
        });
    };

    // Simulate team workflow
    await simulateActivity(
        t('hierarchical.roles.manager'),
        'task',
        'Analyzing task requirements and delegating responsibilities'
    );

    await simulateActivity(
        t('hierarchical.teams.research'),
        'communication',
        'Initiating research phase with team members'
    );

    await simulateActivity(
        t('hierarchical.members.researcher'),
        'task',
        'Gathering relevant information and data'
    );

    await simulateActivity(
        t('hierarchical.teams.implementation'),
        'decision',
        'Proposing implementation strategy based on research findings'
    );

    await simulateActivity(
        t('hierarchical.members.developer'),
        'task',
        'Beginning implementation of proposed solution'
    );

    isRunning.value = false;
};

const resetSimulation = () => {
    taskInput.value = '';
    activityLog.value = [];
    isRunning.value = false;
};
</script>

<style scoped>
.hierarchical-teams {
    padding: 1rem;
}

.team-level {
    margin-bottom: 2rem;
    text-align: center;
}

.team-member {
    transition: all 0.3s ease;
    height: 100%;
}

.team-member i {
    display: block;
}

.log-entry {
    transition: all 0.3s ease;
}

.hierarchy-visualization {
    min-height: 400px;
}
</style>
