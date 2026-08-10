# NnmBot 管理端开发约定

## 项目边界

- 本仓库是 NnmBot 的独立 Vue 管理端。
- 后端仓库位于 `/Users/ren/RcGit/NnmBot`。
- 当前为前后端持续开发阶段，前端使用 `3006`，后端使用 `8080`。
- API 地址只使用 `localhost` 或相对路径 `/api`，临近部署时再配置正式地址。
- 未经明确要求，不执行生产打包、不提交 Git、不复制原 Art Design Pro 的部署地址。

## 前端风格

- 沿用当前 Art Design Pro 的 Vue 3、TypeScript、Element Plus 和目录风格。
- Art Design Pro 原有页面、路由、组件和功能板块源码必须完整保留；开发阶段继续展示，项目收尾时再统一评估需要隐藏的入口。
- 业务适配应尽量保留原页面结构和实现风格；不得只保留同名菜单后删除或覆盖原始范例，大幅重写前应先与上游源码核对。
- 页面保持精简、清晰、可操作，避免重复封装和无业务价值的抽象。
- 优先复用现有组件、Hooks、表格和弹窗模式。
- 不为了展示模板能力新增与 NnmBot 无关的页面。
- 新业务按领域组织 API、页面和类型，确认存在真实复用后再抽公共组件。

## 权限约定

- 页面角色继续使用 `meta.roles` 和 `v-roles`。
- 按钮权限使用 `v-auth` 或 `useAuth().hasAuth()`。
- 权限码统一为 `业务域:资源:动作`，例如 `system:user:update`。
- 按钮权限以 `/api/admin/v1/me` 返回的 `buttons` 为准。
- `meta.authList` 用于声明页面权限点，在前端静态模式下仅作为开发期兜底。
- 前端权限只控制界面显示，后端 Sa-Token 权限校验是最终安全边界。

## 开发验证

- 开发启动：`npm run dev -- --host 127.0.0.1`
- 类型检查：`npm exec vue-tsc -- --noEmit`
- 定向检查：`npm run lint -- <changed-files>`
- 当前阶段不执行 `npm run build`。
