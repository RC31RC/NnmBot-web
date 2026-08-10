<template>
  <div class="menu-page art-full-height">
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :show-expand="false"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card">
      <ArtTableHeader
        v-model:columns="columnChecks"
        :show-zebra="false"
        :loading="loading"
        @refresh="getMenuList"
      >
        <template #left>
          <ElButton v-auth="'system:menu:create'" @click="handleAddMenu" v-ripple>
            添加菜单
          </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :row-key="getRowKey"
        :loading="loading"
        :columns="columns"
        :data="filteredTableData"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
      />

      <MenuDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :edit-data="editData"
        :menu-options="menuOptions"
        :submitting="submitting"
        @submit="handleSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { formatMenuTitle } from '@/utils/router'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import type { AppRouteRecord } from '@/types/router'
  import MenuDialog from './modules/menu-dialog.vue'
  import {
    fetchCreateMenu,
    fetchCreatePermission,
    fetchDeleteMenu,
    fetchDeletePermission,
    fetchGetAllMenuList,
    fetchUpdateMenu,
    fetchUpdatePermission
  } from '@/api/system-manage'
  import { useAuth } from '@/hooks/core/useAuth'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { computed, h, nextTick, onMounted, reactive, ref } from 'vue'

  defineOptions({ name: 'Menus' })

  interface MenuFormData {
    menuType: 'menu' | 'button'
    id: number
    parentId?: number
    parentMenuId?: number
    name: string
    path: string
    label: string
    component: string
    icon: string
    isEnable: boolean
    sort: number
    keepAlive: boolean
    isHide: boolean
    authName: string
    authLabel: string
  }

  interface MenuOption {
    value: number
    label: string
  }

  const { hasAuth } = useAuth()
  const loading = ref(false)
  const submitting = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()
  const tableData = ref<AppRouteRecord[]>([])
  const dialogVisible = ref(false)
  const dialogType = ref<'menu' | 'button'>('menu')
  const editData = ref<Record<string, unknown> | AppRouteRecord>()
  const initialSearchState = { name: '', route: '' }
  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })
  const formItems = [
    {
      label: '菜单名称',
      key: 'name',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '路由地址',
      key: 'route',
      type: 'input',
      props: { clearable: true }
    }
  ]

  const getMenuList = async () => {
    loading.value = true
    try {
      tableData.value = await fetchGetAllMenuList()
    } finally {
      loading.value = false
    }
  }

  onMounted(getMenuList)

  const getRowKey = (row: AppRouteRecord) =>
    row.meta?.isAuthButton ? `permission:${row.meta.permissionId}` : `menu:${row.id}`

  const menuOptions = computed<MenuOption[]>(() => {
    const excludedIds = new Set<number>()
    const editingId =
      dialogType.value === 'menu' && editData.value && 'id' in editData.value
        ? Number(editData.value.id)
        : undefined

    const collectChildren = (nodes: AppRouteRecord[], parentMatched = false) => {
      nodes.forEach((node) => {
        const matched = parentMatched || node.id === editingId
        if (matched && node.id) excludedIds.add(node.id)
        if (node.children) collectChildren(node.children, matched)
      })
    }
    collectChildren(tableData.value)

    const options: MenuOption[] = []
    const flatten = (nodes: AppRouteRecord[], level = 0) => {
      nodes.forEach((node) => {
        if (node.id && !excludedIds.has(node.id)) {
          options.push({
            value: node.id,
            label: `${'　'.repeat(level)}${formatMenuTitle(node.meta.title)}`
          })
        }
        if (node.children) flatten(node.children, level + 1)
      })
    }
    flatten(tableData.value)
    return options
  })

  const getMenuTypeTag = (row: AppRouteRecord) => {
    if (row.meta?.isAuthButton) return 'danger'
    if (row.children?.some((child) => !child.meta?.isAuthButton)) return 'info'
    return 'primary'
  }

  const getMenuTypeText = (row: AppRouteRecord) => {
    if (row.meta?.isAuthButton) return '按钮'
    if (row.children?.some((child) => !child.meta?.isAuthButton)) return '目录'
    return '菜单'
  }

  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'meta.title',
      label: '菜单名称',
      minWidth: 150,
      formatter: (row: AppRouteRecord) => formatMenuTitle(row.meta.title)
    },
    {
      prop: 'type',
      label: '类型',
      width: 90,
      formatter: (row: AppRouteRecord) =>
        h(ElTag, { type: getMenuTypeTag(row) }, () => getMenuTypeText(row))
    },
    {
      prop: 'path',
      label: '路由',
      minWidth: 180,
      formatter: (row: AppRouteRecord) => (row.meta?.isAuthButton ? '-' : row.path)
    },
    {
      prop: 'permission',
      label: '权限标识',
      minWidth: 190,
      formatter: (row: AppRouteRecord) => (row.meta?.isAuthButton ? row.meta.authMark || '-' : '-')
    },
    {
      prop: 'sort',
      label: '排序',
      width: 80,
      formatter: (row: AppRouteRecord) => (row.meta?.isAuthButton ? '-' : row.meta?.sort || 0)
    },
    {
      prop: 'status',
      label: '状态',
      width: 90,
      formatter: (row: AppRouteRecord) =>
        h(ElTag, { type: row.meta?.isEnable === false ? 'info' : 'success' }, () =>
          row.meta?.isEnable === false ? '禁用' : '启用'
        )
    },
    {
      prop: 'operation',
      label: '操作',
      width: 180,
      align: 'right',
      formatter: (row: AppRouteRecord) => {
        const actions = []
        if (row.meta?.isAuthButton) {
          if (hasAuth('system:menu:update')) {
            actions.push(
              h(ArtButtonTable, {
                type: 'edit',
                title: '编辑权限',
                onClick: () => handleEditAuth(row)
              })
            )
          }
          if (hasAuth('system:menu:delete')) {
            actions.push(
              h(ArtButtonTable, {
                type: 'delete',
                title: '删除权限',
                onClick: () => handleDeleteAuth(row)
              })
            )
          }
        } else {
          if (hasAuth('system:menu:create')) {
            actions.push(
              h(ArtButtonTable, {
                type: 'add',
                title: '新增按钮权限',
                onClick: () => handleAddAuth(row)
              })
            )
          }
          if (hasAuth('system:menu:update')) {
            actions.push(
              h(ArtButtonTable, {
                type: 'edit',
                title: '编辑菜单',
                onClick: () => handleEditMenu(row)
              })
            )
          }
          if (hasAuth('system:menu:delete')) {
            actions.push(
              h(ArtButtonTable, {
                type: 'delete',
                title: '删除菜单',
                onClick: () => handleDeleteMenu(row)
              })
            )
          }
        }
        return h('div', { style: 'text-align: right' }, actions)
      }
    }
  ])

  const convertAuthListToChildren = (items: AppRouteRecord[]): AppRouteRecord[] =>
    items.map((item) => {
      const menuChildren = item.children ? convertAuthListToChildren(item.children) : []
      const authChildren: AppRouteRecord[] = (item.meta?.authList || []).map((auth) => ({
        path: `${item.path}__permission_${auth.id}`,
        name: `${String(item.name)}Permission${auth.id}`,
        meta: {
          title: auth.title,
          authMark: auth.authMark,
          isAuthButton: true,
          permissionId: auth.id,
          parentMenuId: item.id,
          parentPath: item.path,
          isEnable: auth.enabled
        }
      }))
      const children = [...menuChildren, ...authChildren]
      return {
        ...item,
        children: children.length ? children : undefined
      }
    })

  const searchMenu = (items: AppRouteRecord[]): AppRouteRecord[] => {
    const searchName = appliedFilters.name.toLowerCase().trim()
    const searchRoute = appliedFilters.route.toLowerCase().trim()
    return items.reduce<AppRouteRecord[]>((result, item) => {
      const matchedChildren = item.children ? searchMenu(item.children) : []
      const title = formatMenuTitle(item.meta.title).toLowerCase()
      const nameMatch = !searchName || title.includes(searchName)
      const routeMatch = !searchRoute || item.path.toLowerCase().includes(searchRoute)
      const authMatch = Boolean(
        searchName &&
          item.meta.authList?.some(
            (auth) =>
              auth.title.toLowerCase().includes(searchName) ||
              auth.authMark.toLowerCase().includes(searchName)
          )
      )
      if ((nameMatch && routeMatch) || authMatch || matchedChildren.length) {
        result.push({
          ...item,
          children: matchedChildren.length ? matchedChildren : item.children
        })
      }
      return result
    }, [])
  }

  const filteredTableData = computed(() => convertAuthListToChildren(searchMenu(tableData.value)))

  const handleReset = () => {
    Object.assign(formFilters, initialSearchState)
    Object.assign(appliedFilters, initialSearchState)
  }

  const handleSearch = () => {
    Object.assign(appliedFilters, formFilters)
  }

  const handleAddMenu = () => {
    dialogType.value = 'menu'
    editData.value = undefined
    dialogVisible.value = true
  }

  const handleAddAuth = (row: AppRouteRecord) => {
    dialogType.value = 'button'
    editData.value = {
      parentMenuId: row.id,
      parentMenuTitle: formatMenuTitle(row.meta.title)
    }
    dialogVisible.value = true
  }

  const handleEditMenu = (row: AppRouteRecord) => {
    dialogType.value = 'menu'
    editData.value = row
    dialogVisible.value = true
  }

  const handleEditAuth = (row: AppRouteRecord) => {
    dialogType.value = 'button'
    editData.value = {
      id: row.meta.permissionId,
      parentMenuId: row.meta.parentMenuId,
      parentMenuTitle: row.meta.parentPath,
      title: row.meta.title,
      authMark: row.meta.authMark,
      isEnable: row.meta.isEnable
    }
    dialogVisible.value = true
  }

  const handleSubmit = async (form: MenuFormData) => {
    submitting.value = true
    try {
      if (form.menuType === 'menu') {
        const payload: Api.SystemManage.MenuSaveRequest = {
          parentId: form.parentId || undefined,
          name: form.label,
          path: form.path,
          component: form.component || undefined,
          title: form.name,
          icon: form.icon || undefined,
          sortOrder: form.sort,
          keepAlive: form.keepAlive,
          visible: !form.isHide,
          enabled: form.isEnable
        }
        if (form.id) {
          await fetchUpdateMenu(form.id, payload)
        } else {
          await fetchCreateMenu(payload)
        }
      } else if (form.parentMenuId) {
        const payload: Api.SystemManage.PermissionSaveRequest = {
          menuId: form.parentMenuId,
          code: form.authLabel,
          name: form.authName,
          type: 'BUTTON',
          enabled: form.isEnable
        }
        if (form.id) {
          await fetchUpdatePermission(form.id, payload)
        } else {
          await fetchCreatePermission(payload)
        }
      }
      ElMessage.success(form.id ? '修改成功' : '新增成功')
      dialogVisible.value = false
      await getMenuList()
    } finally {
      submitting.value = false
    }
  }

  const handleDeleteMenu = async (row: AppRouteRecord) => {
    if (!row.id) return
    await ElMessageBox.confirm(`确定删除菜单“${formatMenuTitle(row.meta.title)}”吗？`, '删除菜单', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await fetchDeleteMenu(row.id)
    ElMessage.success('删除成功')
    getMenuList()
  }

  const handleDeleteAuth = async (row: AppRouteRecord) => {
    const permissionId = row.meta.permissionId
    if (!permissionId) return
    await ElMessageBox.confirm(`确定删除权限“${row.meta.authMark}”吗？`, '删除权限', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await fetchDeletePermission(permissionId)
    ElMessage.success('删除成功')
    getMenuList()
  }

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      const processRows = (rows: AppRouteRecord[]) => {
        rows.forEach((row) => {
          if (row.children?.length) {
            tableRef.value?.elTableRef?.toggleRowExpansion(row, isExpanded.value)
            processRows(row.children)
          }
        })
      }
      processRows(filteredTableData.value)
    })
  }
</script>
