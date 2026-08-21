import request from '@/utils/http'

export function fetchGetBotInstanceList() {
  return request.get<Api.BotManage.BotInstance[]>({ url: '/api/admin/v1/bot-instances' })
}

export function fetchCreateOneBot(data: Api.BotManage.OneBotSaveRequest) {
  return request.post<number>({ url: '/api/admin/v1/bot-instances/onebot', data })
}

export function fetchUpdateOneBot(id: number, data: Api.BotManage.OneBotSaveRequest) {
  return request.put<void>({ url: `/api/admin/v1/bot-instances/onebot/${id}`, data })
}

export function fetchCreateQqOfficial(data: Api.BotManage.QqOfficialSaveRequest) {
  return request.post<number>({ url: '/api/admin/v1/bot-instances/qq-official', data })
}

export function fetchUpdateQqOfficial(id: number, data: Api.BotManage.QqOfficialSaveRequest) {
  return request.put<void>({ url: `/api/admin/v1/bot-instances/qq-official/${id}`, data })
}

export function fetchDeleteBotInstance(id: number) {
  return request.del<void>({ url: `/api/admin/v1/bot-instances/${id}` })
}

export function fetchProbeOneBot(data: Api.BotManage.OneBotProbeRequest) {
  return request.post<Api.BotManage.OneBotProbeResponse>({
    url: '/api/admin/v1/bot-instances/onebot/probe',
    data
  })
}
