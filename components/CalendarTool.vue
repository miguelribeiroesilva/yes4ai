<template>
  <div class="calendar-tool">
    <div class="card">
      <!-- Header -->
      <div class="flex items-center justify-between mb-3 pb-2 border-b surface-border">
        <div class="flex items-center">
          <i class="pi pi-calendar mr-2 text-xl"></i>
          <h2 class="text-xl font-bold m-0">Calendar Tool</h2>
        </div>
        <div class="flex items-center gap-2">
          <Button v-if="isAuthenticated" 
                 icon="pi pi-sign-out" 
                 class="p-button-text"
                 @click="handleLogout" />
          <Button v-else
                 icon="pi pi-google" 
                 class="p-button-text"
                 @click="handleLogin" />
        </div>
      </div>

      <!-- Authentication Required Message -->
      <div v-if="!isAuthenticated" class="flex flex-column align-items-center gap-3 py-5">
        <i class="pi pi-lock text-4xl"></i>
        <div class="text-xl">Please authenticate with Google Calendar to continue</div>
        <Button label="Sign in with Google" 
                icon="pi pi-google"
                @click="handleLogin" />
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Calendar Selection -->
        <div class="mb-3">
          <Dropdown v-model="selectedCalendar"
                   :options="calendars"
                   optionLabel="summary"
                   placeholder="Select a calendar"
                   class="w-full" />
        </div>

        <!-- Actions -->
        <div class="flex gap-2 mb-3">
          <Button label="New Event" 
                  icon="pi pi-plus"
                  @click="showEventDialog = true" />
          <Button label="Check Availability"
                  icon="pi pi-clock"
                  class="p-button-outlined"
                  @click="showAvailabilityDialog = true" />
          <Button label="Refresh"
                  icon="pi pi-refresh"
                  class="p-button-outlined"
                  @click="refreshEvents" />
        </div>

        <!-- Date Range -->
        <div class="mb-3 flex gap-2">
          <Calendar v-model="dateRange[0]"
                   :showIcon="true"
                   placeholder="Start date"
                   class="w-full" />
          <Calendar v-model="dateRange[1]"
                   :showIcon="true"
                   placeholder="End date"
                   class="w-full" />
        </div>

        <!-- Events -->
        <div class="events-list">
          <DataTable v-if="events.length > 0"
                    :value="events"
                    :paginator="true"
                    :rows="10"
                    :loading="isLoading"
                    class="p-datatable-sm">
            <Column field="summary" header="Event">
              <template #body="{ data }">
                <div class="flex flex-column">
                  <div class="font-semibold">{{ data.summary }}</div>
                  <div class="text-sm text-500">{{ data.description || 'No description' }}</div>
                </div>
              </template>
            </Column>
            <Column field="start" header="Start" style="width: 200px">
              <template #body="{ data }">
                <div class="text-sm">{{ formatDateTime(data.start) }}</div>
              </template>
            </Column>
            <Column field="end" header="End" style="width: 200px">
              <template #body="{ data }">
                <div class="text-sm">{{ formatDateTime(data.end) }}</div>
              </template>
            </Column>
            <Column style="width: 100px">
              <template #body="{ data }">
                <Button icon="pi pi-ellipsis-v"
                        class="p-button-text p-button-sm"
                        @click="showEventMenu($event, data)" />
              </template>
            </Column>
          </DataTable>
          <div v-else-if="!isLoading" class="text-center py-5 text-500">
            No events found
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <ProgressSpinner />
      </div>
    </div>

    <!-- New Event Dialog -->
    <Dialog v-model:visible="showEventDialog"
            header="New Event"
            :modal="true"
            :style="{ width: '50vw' }">
      <div class="flex flex-column gap-3">
        <div class="field">
          <label for="summary" class="block mb-2">Summary</label>
          <InputText id="summary" v-model="newEvent.summary" class="w-full" />
        </div>
        <div class="field">
          <label for="description" class="block mb-2">Description</label>
          <Textarea id="description" 
                   v-model="newEvent.description" 
                   class="w-full" 
                   rows="3"
                   autoResize />
        </div>
        <div class="field">
          <label for="location" class="block mb-2">Location</label>
          <InputText id="location" v-model="newEvent.location" class="w-full" />
        </div>
        <div class="field">
          <label class="block mb-2">Date & Time</label>
          <div class="flex gap-2">
            <Calendar v-model="newEvent.start"
                     :showTime="true"
                     :showIcon="true"
                     placeholder="Start"
                     class="w-full" />
            <Calendar v-model="newEvent.end"
                     :showTime="true"
                     :showIcon="true"
                     placeholder="End"
                     class="w-full" />
          </div>
        </div>
        <div class="field">
          <label for="attendees" class="block mb-2">Attendees</label>
          <Chips v-model="newEvent.attendees" 
                 placeholder="Enter email and press enter"
                 class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel"
                class="p-button-text"
                @click="showEventDialog = false" />
        <Button label="Create"
                :loading="isLoading"
                @click="handleCreateEvent" />
      </template>
    </Dialog>

    <!-- Availability Dialog -->
    <Dialog v-model:visible="showAvailabilityDialog"
            header="Check Availability"
            :modal="true"
            :style="{ width: '40vw' }">
      <div class="flex flex-column gap-3">
        <div class="field">
          <label class="block mb-2">Time Range</label>
          <div class="flex gap-2">
            <Calendar v-model="availabilityRange[0]"
                     :showTime="true"
                     :showIcon="true"
                     placeholder="Start"
                     class="w-full" />
            <Calendar v-model="availabilityRange[1]"
                     :showTime="true"
                     :showIcon="true"
                     placeholder="End"
                     class="w-full" />
          </div>
        </div>
        <div class="field">
          <label class="block mb-2">Calendars</label>
          <MultiSelect v-model="selectedCalendarsForAvailability"
                      :options="calendars"
                      optionLabel="summary"
                      placeholder="Select calendars"
                      class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel"
                class="p-button-text"
                @click="showAvailabilityDialog = false" />
        <Button label="Check"
                :loading="isLoading"
                @click="handleCheckAvailability" />
      </template>
    </Dialog>

    <!-- Event Menu -->
    <Menu ref="eventMenu" :model="eventMenuItems" :popup="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCalendarTool } from '~/composables/useCalendarTool';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const eventMenu = ref();
