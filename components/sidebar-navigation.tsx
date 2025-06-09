"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Users,
  Package,
  Activity,
  BarChart3,
  Monitor,
  Settings,
  Wrench,
  Database,
  Shield,
  LogOut,
  Menu,
} from "lucide-react"

interface SidebarNavigationProps {
  activeView: string
  onViewChange: (view: string) => void
  onLogout: () => void
  patientCount: number
  deviceCount: number
  alertCount: number
}

export function SidebarNavigation({
  activeView,
  onViewChange,
  onLogout,
  patientCount,
  deviceCount,
  alertCount,
}: SidebarNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    {
      id: "dashboard",
      label: "仪表板",
      icon: LayoutDashboard,
      badge: null,
      description: "系统概览和统计",
    },
    {
      id: "patients",
      label: "患者管理",
      icon: Users,
      badge: patientCount > 0 ? patientCount : null,
      description: "患者信息和设备分配",
    },
    {
      id: "inventory",
      label: "设备库存",
      icon: Package,
      badge: deviceCount > 0 ? deviceCount : null,
      description: "医疗设备库存管理",
    },
    {
      id: "demo",
      label: "演示模式",
      icon: Activity,
      badge: null,
      description: "功能演示和测试",
    },
    {
      id: "analytics",
      label: "数据分析",
      icon: BarChart3,
      badge: null,
      description: "健康数据分析报告",
    },
    {
      id: "monitoring",
      label: "设备监控",
      icon: Monitor,
      badge: alertCount > 0 ? alertCount : null,
      description: "实时设备状态监控",
    },
    {
      id: "maintenance",
      label: "维护管理",
      icon: Wrench,
      badge: null,
      description: "设备维护和保养",
    },
    {
      id: "data",
      label: "数据管理",
      icon: Database,
      badge: null,
      description: "数据备份和导入导出",
    },
    {
      id: "settings",
      label: "系统设置",
      icon: Settings,
      badge: null,
      description: "系统配置和用户管理",
    },
    {
      id: "permissions",
      label: "权限管理",
      icon: Shield,
      badge: null,
      description: "用户权限和角色管理",
    },
  ]

  const currentPage = navigationItems.find((item) => item.id === activeView)

  const handleNavigation = (viewId: string) => {
    onViewChange(viewId)
    setIsOpen(false) // 关闭移动端菜单
  }

  // 桌面端侧边栏
  const DesktopSidebar = () => (
    <div className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex-col z-40">
      {/* 头部 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">医疗数据系统</h1>
            <p className="text-sm text-gray-500">管理控制台</p>
          </div>
        </div>
      </div>

      {/* 导航菜单 */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeView === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-12 ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleNavigation(item.id)}
              >
                <IconComponent className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant={isActive ? "secondary" : "default"}
                    className={`ml-2 ${isActive ? "bg-white text-blue-600" : "bg-blue-100 text-blue-800"}`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            )
          })}
        </nav>
      </div>

      {/* 底部 */}
      <div className="p-4 border-t border-gray-200">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900">系统状态</div>
              <div className="text-xs text-gray-500 mt-1">运行正常</div>
              <div className="flex justify-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full mt-4 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          退出登录
        </Button>
      </div>
    </div>
  )

  // 移动端顶部导航栏
  const MobileHeader = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
      <div className="flex items-center space-x-3">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex flex-col h-full">
              {/* 移动端菜单头部 */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg">医疗数据系统</h1>
                    <p className="text-sm text-gray-500">管理控制台</p>
                  </div>
                </div>
              </div>

              {/* 移动端导航菜单 */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-3">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon
                    const isActive = activeView === item.id

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isActive ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => handleNavigation(item.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${isActive ? "bg-blue-600" : "bg-gray-100"}`}>
                            <IconComponent className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-600"}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`font-medium ${isActive ? "text-blue-900" : "text-gray-900"}`}>
                                {item.label}
                              </span>
                              {item.badge && <Badge variant={isActive ? "default" : "secondary"}>{item.badge}</Badge>}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </nav>
              </div>

              {/* 移动端底部 */}
              <div className="p-4 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">系统状态</div>
                    <div className="text-xs text-gray-500 mt-1">运行正常</div>
                    <div className="flex justify-center mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setIsOpen(false)
                    onLogout()
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  退出登录
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-lg">医疗数据系统</h1>
        </div>
      </div>

      <div className="text-right">
        <div className="text-sm font-medium text-gray-900">{currentPage?.label || "仪表板"}</div>
        <div className="text-xs text-gray-500">{currentPage?.description || "系统概览"}</div>
      </div>
    </div>
  )

  return (
    <>
      <DesktopSidebar />
      <MobileHeader />
    </>
  )
}
