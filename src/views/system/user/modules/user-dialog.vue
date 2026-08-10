<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
    width="560px"
    align-center
    @closed="resetForm"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="88px">
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="用户名" prop="userName">
            <ElInput v-model="formData.userName" placeholder="请输入用户名" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="昵称" prop="nickName">
            <ElInput v-model="formData.nickName" placeholder="请输入昵称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="密码" prop="password">
            <ElInput
              v-model="formData.password"
              type="password"
              show-password
              :placeholder="dialogType === 'add' ? '至少 6 位' : '留空则不修改'"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="性别" prop="userGender">
            <ElSelect v-model="formData.userGender" placeholder="请选择">
              <ElOption label="男" value="男" />
              <ElOption label="女" value="女" />
              <ElOption label="未知" value="未知" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="手机号" prop="userPhone">
            <ElInput v-model="formData.userPhone" placeholder="请输入手机号" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="邮箱" prop="userEmail">
            <ElInput v-model="formData.userEmail" placeholder="请输入邮箱" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="角色" prop="roleCodes">
            <ElSelect
              v-model="formData.roleCodes"
              multiple
              filterable
              :loading="roleLoading"
              placeholder="请选择角色"
              class="w-full"
            >
              <ElOption
                v-for="role in roleList"
                :key="role.roleCode"
                :value="role.roleCode"
                :label="`${role.roleName}（${role.roleCode}）`"
                :disabled="!role.enabled"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="24">
          <ElFormItem label="启用状态">
            <ElSwitch v-model="formData.enabled" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { fetchCreateUser, fetchGetRoleList, fetchUpdateUser } from '@/api/system-manage'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { computed, nextTick, reactive, ref, watch } from 'vue'

  interface Props {
    visible: boolean
    type: string
    userData?: Partial<Api.SystemManage.UserListItem>
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })
  const dialogType = computed(() => props.type)
  const formRef = ref<FormInstance>()
  const roleList = ref<Api.SystemManage.RoleListItem[]>([])
  const roleLoading = ref(false)
  const submitting = ref(false)

  const defaultForm = (): Api.SystemManage.UserSaveRequest => ({
    userName: '',
    password: '',
    nickName: '',
    userPhone: '',
    userEmail: '',
    userGender: '未知',
    avatar: '',
    enabled: true,
    roleCodes: []
  })
  const formData = reactive<Api.SystemManage.UserSaveRequest>(defaultForm())

  const validatePassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (dialogType.value === 'add' && !value) {
      callback(new Error('请输入密码'))
      return
    }
    if (value && value.length < 6) {
      callback(new Error('密码至少 6 位'))
      return
    }
    callback()
  }

  const rules: FormRules = {
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 50, message: '长度为 2 到 50 个字符', trigger: 'blur' }
    ],
    password: [{ validator: validatePassword, trigger: 'blur' }],
    userEmail: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }],
    roleCodes: [{ required: true, message: '请选择角色', trigger: 'change' }]
  }

  const loadRoles = async () => {
    roleLoading.value = true
    try {
      const response = await fetchGetRoleList({ current: 1, size: 100 })
      roleList.value = response.records
    } finally {
      roleLoading.value = false
    }
  }

  const initForm = () => {
    const row = props.userData
    Object.assign(
      formData,
      defaultForm(),
      props.type === 'edit' && row
        ? {
            userName: row.userName || '',
            nickName: row.nickName || '',
            userPhone: row.userPhone || '',
            userEmail: row.userEmail || '',
            userGender: row.userGender || '未知',
            avatar: row.avatar || '',
            enabled: row.status === '1',
            roleCodes: row.userRoles || []
          }
        : {}
    )
  }

  watch(
    () => props.visible,
    async (visible) => {
      if (!visible) return
      initForm()
      await loadRoles()
      nextTick(() => formRef.value?.clearValidate())
    }
  )

  const resetForm = () => {
    Object.assign(formData, defaultForm())
    formRef.value?.clearValidate()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate()

    const payload: Api.SystemManage.UserSaveRequest = {
      ...formData,
      password: formData.password || undefined
    }
    submitting.value = true
    try {
      if (dialogType.value === 'add') {
        await fetchCreateUser(payload)
      } else if (props.userData?.id) {
        await fetchUpdateUser(props.userData.id, payload)
      }
      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '修改成功')
      emit('success')
      dialogVisible.value = false
    } finally {
      submitting.value = false
    }
  }
</script>
