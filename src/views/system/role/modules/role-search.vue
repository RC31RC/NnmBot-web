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
    modelValue: Api.SystemManage.RoleSearchParams
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', value: Api.SystemManage.RoleSearchParams): void
    (e: 'search', params: Api.SystemManage.RoleSearchParams): void
    (e: 'reset'): void
  }>()

  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const formItems = [
    {
      label: '角色关键词',
      key: 'roleName',
      type: 'input',
      props: {
        placeholder: '搜索角色名称或编码',
        clearable: true
      }
    }
  ]

  const handleSearch = async (params: Api.SystemManage.RoleSearchParams) => {
    await searchBarRef.value?.validate()
    emit('search', params)
  }
</script>
