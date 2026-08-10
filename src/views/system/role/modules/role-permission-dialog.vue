<template>
  <ElDialog
    v-model="visible"
    :title="`菜单权限${roleData ? ` - ${roleData.roleName}` : ''}`"
    width="560px"
    align-center
    @closed="resetTree"
  >
    <ElScrollbar v-loading="loading" height="60vh">
      <ElTree
        ref="treeRef"
        :data="treeData"
        node-key="key"
        show-checkbox
        check-strictly
        default-expand-all
        :props="{ children: 'children', label: 'label' }"
        @check="syncSelectAll"
      >
        <template #default="{ data }">
          <div class="flex items-center gap-2">
            <ElTag v-if="data.type === 'permission'" size="small" type="info">按钮</ElTag>
            <span>{{ data.label }}</span>
          </div>
        </template>
      </ElTree>
    </ElScrollbar>

    <template #footer>
      <ElButton @click="toggleSelectAll">{{ isSelectAll ? '取消全选' : '全部选择' }}</ElButton>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="saving" @click="savePermission">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchGetRoleGrants, fetchUpdateRoleGrants } from '@/api/system-manage'
  import { ElMessage } from 'element-plus'
  import { computed, nextTick, ref, watch } from 'vue'

  type RoleListItem = Api.SystemManage.RoleListItem
  type MenuItem = Api.SystemManage.MenuItem

  interface GrantTreeNode {
    key: string
    id: number
    type: 'menu' | 'permission'
    label: string
    children?: GrantTreeNode[]
  }

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      roleData?: RoleListItem
    }>(),
    {
      modelValue: false,
      roleData: undefined
    }
  )
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const treeRef = ref()
  const treeData = ref<GrantTreeNode[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const isSelectAll = ref(false)

  const toTreeNode = (menu: MenuItem): GrantTreeNode => {
    const menuChildren = (menu.children || []).map(toTreeNode)
    const permissionChildren = (menu.meta.authList || []).map((permission) => ({
      key: `permission:${permission.id}`,
      id: permission.id,
      type: 'permission' as const,
      label: `${permission.title}（${permission.authMark}）`
    }))
    const children = [...menuChildren, ...permissionChildren]
    return {
      key: `menu:${menu.id}`,
      id: menu.id,
      type: 'menu',
      label: menu.meta.title,
      children: children.length ? children : undefined
    }
  }

  const loadGrants = async () => {
    if (!props.roleData) return
    loading.value = true
    try {
      const response = await fetchGetRoleGrants(props.roleData.roleId)
      treeData.value = response.menuTree.map(toTreeNode)
      const checkedKeys = [
        ...response.menuIds.map((id) => `menu:${id}`),
        ...response.permissionIds.map((id) => `permission:${id}`)
      ]
      await nextTick()
      treeRef.value?.setCheckedKeys(checkedKeys)
      syncSelectAll()
    } finally {
      loading.value = false
    }
  }

  watch(
    () => props.modelValue,
    (value) => {
      if (value) loadGrants()
    }
  )

  const allKeys = () => {
    const keys: string[] = []
    const walk = (nodes: GrantTreeNode[]) => {
      nodes.forEach((node) => {
        keys.push(node.key)
        if (node.children) walk(node.children)
      })
    }
    walk(treeData.value)
    return keys
  }

  const syncSelectAll = () => {
    const checkedKeys = treeRef.value?.getCheckedKeys() || []
    isSelectAll.value = checkedKeys.length > 0 && checkedKeys.length === allKeys().length
  }

  const toggleSelectAll = () => {
    treeRef.value?.setCheckedKeys(isSelectAll.value ? [] : allKeys())
    syncSelectAll()
  }

  const resetTree = () => {
    treeRef.value?.setCheckedKeys([])
    treeData.value = []
    isSelectAll.value = false
  }

  const savePermission = async () => {
    if (!props.roleData) return
    const checkedKeys = (treeRef.value?.getCheckedKeys() || []) as string[]
    const data: Api.SystemManage.RoleGrantRequest = {
      menuIds: checkedKeys
        .filter((key) => key.startsWith('menu:'))
        .map((key) => Number(key.slice(5))),
      permissionIds: checkedKeys
        .filter((key) => key.startsWith('permission:'))
        .map((key) => Number(key.slice(11)))
    }
    saving.value = true
    try {
      await fetchUpdateRoleGrants(props.roleData.roleId, data)
      ElMessage.success('权限保存成功')
      emit('success')
      visible.value = false
    } finally {
      saving.value = false
    }
  }
</script>
