import { AppRouteRecord } from '@/types/router'

export const systemRoutes: AppRouteRecord = {
  path: '/system',
  name: 'System',
  component: '/index/index',
  meta: {
    title: 'menus.system.title',
    icon: 'ri:user-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'user',
      name: 'User',
      component: '/system/user',
      meta: {
        title: 'menus.system.user',
        icon: 'ri:user-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN'],
        authList: [
          { title: '查看用户', authMark: 'system:user:view' },
          { title: '创建用户', authMark: 'system:user:create' },
          { title: '修改用户', authMark: 'system:user:update' },
          { title: '禁用用户', authMark: 'system:user:disable' }
        ]
      }
    },
    {
      path: 'role',
      name: 'Role',
      component: '/system/role',
      meta: {
        title: 'menus.system.role',
        icon: 'ri:user-settings-line',
        keepAlive: true,
        roles: ['R_SUPER'],
        authList: [
          { title: '查看角色', authMark: 'system:role:view' },
          { title: '创建角色', authMark: 'system:role:create' },
          { title: '修改角色', authMark: 'system:role:update' },
          { title: '删除角色', authMark: 'system:role:delete' },
          { title: '分配权限', authMark: 'system:role:assign' }
        ]
      }
    },
    {
      path: 'user-center',
      name: 'UserCenter',
      component: '/system/user-center',
      meta: {
        title: 'menus.system.userCenter',
        icon: 'ri:user-line',
        isHide: true,
        keepAlive: true,
        isHideTab: true
      }
    },
    {
      path: 'menu',
      name: 'Menus',
      component: '/system/menu',
      meta: {
        title: 'menus.system.menu',
        icon: 'ri:menu-line',
        keepAlive: true,
        roles: ['R_SUPER'],
        authList: [
          { title: '查看菜单', authMark: 'system:menu:view' },
          { title: '创建菜单', authMark: 'system:menu:create' },
          { title: '修改菜单', authMark: 'system:menu:update' },
          { title: '删除菜单', authMark: 'system:menu:delete' }
        ]
      }
    },
    {
      path: 'audit',
      name: 'OperationLog',
      component: '/system/audit',
      meta: {
        title: 'menus.system.audit',
        icon: 'ri:file-list-3-line',
        keepAlive: true,
        roles: ['R_SUPER'],
        authList: [{ title: '查看操作审计', authMark: 'system:audit:view' }]
      }
    },
    {
      path: 'session',
      name: 'OnlineSession',
      component: '/system/session',
      meta: {
        title: 'menus.system.session',
        icon: 'ri:computer-line',
        keepAlive: true,
        roles: ['R_SUPER'],
        authList: [
          { title: '查看在线会话', authMark: 'system:session:view' },
          { title: '强制会话下线', authMark: 'system:session:kickout' }
        ]
      }
    },
    {
      path: 'nested',
      name: 'Nested',
      component: '',
      meta: {
        title: 'menus.system.nested',
        icon: 'ri:menu-unfold-3-line',
        keepAlive: true
      },
      children: [
        {
          path: 'menu1',
          name: 'NestedMenu1',
          component: '/system/nested/menu1',
          meta: {
            title: 'menus.system.menu1',
            icon: 'ri:align-justify',
            keepAlive: true
          }
        },
        {
          path: 'menu2',
          name: 'NestedMenu2',
          component: '',
          meta: {
            title: 'menus.system.menu2',
            icon: 'ri:align-justify',
            keepAlive: true
          },
          children: [
            {
              path: 'menu2-1',
              name: 'NestedMenu2-1',
              component: '/system/nested/menu2',
              meta: {
                title: 'menus.system.menu21',
                icon: 'ri:align-justify',
                keepAlive: true
              }
            }
          ]
        },
        {
          path: 'menu3',
          name: 'NestedMenu3',
          component: '',
          meta: {
            title: 'menus.system.menu3',
            icon: 'ri:align-justify',
            keepAlive: true
          },
          children: [
            {
              path: 'menu3-1',
              name: 'NestedMenu3-1',
              component: '/system/nested/menu3',
              meta: {
                title: 'menus.system.menu31',
                keepAlive: true
              }
            },
            {
              path: 'menu3-2',
              name: 'NestedMenu3-2',
              component: '',
              meta: {
                title: 'menus.system.menu32',
                keepAlive: true
              },
              children: [
                {
                  path: 'menu3-2-1',
                  name: 'NestedMenu3-2-1',
                  component: '/system/nested/menu3/menu3-2',
                  meta: {
                    title: 'menus.system.menu321',
                    keepAlive: true
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
