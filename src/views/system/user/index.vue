<template>
  <div class="user-page art-full-height">
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton v-auth="'system:user:create'" @click="showDialog('add')" v-ripple>
            新增用户
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

      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @success="refreshData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { useAuth } from '@/hooks/core/useAuth'
  import { fetchGetUserList, fetchUpdateUserStatus } from '@/api/system-manage'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElMessage, ElMessageBox, ElTag } from 'element-plus'
  import { h, ref } from 'vue'
  import type { DialogType } from '@/types'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem
  const { hasAuth } = useAuth()

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})
  const searchForm = ref<Api.SystemManage.UserSearchParams>({
    userName: undefined
  })

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
      apiFn: fetchGetUserList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'userName',
          label: '用户',
          minWidth: 150,
          formatter: (row) =>
            h('div', [
              h('p', { class: 'm-0 font-medium' }, row.userName),
              h('p', { class: 'm-0 text-xs text-g-600' }, row.nickName || '-')
            ])
        },
        {
          prop: 'userRoles',
          label: '角色',
          minWidth: 180,
          formatter: (row) =>
            h(
              'div',
              { class: 'flex flex-wrap gap-1' },
              row.userRoles.length
                ? row.userRoles.map((roleCode) =>
                    h(ElTag, { size: 'small', type: 'info' }, () => roleCode)
                  )
                : '-'
            )
        },
        { prop: 'userPhone', label: '手机号', minWidth: 130 },
        { prop: 'userEmail', label: '邮箱', minWidth: 180, showOverflowTooltip: true },
        {
          prop: 'status',
          label: '状态',
          width: 90,
          formatter: (row) =>
            h(ElTag, { type: row.status === '1' ? 'success' : 'info' }, () =>
              row.status === '1' ? '启用' : '禁用'
            )
        },
        { prop: 'createTime', label: '创建时间', width: 180 },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row) => {
            const actions = []
            if (hasAuth('system:user:update')) {
              actions.push(
                h(ArtButtonTable, {
                  type: 'edit',
                  title: '编辑用户',
                  onClick: () => showDialog('edit', row)
                })
              )
            }
            if (hasAuth('system:user:disable')) {
              const enabled = row.status === '1'
              actions.push(
                h(ArtButtonTable, {
                  icon: enabled ? 'ri:forbid-line' : 'ri:checkbox-circle-line',
                  iconClass: enabled ? 'bg-error/12 text-error' : 'bg-success/12 text-success',
                  title: enabled ? '禁用用户' : '启用用户',
                  onClick: () => toggleUserStatus(row)
                })
              )
            }
            return h('div', actions)
          }
        }
      ]
    }
  })

  const handleSearch = (params: Api.SystemManage.UserSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  const showDialog = (type: DialogType, row?: UserListItem) => {
    dialogType.value = type
    currentUserData.value = row || {}
    dialogVisible.value = true
  }

  const toggleUserStatus = async (row: UserListItem) => {
    const enabled = row.status !== '1'
    const action = enabled ? '启用' : '禁用'
    await ElMessageBox.confirm(`确定要${action}用户“${row.userName}”吗？`, `${action}用户`, {
      confirmButtonText: action,
      cancelButtonText: '取消',
      type: enabled ? 'info' : 'warning'
    })
    await fetchUpdateUserStatus(row.id, enabled)
    ElMessage.success(`${action}成功`)
    refreshData()
  }
</script>
