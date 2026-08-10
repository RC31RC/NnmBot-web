<template>
  <ElDialog
    :title="dialogTitle"
    :model-value="visible"
    width="640px"
    align-center
    @update:model-value="handleCancel"
    @closed="resetForm"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="92px">
      <ElFormItem label="类型">
        <ElRadioGroup v-model="form.menuType" disabled>
          <ElRadioButton value="menu">菜单</ElRadioButton>
          <ElRadioButton value="button">按钮</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>

      <template v-if="form.menuType === 'menu'">
        <ElFormItem label="父菜单" prop="parentId">
          <ElSelect v-model="form.parentId" clearable filterable placeholder="不选择则为一级菜单">
            <ElOption
              v-for="option in menuOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="菜单名称" prop="name">
              <ElInput v-model="form.name" placeholder="页面显示名称" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="菜单标识" prop="label">
              <ElInput v-model="form.label" placeholder="如：User" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="路由地址" prop="path">
              <ElInput v-model="form.path" placeholder="一级 /system，子级 user" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="组件路径" prop="component">
              <ElInput v-model="form.component" placeholder="如：/system/user" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="菜单图标" prop="icon">
              <ElInput v-model="form.icon" placeholder="如：ri:user-line" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="菜单排序" prop="sort">
              <ElInputNumber
                v-model="form.sort"
                :min="0"
                controls-position="right"
                class="w-full"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="页面选项">
          <ElSpace :size="24" wrap>
            <ElCheckbox v-model="form.isEnable">启用</ElCheckbox>
            <ElCheckbox v-model="form.keepAlive">缓存页面</ElCheckbox>
            <ElCheckbox v-model="form.isHide">隐藏菜单</ElCheckbox>
          </ElSpace>
        </ElFormItem>
      </template>

      <template v-else>
        <ElFormItem label="所属菜单">
          <ElInput :model-value="parentMenuTitle" disabled />
        </ElFormItem>
        <ElFormItem label="权限名称" prop="authName">
          <ElInput v-model="form.authName" placeholder="如：新增用户" />
        </ElFormItem>
        <ElFormItem label="权限标识" prop="authLabel">
          <ElInput v-model="form.authLabel" placeholder="如：system:user:create" />
        </ElFormItem>
        <ElFormItem label="启用状态">
          <ElSwitch v-model="form.isEnable" />
        </ElFormItem>
      </template>
    </ElForm>

    <template #footer>
      <ElButton @click="handleCancel">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { formatMenuTitle } from '@/utils/router'
  import type { AppRouteRecord } from '@/types/router'
  import type { FormInstance, FormRules } from 'element-plus'
  import { computed, nextTick, reactive, ref, watch } from 'vue'

  interface MenuOption {
    value: number
    label: string
  }

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

  const props = withDefaults(
    defineProps<{
      visible: boolean
      editData?: AppRouteRecord | Record<string, unknown>
      type?: 'menu' | 'button'
      menuOptions?: MenuOption[]
      submitting?: boolean
    }>(),
    {
      visible: false,
      editData: undefined,
      type: 'menu',
      menuOptions: () => [],
      submitting: false
    }
  )
  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: MenuFormData): void
  }>()

  const formRef = ref<FormInstance>()
  const visible = computed(() => props.visible)
  const defaultForm = (): MenuFormData => ({
    menuType: props.type,
    id: 0,
    parentId: undefined,
    parentMenuId: undefined,
    name: '',
    path: '',
    label: '',
    component: '',
    icon: '',
    isEnable: true,
    sort: 0,
    keepAlive: false,
    isHide: false,
    authName: '',
    authLabel: ''
  })
  const form = reactive<MenuFormData>(defaultForm())
  const rules: FormRules = {
    name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
    label: [{ required: true, message: '请输入菜单标识', trigger: 'blur' }],
    path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    authName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    authLabel: [
      { required: true, message: '请输入权限标识', trigger: 'blur' },
      {
        pattern: /^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/,
        message: '权限标识格式应为 domain:resource:action',
        trigger: 'blur'
      }
    ]
  }
  const isEdit = computed(() => Boolean(form.id))
  const dialogTitle = computed(
    () => `${isEdit.value ? '编辑' : '新增'}${form.menuType === 'menu' ? '菜单' : '按钮权限'}`
  )
  const parentMenuTitle = computed(() =>
    String((props.editData as Record<string, unknown> | undefined)?.parentMenuTitle || '')
  )

  const initForm = () => {
    Object.assign(form, defaultForm())
    const row = props.editData
    if (!row) return

    if (props.type === 'menu' && 'meta' in row) {
      const menu = row as AppRouteRecord
      Object.assign(form, {
        id: menu.id || 0,
        parentId: menu.parentId,
        name: formatMenuTitle(menu.meta.title),
        path: menu.path,
        label: String(menu.name || ''),
        component: typeof menu.component === 'string' ? menu.component : '',
        icon: menu.meta.icon || '',
        isEnable: menu.meta.isEnable !== false,
        sort: menu.meta.sort || 0,
        keepAlive: menu.meta.keepAlive || false,
        isHide: menu.meta.isHide || false
      })
    } else {
      const permission = row as Record<string, unknown>
      Object.assign(form, {
        id: Number(permission.id || 0),
        parentMenuId: Number(permission.parentMenuId || 0),
        authName: String(permission.title || ''),
        authLabel: String(permission.authMark || ''),
        isEnable: permission.isEnable !== false
      })
    }
    nextTick(() => formRef.value?.clearValidate())
  }

  watch(
    () => props.visible,
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
    emit('submit', { ...form })
  }

  const handleCancel = () => {
    emit('update:visible', false)
  }
</script>
