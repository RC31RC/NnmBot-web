<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    @reset="emit('reset')"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  const props = defineProps<{
    modelValue: Api.SystemManage.UserSearchParams
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', value: Api.SystemManage.UserSearchParams): void
    (e: 'search', params: Api.SystemManage.UserSearchParams): void
    (e: 'reset'): void
  }>()

  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const formItems = [
    {
      label: '用户名',
      key: 'userName',
      type: 'input',
      props: {
        placeholder: '请输入用户名',
        clearable: true
      }
    }
  ]

  const handleSearch = async (params: Api.SystemManage.UserSearchParams) => {
    await searchBarRef.value?.validate()
    emit('search', params)
  }
</script>
