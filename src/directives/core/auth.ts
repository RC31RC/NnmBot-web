/**
 * v-auth 权限指令
 *
 * 适用于后端权限控制模式，基于权限标识控制 DOM 元素的显示和隐藏。
 * 如果用户没有对应权限，元素将从 DOM 中移除。
 *
 * ## 主要功能
 *
 * - 权限验证 - 根据登录用户的 buttons 权限码验证
 * - DOM 控制 - 无权限时自动移除元素，而非隐藏
 * - 响应式更新 - 权限变化时自动更新元素状态
 *
 * ## 使用示例
 *
 * ```vue
 * <!-- 只有拥有创建用户权限的用户才能看到新增按钮 -->
 * <el-button v-auth="'system:user:create'">新增</el-button>
 *
 * <!-- 只有拥有修改用户权限的用户才能看到编辑按钮 -->
 * <el-button v-auth="'system:user:update'">编辑</el-button>
 *
 * <!-- 只有拥有禁用用户权限的用户才能看到禁用按钮 -->
 * <el-button v-auth="'system:user:disable'">禁用</el-button>
 * ```
 *
 * ## 注意事项
 *
 * - 该指令会直接移除 DOM 元素，而不是使用 v-if 隐藏
 * - meta.authList 只用于描述当前页面可配置的权限点，不作为安全来源
 *
 * @module directives/auth
 * @author Art Design Pro Team
 */

import { useUserStore } from '@/store/modules/user'
import { App, Directive, DirectiveBinding } from 'vue'

export type AuthDirective = Directive<HTMLElement, string>

function checkAuthPermission(el: HTMLElement, binding: DirectiveBinding<string>): void {
  const userStore = useUserStore()
  const hasPermission = userStore.info?.buttons?.includes(binding.value) ?? false

  // 如果没有权限，移除元素
  if (!hasPermission) {
    removeElement(el)
  }
}

function removeElement(el: HTMLElement): void {
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

const authDirective: AuthDirective = {
  mounted: checkAuthPermission,
  updated: checkAuthPermission
}

export function setupAuthDirective(app: App): void {
  app.directive('auth', authDirective)
}
