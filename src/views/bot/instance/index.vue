<template>
  <div class="art-full-height">
    <ElCard class="art-table-card" style="margin-top: 0">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="loadInstances">
        <template #left>
          <ElButton v-auth="'bot:instance:create'" type="primary" @click="showDialog('add')">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增实例
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable :loading="loading" :data="instances" :columns="columns" row-key="id" />
    </ElCard>

    <InstanceDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :instance="currentInstance"
      @success="loadInstances"
    />
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { fetchDeleteBotInstance, fetchGetBotInstanceList } from '@/api/bot-management'
  import { useAuth } from '@/hooks/core/useAuth'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { ElMessage, ElMessageBox, ElTag, ElTooltip } from 'element-plus'
  import { h, onMounted, ref } from 'vue'
  import InstanceDialog from './modules/instance-dialog.vue'

  defineOptions({ name: 'BotManagement' })

  type BotInstance = Api.BotManage.BotInstance
  type RuntimeStatus = Api.BotManage.RuntimeStatus
  type DialogType = 'add' | 'edit'
  type StatusTagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'

  const { hasAuth } = useAuth()
  const loading = ref(false)
  const instances = ref<BotInstance[]>([])
  const dialogVisible = ref(false)
  const dialogType = ref<DialogType>('add')
  const currentInstance = ref<BotInstance>()

  const statusMeta: Record<RuntimeStatus, { label: string; type: StatusTagType }> = {
    PENDING_RESTART: { label: '待重启', type: 'warning' },
    DISABLED: { label: '已禁用', type: 'info' },
    DISCONNECTED: { label: '未连接', type: 'warning' },
    CONNECTING: { label: '连接中', type: 'primary' },
    CONNECTED: { label: '已连接', type: 'success' },
    ERROR: { label: '异常', type: 'danger' }
  }

  const { columnChecks, columns } = useTableColumns<BotInstance>(() => [
    {
      prop: 'platform',
      label: '协议',
      width: 120,
      formatter: (row) =>
        h(ElTag, { type: row.platform === 'QQ_OFFICIAL' ? 'success' : 'primary' }, () =>
          row.platform === 'QQ_OFFICIAL' ? 'QQ 官方' : 'OneBot'
        )
    },
    {
      prop: 'displayName',
      label: '实例',
      minWidth: 180,
      formatter: (row) =>
        h('div', [
          h('p', { class: 'm-0 font-medium' }, row.displayName),
          h('p', { class: 'm-0 text-xs text-g-600 font-mono' }, row.instanceId)
        ])
    },
    {
      prop: 'botAccountId',
      label: '账号',
      minWidth: 145,
      formatter: (row) => h('span', { class: 'font-mono text-sm' }, row.botAccountId)
    },
    {
      prop: 'connection',
      label: '连接',
      minWidth: 240,
      formatter: (row) => {
        const main = row.platform === 'ONEBOT' ? row.connectionUrl : row.apiBaseUrl
        const secondary =
          row.platform === 'ONEBOT'
            ? `重连 ${row.reconnectIntervalSeconds ?? '-'} 秒`
            : `Gateway: ${row.gatewayUrl || '自动获取'}`
        return h('div', [
          h('p', { class: 'm-0 text-sm truncate' }, main || '-'),
          h('p', { class: 'm-0 text-xs text-g-600 truncate' }, secondary)
        ])
      }
    },
    {
      prop: 'credential',
      label: '凭据',
      width: 115,
      formatter: (row) => {
        const configured =
          row.platform === 'ONEBOT' ? row.accessTokenConfigured : row.clientSecretConfigured
        const label = row.platform === 'ONEBOT' ? 'Token' : 'Secret'
        return h(ElTag, { type: configured ? 'success' : 'info', effect: 'plain' }, () =>
          configured ? `${label} 已配置` : `${label} 未配置`
        )
      }
    },
    {
      prop: 'enabled',
      label: '启用',
      width: 85,
      formatter: (row) =>
        h(ElTag, { type: row.enabled ? 'success' : 'info' }, () =>
          row.enabled ? '已启用' : '已禁用'
        )
    },
    {
      prop: 'runtimeStatus',
      label: '运行状态',
      width: 105,
      formatter: (row) => {
        const meta: { label: string; type: StatusTagType } = statusMeta[row.runtimeStatus] || {
          label: row.runtimeStatus,
          type: 'info'
        }
        const tag = h(ElTag, { type: meta.type }, () => meta.label)
        return row.lastError
          ? h(ElTooltip, { content: row.lastError, placement: 'top' }, () => tag)
          : tag
      }
    },
    {
      prop: 'updatedAt',
      label: '更新时间',
      width: 170,
      formatter: (row) => formatDateTime(row.updatedAt)
    },
    {
      prop: 'operation',
      label: '操作',
      width: 110,
      fixed: 'right',
      formatter: (row) => {
        const actions = []
        if (hasAuth('bot:instance:update')) {
          actions.push(
            h(ArtButtonTable, {
              type: 'edit',
              title: '编辑实例',
              onClick: () => showDialog('edit', row)
            })
          )
        }
        if (hasAuth('bot:instance:delete')) {
          actions.push(
            h(ArtButtonTable, {
              type: 'delete',
              title: '删除实例',
              onClick: () => deleteInstance(row)
            })
          )
        }
        return actions.length ? h('div', { class: 'flex' }, actions) : '-'
      }
    }
  ])

  const formatDateTime = (value?: string) => {
    if (!value) return '-'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false })
  }

  const loadInstances = async () => {
    loading.value = true
    try {
      instances.value = await fetchGetBotInstanceList()
    } finally {
      loading.value = false
    }
  }

  const showDialog = (type: DialogType, row?: BotInstance) => {
    dialogType.value = type
    currentInstance.value = row
    dialogVisible.value = true
  }

  const deleteInstance = async (row: BotInstance) => {
    await ElMessageBox.confirm(`确定删除机器人实例“${row.displayName}”吗？`, '删除实例', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await fetchDeleteBotInstance(row.id)
    ElMessage.success('删除成功')
    loadInstances()
  }

  onMounted(loadInstances)
</script>
