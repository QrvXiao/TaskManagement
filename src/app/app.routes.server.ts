import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // 静态路由使用预渲染
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'new', renderMode: RenderMode.Prerender },
  
  // 动态路由使用服务器端渲染
  { path: 'task/:id', renderMode: RenderMode.Server },
  { path: 'edit/:id', renderMode: RenderMode.Server },
  
  // 其他路由默认使用服务器端渲染
  { path: '**', renderMode: RenderMode.Server }
];