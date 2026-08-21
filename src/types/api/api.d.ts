/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      userName: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      email: string
      avatar?: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户新增或修改参数 */
    interface UserSaveRequest {
      userName: string
      password?: string
      nickName?: string
      userPhone?: string
      userEmail?: string
      userGender?: string
      avatar?: string
      enabled: boolean
      roleCodes: string[]
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      dataScope: 'ALL' | 'SELF'
      createTime: string
    }

    /** 角色新增或修改参数 */
    interface RoleSaveRequest {
      roleName: string
      roleCode: string
      description?: string
      enabled: boolean
      dataScope: 'ALL' | 'SELF'
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleName' | 'roleCode'> & Api.Common.CommonSearchParams
    >

    interface AuthItem {
      id: number
      title: string
      authMark: string
      enabled: boolean
    }

    interface MenuItem {
      id: number
      parentId?: number
      path: string
      name: string
      component?: string
      meta: {
        title: string
        icon?: string
        keepAlive?: boolean
        sort?: number
        isEnable?: boolean
        isHide?: boolean
        authList?: AuthItem[]
      }
      children?: MenuItem[]
    }

    interface RoleGrantRequest {
      menuIds: number[]
      permissionIds: number[]
    }

    interface RoleGrantResponse extends RoleGrantRequest {
      menuTree: MenuItem[]
    }

    interface MenuSaveRequest {
      parentId?: number
      name: string
      path: string
      component?: string
      title: string
      icon?: string
      sortOrder: number
      keepAlive: boolean
      visible: boolean
      enabled: boolean
    }

    interface PermissionSaveRequest {
      menuId: number
      code: string
      name: string
      type: 'BUTTON'
      enabled: boolean
    }

    type OperationLogList = Api.Common.PaginatedResponse<OperationLogItem>

    interface OperationLogItem {
      id: number
      operatorId?: number
      operatorName: string
      action: string
      targetType: string
      targetId: string
      detail: string
      ipAddress: string
      createdAt: string
    }

    type OperationLogSearchParams = Partial<
      Pick<OperationLogItem, 'operatorName'> & Api.Common.CommonSearchParams
    >

    interface SessionItem {
      token: string
      userId: number
      userName: string
      deviceType: string
      loginTime: string
      timeout: number
    }
  }

  /** 机器人管理类型 */
  namespace BotManage {
    type BotPlatform = 'ONEBOT' | 'QQ_OFFICIAL'

    type RuntimeStatus =
      | 'PENDING_RESTART'
      | 'DISABLED'
      | 'DISCONNECTED'
      | 'CONNECTING'
      | 'CONNECTED'
      | 'ERROR'

    interface BotInstance {
      id: number
      platform: BotPlatform
      instanceId: string
      displayName: string
      botAccountId: string
      enabled: boolean
      connectionUrl?: string
      accessTokenConfigured: boolean
      reconnectIntervalSeconds?: number
      appId?: string
      clientSecretConfigured: boolean
      tokenUrl?: string
      apiBaseUrl?: string
      gatewayUrl?: string
      intents?: number
      gatewayConnectTimeoutSeconds?: number
      reconnectDelaySeconds?: number
      runtimeStatus: RuntimeStatus
      statusChangedAt?: string
      lastError?: string
      createdAt: string
      updatedAt: string
    }

    interface OneBotSaveRequest {
      instanceId: string
      displayName: string
      botAccountId: string
      enabled: boolean
      connectionUrl: string
      accessToken?: string
      reconnectIntervalSeconds: number
    }

    interface QqOfficialSaveRequest {
      instanceId: string
      displayName: string
      enabled: boolean
      appId: string
      clientSecret?: string
      tokenUrl: string
      apiBaseUrl: string
      gatewayUrl?: string
      intents: number
      gatewayConnectTimeoutSeconds: number
      reconnectDelaySeconds: number
    }

    interface OneBotProbeRequest {
      instanceId?: number
      connectionUrl?: string
      accessToken?: string
    }

    interface OneBotProbeResponse {
      botAccountId: string
    }
  }
}
