<template>
  <div class="gmail-tool">
    <div class="card">
      <!-- Header -->
      <div class="flex items-center justify-between mb-3 pb-2 border-b surface-border">
        <div class="flex items-center">
          <i class="pi pi-envelope mr-2 text-xl"></i>
          <h2 class="text-xl font-bold m-0">Gmail Tool</h2>
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
        <div class="text-xl">Please authenticate with Gmail to continue</div>
        <Button label="Sign in with Google" 
                icon="pi pi-google"
                @click="handleLogin" />
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Search Section -->
        <div class="mb-3">
          <span class="p-input-icon-left w-full">
            <i class="pi pi-search"></i>
            <InputText v-model="searchQuery" 
                      class="w-full"
                      placeholder="Search emails..."
                      @keyup.enter="handleSearch" />
          </span>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 mb-3">
          <Button label="Compose" 
                  icon="pi pi-plus"
                  @click="showComposeDialog = true" />
          <Button label="Refresh"
                  icon="pi pi-refresh"
                  class="p-button-outlined"
                  @click="handleSearch" />
        </div>

        <!-- Results -->
        <div class="email-list">
          <DataTable v-if="messages.length > 0"
                    :value="messages"
                    :paginator="true"
                    :rows="10"
                    :loading="isLoading"
                    class="p-datatable-sm">
            <Column field="from" header="From" style="width: 200px">
              <template #body="{ data }">
                <div class="text-sm">{{ data.from }}</div>
              </template>
            </Column>
            <Column field="subject" header="Subject">
              <template #body="{ data }">
                <div class="flex flex-column">
                  <div class="font-semibold">{{ data.subject }}</div>
                  <div class="text-sm text-500">{{ data.snippet }}</div>
                </div>
              </template>
            </Column>
            <Column field="date" header="Date" style="width: 150px">
              <template #body="{ data }">
                <div class="text-sm">{{ formatDate(data.date) }}</div>
              </template>
            </Column>
            <Column style="width: 100px">
              <template #body="{ data }">
                <Button icon="pi pi-ellipsis-v"
                        class="p-button-text p-button-sm"
                        @click="showMessageMenu($event, data)" />
              </template>
            </Column>
          </DataTable>
          <div v-else-if="!isLoading" class="text-center py-5 text-500">
            No messages found
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <ProgressSpinner />
      </div>
    </div>

    <!-- Compose Dialog -->
    <Dialog v-model:visible="showComposeDialog"
            header="Compose Email"
            :modal="true"
            :style="{ width: '50vw' }">
      <div class="flex flex-column gap-3">
        <div class="field">
          <label for="to" class="block mb-2">To</label>
          <InputText id="to" v-model="newEmail.to" class="w-full" />
        </div>
        <div class="field">
          <label for="subject" class="block mb-2">Subject</label>
          <InputText id="subject" v-model="newEmail.subject" class="w-full" />
        </div>
        <div class="field">
          <label for="body" class="block mb-2">Message</label>
          <Textarea id="body" 
                   v-model="newEmail.body" 
                   class="w-full" 
                   rows="10"
                   autoResize />
        </div>
      </div>
      <template #footer>
        <Button label="Save as Draft"
                class="p-button-text"
                :loading="isLoading"
                @click="handleSaveDraft" />
        <Button label="Send"
                :loading="isLoading"
                @click="handleSendEmail" />
      </template>
    </Dialog>

    <!-- Message Menu -->
    <Menu ref="messageMenu" :model="messageMenuItems" :popup="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGmailTool } from '~/composables/useGmailTool';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const messageMenu = ref();
const searchQuery = ref('');
const showComposeDialog = ref(false);
const selectedMessage = ref(null);

const {
  isAuthenticated,
  isLoading,
  messages,
  error,
  authenticate,
  logout,
  searchEmails,
  createDraft,
  sendEmail,
  addLabel,
  removeLabel
} = useGmailTool();

const newEmail = ref({
  to: '',
  subject: '',
  body: ''
});

const messageMenuItems = computed(() => [
  {
    label: 'Open Thread',
    icon: 'pi pi-comments',
    command: () => handleOpenThread(selectedMessage.value)
  },
  {
    label: 'Mark as Read',
    icon: 'pi pi-check',
    command: () => handleMarkAsRead(selectedMessage.value)
  },
  {
    label: 'Archive',
    icon: 'pi pi-inbox',
    command: () => handleArchive(selectedMessage.value)
  },
  {
    separator: true
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    class: 'text-red-600',
    command: () => handleDelete(selectedMessage.value)
  }
]);

// Authentication handlers
const handleLogin = async () => {
  try {
    await authenticate();
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Successfully authenticated with Gmail',
      life: 3000
    });
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to authenticate with Gmail',
      life: 3000
    });
  }
};

const handleLogout = () => {
  logout();
  toast.add({
    severity: 'info',
    summary: 'Logged Out',
    detail: 'Successfully logged out from Gmail',
    life: 3000
  });
};

// Search handler
const handleSearch = async () => {
  try {
    await searchEmails({
      query: searchQuery.value,
      maxResults: 20
    });
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to search emails',
      life: 3000
    });
  }
};

// Email composition handlers
const handleSaveDraft = async () => {
  try {
    const success = await createDraft(newEmail.value);
    if (success) {
      showComposeDialog.value = false;
      resetNewEmail();
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Draft saved successfully',
        life: 3000
      });
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save draft',
      life: 3000
    });
  }
};

const handleSendEmail = async () => {
  try {
    const success = await sendEmail(newEmail.value);
    if (success) {
      showComposeDialog.value = false;
      resetNewEmail();
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Email sent successfully',
        life: 3000
      });
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to send email',
      life: 3000
    });
  }
};

// Message menu handlers
const showMessageMenu = (event: Event, message: any) => {
  selectedMessage.value = message;
  messageMenu.value.show(event);
};

const handleOpenThread = (message: any) => {
  // TODO: Implement thread view
  console.log('Open thread:', message);
};

const handleMarkAsRead = async (message: any) => {
  try {
    await removeLabel(message.id, 'UNREAD');
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Message marked as read',
      life: 3000
    });
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to mark message as read',
      life: 3000
    });
  }
};

const handleArchive = async (message: any) => {
  try {
    await addLabel(message.id, 'ARCHIVED');
    await removeLabel(message.id, 'INBOX');
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Message archived',
      life: 3000
    });
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to archive message',
      life: 3000
    });
  }
};

const handleDelete = async (message: any) => {
  try {
    await addLabel(message.id, 'TRASH');
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Message moved to trash',
      life: 3000
    });
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete message',
      life: 3000
    });
  }
};

// Utility functions
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('default', {
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const resetNewEmail = () => {
  newEmail.value = {
    to: '',
    subject: '',
    body: ''
  };
};
</script>

<style scoped>
.gmail-tool {
  height: 100%;
  position: relative;
}

.email-list {
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
