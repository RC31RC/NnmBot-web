<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" style="margin-top: 0">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="loadSessions" />
      <ArtTable :loading="loading" :data="sessions" :columns="columns" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { fetchGetSessionList, fetchKickoutSession } from '@/api/system-manage'
  import { useAuth } from '@/hooks/core/useAuth'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { useUserStore } from '@/store/modules/user'
  import { ElMessage, ElMessageBox, ElTag, ElTooltip } from 'element-plus'
  import { h, onMounted, ref } from 'vue'

  defineOptions({ name: 'OnlineSession' })

  type SessionItem = Api.SystemManage.SessionItem
  const { hasAuth } = useAuth()
  const userStore = useUserStore()
  const loading = ref(false)
  const sessions = ref<SessionItem[]>([])

  const { columnChecks, columns } = useTableColumns<SessionItem>(() => [
    { prop: 'userName', label: '用户名', minWidth: 130 },
    { prop: 'deviceType', label: '设备', width: 120 },
    { prop: 'loginTime', label: '登录时间', width: 180 },
    {
      prop: 'timeout',
      label: '剩余时间',
      width: 130,
      formatter: (row) => (row.timeout < 0 ? '长期有效' : `${row.timeout} 秒`)
    },
    {
      prop: 'token',
      label: 'Token',
      minWidth: 220,
      formatter: (row) =>
        h(ElTooltip, { content: row.token, placement: 'top' }, () =>
          h('span', { class: 'font-mono text-xs' }, `${row.token.slice(0, 18)}...`)
        )
    },
    {
      prop: 'operation',
      label: '操作',
      width: 120,
      fixed: 'right',
      formatter: (row) => {
        if (row.token === userStore.accessToken) {
          return h(ElTag, { type: 'success' }, () => '当前会话')
        }
        if (!hasAuth('system:session:kickout')) return '-'
        return h(ArtButtonTable, {
          icon: 'ri:logout-box-r-line',
          iconClass: 'bg-error/12 text-error',
          title: '强制下线',
          onClick: () => kickout(row)
        })
      }
    }
  ])

  const loadSessions = async () => {
    loading.value = true
    try {
      sessions.value = await fetchGetSessionList()
    } finally {
      loading.value = false
    }
  }

  const kickout = async (row: SessionItem) => {
    await ElMessageBox.confirm(`确定强制下线用户“${row.userName}”的该会话吗？`, '强制下线', {
      confirmButtonText: '下线',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await fetchKickoutSession(row.token)
    ElMessage.success('会话已下线')
    loadSessions()
  }

  onMounted(loadSessions)
</script>
