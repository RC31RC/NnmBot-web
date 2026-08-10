<template>
  <div class="art-full-height">
    <RoleSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card" :style="{ marginTop: showSearchBar ? '12px' : '0' }">
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElButton v-auth="'system:role:create'" @click="showDialog('add')" v-ripple>
            新增角色
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <RoleEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :role-data="currentRoleData"
      @success="refreshData"
    />

    <RolePermissionDialog
      v-model="permissionDialog"
      :role-data="currentRoleData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import type { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { useAuth } from '@/hooks/core/useAuth'
  import { fetchDeleteRole, fetchGetRoleList } from '@/api/system-manage'
  import RoleSearch from './modules/role-search.vue'
  import RoleEditDialog from './modules/role-edit-dialog.vue'
  import RolePermissionDialog from './modules/role-permission-dialog.vue'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { h, ref } from 'vue'

  defineOptions({ name: 'Role' })

  type RoleListItem = Api.SystemManage.RoleListItem
  const { hasAuth } = useAuth()

  const searchForm = ref<Api.SystemManage.RoleSearchParams>({
    roleName: undefined
  })
  const showSearchBar = ref(false)
  const dialogVisible = ref(false)
  const permissionDialog = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentRoleData = ref<RoleListItem>()

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchGetRoleList,
      apiParams: {
        current: 1,
        size: 20
      },
      columnsFactory: () => [
        { prop: 'roleId', label: '角色 ID', width: 100 },
        { prop: 'roleName', label: '角色名称', minWidth: 130 },
        { prop: 'roleCode', label: '角色编码', minWidth: 140 },
        {
          prop: 'dataScope',
          label: '数据范围',
          width: 100,
          formatter: (row) =>
            h(ElTag, { type: row.dataScope === 'ALL' ? 'primary' : 'info' }, () =>
              row.dataScope === 'ALL' ? '全部' : '本人'
            )
        },
        {
          prop: 'description',
          label: '角色描述',
          minWidth: 160,
          showOverflowTooltip: true
        },
        {
          prop: 'enabled',
          label: '状态',
          width: 90,
          formatter: (row) =>
            h(ElTag, { type: row.enabled ? 'success' : 'info' }, () =>
              row.enabled ? '启用' : '禁用'
            )
        },
        { prop: 'createTime', label: '创建时间', width: 180 },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row) => {
            const actions: ButtonMoreItem[] = []
            if (hasAuth('system:role:assign')) {
              actions.push({
                key: 'permission',
                label: '菜单权限',
                icon: 'ri:key-2-line'
              })
            }
            if (hasAuth('system:role:update')) {
              actions.push({
                key: 'edit',
                label: '编辑角色',
                icon: 'ri:edit-2-line'
              })
            }
            if (hasAuth('system:role:delete')) {
              actions.push({
                key: 'delete',
                label: '删除角色',
                icon: 'ri:delete-bin-4-line',
                color: '#f56c6c',
                disabled: row.roleCode === 'R_SUPER'
              })
            }
            return h(ArtButtonMore, {
              list: actions,
              onClick: (item: ButtonMoreItem) => handleAction(item, row)
            })
          }
        }
      ]
    }
  })

  const showDialog = (type: 'add' | 'edit', row?: RoleListItem) => {
    dialogType.value = type
    currentRoleData.value = row
    dialogVisible.value = true
  }

  const handleSearch = (params: Api.SystemManage.RoleSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  const handleAction = (item: ButtonMoreItem, row: RoleListItem) => {
    if (item.key === 'permission') {
      currentRoleData.value = row
      permissionDialog.value = true
    } else if (item.key === 'edit') {
      showDialog('edit', row)
    } else if (item.key === 'delete') {
      deleteRole(row)
    }
  }

  const deleteRole = async (row: RoleListItem) => {
    await ElMessageBox.confirm(`确定删除角色“${row.roleName}”吗？`, '删除角色', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await fetchDeleteRole(row.roleId)
    ElMessage.success('删除成功')
    refreshData()
  }
</script>
