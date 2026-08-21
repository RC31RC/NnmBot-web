<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增机器人实例' : '编辑机器人实例'"
    width="min(760px, 94vw)"
    align-center
    destroy-on-close
    @closed="resetForm"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="118px">
      <ElFormItem label="接入协议" prop="platform">
        <ElRadioGroup v-model="form.platform" :disabled="dialogType === 'edit'">
          <ElRadioButton value="ONEBOT">OneBot</ElRadioButton>
          <ElRadioButton value="QQ_OFFICIAL">QQ 官方机器人</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>

      <ElRow :gutter="16">
        <ElCol :xs="24" :sm="12">
          <ElFormItem label="实例标识" prop="instanceId">
            <ElInput v-model="form.instanceId" placeholder="如：personal-qq" maxlength="100" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12">
          <ElFormItem label="显示名称" prop="displayName">
            <ElInput v-model="form.displayName" placeholder="如：主机器人" maxlength="100" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <template v-if="form.platform === 'ONEBOT'">
        <ElFormItem label="WebSocket 地址" prop="connectionUrl">
          <ElInput v-model="form.connectionUrl" placeholder="ws://127.0.0.1:3001" maxlength="500" />
        </ElFormItem>
        <ElFormItem label="Access Token" prop="accessToken">
          <ElInput
            v-model="form.accessToken"
            type="password"
            show-password
            maxlength="1000"
            :placeholder="secretPlaceholder('Token')"
          />
        </ElFormItem>
        <ElFormItem label="机器人 QQ 号" prop="botAccountId">
          <ElInput v-model="form.botAccountId" placeholder="连接后自动获取" maxlength="100">
            <template #append>
              <ElButton v-auth="'bot:instance:probe'" :loading="probing" @click="probeAccount">
                <ArtSvgIcon icon="ri:radar-line" class="mr-1" />
                获取账号
              </ElButton>
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="重连间隔" prop="reconnectIntervalSeconds">
          <ElInputNumber
            v-model="form.reconnectIntervalSeconds"
            :min="1"
            :max="3600"
            :step="1"
            controls-position="right"
          />
          <span class="ml-2 text-sm text-g-600">秒</span>
        </ElFormItem>
      </template>

      <template v-else>
        <ElRow :gutter="16">
          <ElCol :xs="24" :sm="12">
            <ElFormItem label="AppID" prop="appId">
              <ElInput v-model="form.appId" maxlength="200" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12">
            <ElFormItem label="Client Secret" prop="clientSecret">
              <ElInput
                v-model="form.clientSecret"
                type="password"
                show-password
                maxlength="1000"
                :placeholder="secretPlaceholder('Secret')"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="Token API" prop="tokenUrl">
          <ElInput v-model="form.tokenUrl" maxlength="500" />
        </ElFormItem>
        <ElFormItem label="API 地址" prop="apiBaseUrl">
          <ElInput v-model="form.apiBaseUrl" maxlength="500" />
        </ElFormItem>
        <ElFormItem label="Gateway 地址" prop="gatewayUrl">
          <ElInput
            v-model="form.gatewayUrl"
            placeholder="留空则通过 QQ 官方 API 自动获取"
            maxlength="500"
          />
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :xs="24" :sm="8">
            <ElFormItem label="Intents" prop="intents">
              <ElInputNumber
                v-model="form.intents"
                :min="0"
                :max="Number.MAX_SAFE_INTEGER"
                :step="1"
                controls-position="right"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="8">
            <ElFormItem label="连接超时" prop="gatewayConnectTimeoutSeconds">
              <ElInputNumber
                v-model="form.gatewayConnectTimeoutSeconds"
                :min="1"
                :max="120"
                :step="1"
                controls-position="right"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="8">
            <ElFormItem label="重连延迟" prop="reconnectDelaySeconds">
              <ElInputNumber
                v-model="form.reconnectDelaySeconds"
                :min="0"
                :max="3600"
                :step="1"
                controls-position="right"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </template>

      <ElFormItem label="启用状态">
        <ElSwitch v-model="form.enabled" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import {
    fetchCreateOneBot,
    fetchCreateQqOfficial,
    fetchProbeOneBot,
    fetchUpdateOneBot,
    fetchUpdateQqOfficial
  } from '@/api/bot-management'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { computed, nextTick, reactive, ref, watch } from 'vue'

  type BotInstance = Api.BotManage.BotInstance
  type BotPlatform = Api.BotManage.BotPlatform
  type DialogType = 'add' | 'edit'

  interface BotInstanceForm {
    platform: BotPlatform
    instanceId: string
    displayName: string
    enabled: boolean
    botAccountId: string
    connectionUrl: string
    accessToken: string
    reconnectIntervalSeconds: number
    appId: string
    clientSecret: string
    tokenUrl: string
    apiBaseUrl: string
    gatewayUrl: string
    intents: number
    gatewayConnectTimeoutSeconds: number
    reconnectDelaySeconds: number
  }

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      dialogType: DialogType
      instance?: BotInstance
    }>(),
    {
      modelValue: false,
      dialogType: 'add',
      instance: undefined
    }
  )
  const emit = defineEmits<{
    (event: 'update:modelValue', value: boolean): void
    (event: 'success'): void
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const probing = ref(false)

  const defaultForm = (): BotInstanceForm => ({
    platform: 'ONEBOT',
    instanceId: '',
    displayName: '',
    enabled: true,
    botAccountId: '',
    connectionUrl: 'ws://127.0.0.1:3001',
    accessToken: '',
    reconnectIntervalSeconds: 5,
    appId: '',
    clientSecret: '',
    tokenUrl: 'https://bots.qq.com/app/getAppAccessToken',
    apiBaseUrl: 'https://api.sgroup.qq.com',
    gatewayUrl: '',
    intents: 100663296,
    gatewayConnectTimeoutSeconds: 10,
    reconnectDelaySeconds: 5
  })
  const form = reactive<BotInstanceForm>(defaultForm())

  const validateClientSecret = (
    _rule: unknown,
    value: string,
    callback: (error?: Error) => void
  ) => {
    if (form.platform === 'QQ_OFFICIAL' && props.dialogType === 'add' && !value.trim()) {
      callback(new Error('请输入 Client Secret'))
      return
    }
    callback()
  }

  const rules: FormRules<BotInstanceForm> = {
    platform: [{ required: true, message: '请选择接入协议', trigger: 'change' }],
    instanceId: [{ required: true, message: '请输入实例标识', trigger: 'blur' }],
    displayName: [{ required: true, message: '请输入显示名称', trigger: 'blur' }],
    botAccountId: [
      { required: true, message: '请获取或输入机器人 QQ 号', trigger: 'blur' },
      { pattern: /^[1-9]\d*$/, message: '机器人 QQ 号必须是正整数', trigger: 'blur' }
    ],
    connectionUrl: [
      { required: true, message: '请输入 WebSocket 地址', trigger: 'blur' },
      { pattern: /^wss?:\/\/.+/i, message: '必须使用 ws 或 wss 协议', trigger: 'blur' }
    ],
    clientSecret: [{ validator: validateClientSecret, trigger: 'blur' }],
    appId: [{ required: true, message: '请输入 AppID', trigger: 'blur' }],
    tokenUrl: [
      { required: true, message: '请输入 Token API', trigger: 'blur' },
      { pattern: /^https?:\/\/.+/i, message: '必须使用 http 或 https 协议', trigger: 'blur' }
    ],
    apiBaseUrl: [
      { required: true, message: '请输入 API 地址', trigger: 'blur' },
      { pattern: /^https?:\/\/.+/i, message: '必须使用 http 或 https 协议', trigger: 'blur' }
    ]
  }

  const secretPlaceholder = (name: string) =>
    props.dialogType === 'edit' ? `留空则保留已保存 ${name}` : `请输入 ${name}`

  const initForm = () => {
    const row = props.instance
    Object.assign(
      form,
      defaultForm(),
      props.dialogType === 'edit' && row
        ? {
            platform: row.platform,
            instanceId: row.instanceId,
            displayName: row.displayName,
            enabled: row.enabled,
            botAccountId: row.platform === 'ONEBOT' ? row.botAccountId : '',
            connectionUrl: row.connectionUrl || '',
            accessToken: '',
            reconnectIntervalSeconds: row.reconnectIntervalSeconds ?? 5,
            appId: row.appId || row.botAccountId,
            clientSecret: '',
            tokenUrl: row.tokenUrl || 'https://bots.qq.com/app/getAppAccessToken',
            apiBaseUrl: row.apiBaseUrl || 'https://api.sgroup.qq.com',
            gatewayUrl: row.gatewayUrl || '',
            intents: row.intents ?? 100663296,
            gatewayConnectTimeoutSeconds: row.gatewayConnectTimeoutSeconds ?? 10,
            reconnectDelaySeconds: row.reconnectDelaySeconds ?? 5
          }
        : {}
    )
    nextTick(() => formRef.value?.clearValidate())
  }

  watch(
    () => props.modelValue,
    (value) => {
      if (value) initForm()
    }
  )

  watch(
    () => form.platform,
    () => nextTick(() => formRef.value?.clearValidate())
  )

  const resetForm = () => {
    Object.assign(form, defaultForm())
    formRef.value?.clearValidate()
  }

  const probeAccount = async () => {
    if (!formRef.value) return
    await formRef.value.validateField('connectionUrl')
    probing.value = true
    try {
      const result = await fetchProbeOneBot({
        instanceId: props.dialogType === 'edit' ? props.instance?.id : undefined,
        connectionUrl: form.connectionUrl.trim(),
        accessToken: form.accessToken.trim() || undefined
      })
      form.botAccountId = result.botAccountId
      formRef.value.clearValidate('botAccountId')
      ElMessage.success(`已获取机器人 QQ 号：${result.botAccountId}`)
    } finally {
      probing.value = false
    }
  }

  const oneBotPayload = (): Api.BotManage.OneBotSaveRequest => ({
    instanceId: form.instanceId.trim(),
    displayName: form.displayName.trim(),
    botAccountId: form.botAccountId.trim(),
    enabled: form.enabled,
    connectionUrl: form.connectionUrl.trim(),
    accessToken: form.accessToken.trim() || undefined,
    reconnectIntervalSeconds: form.reconnectIntervalSeconds
  })

  const qqOfficialPayload = (): Api.BotManage.QqOfficialSaveRequest => ({
    instanceId: form.instanceId.trim(),
    displayName: form.displayName.trim(),
    enabled: form.enabled,
    appId: form.appId.trim(),
    clientSecret: form.clientSecret.trim() || undefined,
    tokenUrl: form.tokenUrl.trim(),
    apiBaseUrl: form.apiBaseUrl.trim(),
    gatewayUrl: form.gatewayUrl.trim() || undefined,
    intents: form.intents,
    gatewayConnectTimeoutSeconds: form.gatewayConnectTimeoutSeconds,
    reconnectDelaySeconds: form.reconnectDelaySeconds
  })

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate()
    submitting.value = true
    try {
      if (form.platform === 'ONEBOT') {
        const payload = oneBotPayload()
        if (props.dialogType === 'add') {
          await fetchCreateOneBot(payload)
        } else if (props.instance) {
          await fetchUpdateOneBot(props.instance.id, payload)
        }
      } else {
        const payload = qqOfficialPayload()
        if (props.dialogType === 'add') {
          await fetchCreateQqOfficial(payload)
        } else if (props.instance) {
          await fetchUpdateQqOfficial(props.instance.id, payload)
        }
      }
      ElMessage.success(
        props.dialogType === 'add' ? '新增成功，重启后生效' : '修改成功，重启后生效'
      )
      emit('success')
      visible.value = false
    } finally {
      submitting.value = false
    }
  }
</script>
