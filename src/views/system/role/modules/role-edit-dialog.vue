<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
    width="520px"
    align-center
    @closed="resetForm"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="90px">
      <ElFormItem label="角色名称" prop="roleName">
        <ElInput v-model="form.roleName" placeholder="请输入角色名称" />
      </ElFormItem>
      <ElFormItem label="角色编码" prop="roleCode">
        <ElInput v-model="form.roleCode" placeholder="如：R_OPERATOR" />
      </ElFormItem>
      <ElFormItem label="数据范围" prop="dataScope">
        <ElRadioGroup v-model="form.dataScope">
          <ElRadioButton value="ALL">全部数据</ElRadioButton>
          <ElRadioButton value="SELF">仅本人</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="角色描述" prop="description">
        <ElInput
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入角色描述"
        />
      </ElFormItem>
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
  import { fetchCreateRole, fetchUpdateRole } from '@/api/system-manage'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { computed, nextTick, reactive, ref, watch } from 'vue'

  type RoleListItem = Api.SystemManage.RoleListItem

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      dialogType: 'add' | 'edit'
      roleData?: RoleListItem
    }>(),
    {
      modelValue: false,
      dialogType: 'add',
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
  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const defaultForm = (): Api.SystemManage.RoleSaveRequest => ({
    roleName: '',
    roleCode: '',
    description: '',
    enabled: true,
    dataScope: 'SELF'
  })
  const form = reactive<Api.SystemManage.RoleSaveRequest>(defaultForm())
  const rules: FormRules = {
    roleName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { max: 100, message: '角色名称不能超过 100 个字符', trigger: 'blur' }
    ],
    roleCode: [
      { required: true, message: '请输入角色编码', trigger: 'blur' },
      {
        pattern: /^R_[A-Z0-9_]+$/,
        message: '角色编码需使用 R_ 开头的大写字母、数字或下划线',
        trigger: 'blur'
      }
    ],
    dataScope: [{ required: true, message: '请选择数据范围', trigger: 'change' }]
  }

  const initForm = () => {
    Object.assign(
      form,
      defaultForm(),
      props.dialogType === 'edit' && props.roleData
        ? {
            roleName: props.roleData.roleName,
            roleCode: props.roleData.roleCode,
            description: props.roleData.description,
            enabled: props.roleData.enabled,
            dataScope: props.roleData.dataScope
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

  const resetForm = () => {
    Object.assign(form, defaultForm())
    formRef.value?.clearValidate()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate()
    submitting.value = true
    try {
      if (props.dialogType === 'add') {
        await fetchCreateRole({ ...form })
      } else if (props.roleData) {
        await fetchUpdateRole(props.roleData.roleId, { ...form })
      }
      ElMessage.success(props.dialogType === 'add' ? '新增成功' : '修改成功')
      emit('success')
      visible.value = false
    } finally {
      submitting.value = false
    }
  }
</script>