const showEventDialog = ref(false);
const showAvailabilityDialog = ref(false);
const selectedEvent = ref(null);
const dateRange = ref([new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]);
const availabilityRange = ref([new Date(), new Date(Date.now() + 24 * 60 * 60 * 1000)]);
const selectedCalendarsForAvailability = ref([]);

const {
  isAuthenticated,
  isLoading,
  events,
  calendars,
  selectedCalendar,
  error,
  authenticate,
  logout,
  listCalendars,
  searchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  checkAvailability
} = useCalendarTool();

const newEvent = ref({
  summary: '',
  description: '',
  location: '',
  start: new Date(),
  end: new Date(Date.now() + 3600000),
  attendees: []
});

const eventMenuItems = computed(() => [
  {
    label: 'Edit',
    icon: 'pi pi-pencil',
    command: () => handleEditEvent(selectedEvent.value)
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    class: 'text-red-600',
    command: () => handleDeleteEvent(selectedEvent.value)
  }
]);

// Authentication handlers
const handleLogin = async () => {
  try {
    await authenticate();
    await listCalendars();
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Successfully authenticated with Google Calendar',
      life: 3000
    });
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to authenticate with Google Calendar',
      life: 3000
    });
  }
};

const handleLogout = () => {
  logout();
  toast.add({
    severity: 'info',
    summary: 'Logged Out',
    detail: 'Successfully logged out from Google Calendar',
    life: 3000
  });
};

// Event handlers
const refreshEvents = async () => {
  if (!selectedCalendar.value) {
    toast.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Please select a calendar first',
      life: 3000
    });
    return;
  }

  try {
    await searchEvents({
      calendarId: selectedCalendar.value.id,
      timeMin: dateRange.value[0],
      timeMax: dateRange.value[1]
    });
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to refresh events',
      life: 3000
    });
  }
};

const handleCreateEvent = async () => {
  if (!selectedCalendar.value) {
    toast.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Please select a calendar first',
      life: 3000
    });
    return;
  }

  try {
    const event = await createEvent(selectedCalendar.value.id, newEvent.value);
    if (event) {
      showEventDialog.value = false;
      resetNewEvent();
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Event created successfully',
        life: 3000
      });
      await refreshEvents();
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create event',
      life: 3000
    });
  }
};

const handleEditEvent = (event: any) => {
  // TODO: Implement event editing
  console.log('Edit event:', event);
};

const handleDeleteEvent = async (event: any) => {
  if (!selectedCalendar.value) return;

  try {
    const success = await deleteEvent(selectedCalendar.value.id, event.id);
    if (success) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Event deleted successfully',
        life: 3000
      });
      await refreshEvents();
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete event',
      life: 3000
    });
  }
};

const handleCheckAvailability = async () => {
  if (!selectedCalendarsForAvailability.value.length) {
    toast.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Please select at least one calendar',
      life: 3000
    });
    return;
  }

  try {
    const availability = await checkAvailability(
      availabilityRange.value[0],
      availabilityRange.value[1],
      selectedCalendarsForAvailability.value.map(cal => cal.id)
    );
    
    // TODO: Display availability results in a more user-friendly way
    console.log('Availability:', availability);
    
    showAvailabilityDialog.value = false;
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to check availability',
      life: 3000
    });
  }
};

// Utility functions
const showEventMenu = (event: Event, eventData: any) => {
  selectedEvent.value = eventData;
  eventMenu.value.show(event);
};

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('default', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

const resetNewEvent = () => {
  newEvent.value = {
    summary: '',
    description: '',
    location: '',
    start: new Date(),
    end: new Date(Date.now() + 3600000),
    attendees: []
  };
};

// Initialize
onMounted(async () => {
  if (isAuthenticated.value) {
    await listCalendars();
  }
});
</script>

<style scoped>
.calendar-tool {
  height: 100%;
  position: relative;
}

.events-list {
  max-height: 600px;
  overflow-y: auto;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
</style>
