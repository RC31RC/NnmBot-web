/**
 * useAuth - 权限验证管理
 *
 * 提供统一的权限验证功能，支持前端和后端两种权限模式。
 * 用于控制页面按钮、操作等功能的显示和访问权限。
 *
 * ## 主要功能
 *
 * 1. 权限检查 - 检查用户是否拥有指定的权限标识
 * 2. 双模式支持 - 自动适配前端模式和后端模式的权限验证
 * 3. 从用户信息中获取后端返回的稳定权限码
 * 4. 路由 meta.authList 仅作为前端模式下的开发期兜底
 *
 * ## 使用示例
 *
 * ```typescript
 * const { hasAuth } = useAuth()
 *
 * // 检查是否有创建用户权限
 * if (hasAuth('system:user:create')) {
 *   // 显示新增按钮
 * }
 *
 * // 在模板中使用
 * <el-button v-if="hasAuth('system:user:update')">编辑</el-button>
 * <el-button v-if="hasAuth('system:user:disable')">禁用</el-button>
 * ```
 *
 * @module useAuth
 * @author Art Design Pro Team
 */

import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useAppMode } from '@/hooks/core/useAppMode'
import type { AppRouteRecord } from '@/types/router'

type AuthItem = NonNullable<AppRouteRecord['meta']['authList']>[number]

const userStore = useUserStore()

export const useAuth = () => {
  const route = useRoute()
  const { isFrontendMode } = useAppMode()
  const { info } = storeToRefs(userStore)

  // 后端返回的按钮权限码，例如：['system:user:create']
  const frontendAuthList = computed(() => info.value?.buttons ?? [])

  // 路由元数据仅用于菜单管理和开发期预览
  const backendAuthList = computed<AuthItem[]>(() =>
    Array.isArray(route.meta.authList) ? (route.meta.authList as AuthItem[]) : []
  )

  /**
   * 检查是否拥有某权限标识（前后端模式通用）
   * @param auth 权限标识
   * @returns 是否有权限
   */
  const hasAuth = (auth: string): boolean => {
    if (frontendAuthList.value.length > 0) return frontendAuthList.value.includes(auth)
    if (isFrontendMode.value) return backendAuthList.value.some((item) => item?.authMark === auth)
    return false
  }

  return {
    hasAuth
  }
}
