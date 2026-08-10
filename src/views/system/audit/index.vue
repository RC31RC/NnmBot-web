<template>
  <div class="art-full-height">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :show-expand="false"
      @reset="resetSearchParams"
      @search="handleSearch"
    />

    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData" />
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetOperationLogList } from '@/api/system-manage'
  import { useTable } from '@/hooks/core/useTable'
  import { ElTag } from 'element-plus'
  import { h, ref } from 'vue'

  defineOptions({ name: 'OperationLog' })

  const searchForm = ref<Api.SystemManage.OperationLogSearchParams>({
    operatorName: undefined
  })
  const searchItems = [
    {
      label: '操作人',
      key: 'operatorName',
      type: 'input',
      props: {
        placeholder: '请输入操作人',
        clearable: true
      }
    }
  ]

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
      apiFn: fetchGetOperationLogList,
      apiParams: {
        current: 1,
        size: 20
      },
      columnsFactory: () => [
        { prop: 'operatorName', label: '操作人', width: 130 },
        {
          prop: 'action',
          label: '动作',
          width: 170,
          formatter: (row) => h(ElTag, { type: 'info' }, () => row.action)
        },
        { prop: 'targetType', label: '对象类型', width: 120 },
        { prop: 'targetId', label: '对象 ID', width: 120 },
        {
          prop: 'detail',
          label: '详情',
          minWidth: 260,
          showOverflowTooltip: true
        },
        { prop: 'ipAddress', label: 'IP 地址', width: 150 },
        { prop: 'createdAt', label: '操作时间', width: 180 }
      ]
    }
  })

  const handleSearch = (params: Api.SystemManage.OperationLogSearchParams) => {
    replaceSearchParams(params)
    getData()
  }
</script>
