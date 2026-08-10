import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/admin/v1/users',
    params
  })
}

export function fetchCreateUser(data: Api.SystemManage.UserSaveRequest) {
  return request.post<number>({
    url: '/api/admin/v1/users',
    data
  })
}

export function fetchUpdateUser(userId: number, data: Api.SystemManage.UserSaveRequest) {
  return request.put<void>({
    url: `/api/admin/v1/users/${userId}`,
    data
  })
}

export function fetchUpdateUserStatus(userId: number, enabled: boolean) {
  return request.put<void>({
    url: `/api/admin/v1/users/${userId}/status`,
    data: { enabled }
  })
}

export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/admin/v1/roles',
    params
  })
}

export function fetchCreateRole(data: Api.SystemManage.RoleSaveRequest) {
  return request.post<number>({
    url: '/api/admin/v1/roles',
    data
  })
}

export function fetchUpdateRole(roleId: number, data: Api.SystemManage.RoleSaveRequest) {
  return request.put<void>({
    url: `/api/admin/v1/roles/${roleId}`,
    data
  })
}

export function fetchDeleteRole(roleId: number) {
  return request.del<void>({
    url: `/api/admin/v1/roles/${roleId}`
  })
}

export function fetchGetRoleGrants(roleId: number) {
  return request.get<Api.SystemManage.RoleGrantResponse>({
    url: `/api/admin/v1/roles/${roleId}/grants`
  })
}

export function fetchUpdateRoleGrants(roleId: number, data: Api.SystemManage.RoleGrantRequest) {
  return request.put<void>({
    url: `/api/admin/v1/roles/${roleId}/grants`,
    data
  })
}

export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/admin/v1/menus'
  })
}

export function fetchGetAllMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/admin/v1/menus/all'
  })
}

export function fetchCreateMenu(data: Api.SystemManage.MenuSaveRequest) {
  return request.post<number>({
    url: '/api/admin/v1/menus',
    data
  })
}

export function fetchUpdateMenu(menuId: number, data: Api.SystemManage.MenuSaveRequest) {
  return request.put<void>({
    url: `/api/admin/v1/menus/${menuId}`,
    data
  })
}

export function fetchDeleteMenu(menuId: number) {
  return request.del<void>({
    url: `/api/admin/v1/menus/${menuId}`
  })
}

export function fetchCreatePermission(data: Api.SystemManage.PermissionSaveRequest) {
  return request.post<number>({
    url: '/api/admin/v1/permissions',
    data
  })
}

export function fetchUpdatePermission(
  permissionId: number,
  data: Api.SystemManage.PermissionSaveRequest
) {
  return request.put<void>({
    url: `/api/admin/v1/permissions/${permissionId}`,
    data
  })
}

export function fetchDeletePermission(permissionId: number) {
  return request.del<void>({
    url: `/api/admin/v1/permissions/${permissionId}`
  })
}

export function fetchGetOperationLogList(params: Api.SystemManage.OperationLogSearchParams) {
  return request.get<Api.SystemManage.OperationLogList>({
    url: '/api/admin/v1/operation-logs',
    params
  })
}

export function fetchGetSessionList() {
  return request.get<Api.SystemManage.SessionItem[]>({
    url: '/api/admin/v1/sessions'
  })
}

export function fetchKickoutSession(token: string) {
  return request.del<void>({
    url: `/api/admin/v1/sessions/${encodeURIComponent(token)}`
  })
}
