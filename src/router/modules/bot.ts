import { AppRouteRecord } from '@/types/router'

export const botRoutes: AppRouteRecord = {
  path: '/bot-management',
  name: 'BotManagement',
  component: '/bot/instance',
  meta: {
    title: 'menus.bot.title',
    icon: 'ri:robot-2-line',
    keepAlive: true,
    roles: ['R_SUPER', 'R_ADMIN'],
    authList: [
      { title: '查看机器人实例', authMark: 'bot:instance:view' },
      { title: '创建机器人实例', authMark: 'bot:instance:create' },
      { title: '修改机器人实例', authMark: 'bot:instance:update' },
      { title: '删除机器人实例', authMark: 'bot:instance:delete' },
      { title: '获取 OneBot 登录账号', authMark: 'bot:instance:probe' }
    ]
  }
}
