"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Package, Activity, AlertTriangle, TrendingUp, Clock, CheckCircle, ArrowRight } from "lucide-react"

interface DashboardOverviewProps {
  patientCount: number
  deviceCount: number
  alertCount: number
  onNavigate: (view: string) => void
}

export function DashboardOverview({ patientCount, deviceCount, alertCount, onNavigate }: DashboardOverviewProps) {
  const quickStats = [
    {
      title: "患者总数",
      value: patientCount,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
      changeType: "increase",
    },
    {
      title: "设备总数",
      value: deviceCount,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+5%",
      changeType: "increase",
    },
    {
      title: "活跃监测",
      value: Math.floor(deviceCount * 0.7),
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+8%",
      changeType: "increase",
    },
    {
      title: "待处理警报",
      value: alertCount,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      change: "-3%",
      changeType: "decrease",
    },
  ]

  const quickActions = [
    {
      title: "添加新患者",
      description: "快速添加患者并配置监测设备",
      action: () => onNavigate("patients"),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "设备管理",
      description: "查看和管理医疗设备库存",
      action: () => onNavigate("inventory"),
      icon: Package,
      color: "bg-green-500",
    },
    {
      title: "数据分析",
      description: "查看健康数据分析报告",
      action: () => onNavigate("analytics"),
      icon: TrendingUp,
      color: "bg-purple-500",
    },
    {
      title: "演示模式",
      description: "体验系统功能演示",
      action: () => onNavigate("demo"),
      icon: Activity,
      color: "bg-orange-500",
    },
  ]

  const recentActivities = [
    {
      type: "patient",
      message: "新增患者：陈小花",
      time: "2分钟前",
      status: "success",
    },
    {
      type: "alert",
      message: "王老五血压监测异常警报 (165 mmHg)",
      time: "5分钟前",
      status: "warning",
    },
    {
      type: "device",
      message: "设备维护完成：心电图仪 ECG-Pro",
      time: "10分钟前",
      status: "success",
    },
    {
      type: "alert",
      message: "李美丽血糖值异常 (7.8 mmol/L)",
      time: "15分钟前",
      status: "warning",
    },
    {
      type: "system",
      message: "系统备份已完成",
      time: "1小时前",
      status: "info",
    },
    {
      type: "patient",
      message: "患者张三状态更新为待检查",
      time: "2小时前",
      status: "info",
    },
  ]

  return (
    <div className="space-y-6">
      {/* 欢迎信息 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">欢迎回来，管理员</h1>
        <p className="text-blue-100">今天是 {new Date().toLocaleDateString("zh-CN")}，系统运行正常</p>
      </div>

      {/* 快速统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span
                        className={`text-sm font-medium ${
                          stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs 上月</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用功能快速访问</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <div
                  key={index}
                  className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={action.action}
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white mr-4`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{action.title}</h4>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>系统最新动态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.status === "success"
                      ? "bg-green-500"
                      : activity.status === "warning"
                        ? "bg-yellow-500"
                        : activity.status === "info"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                {activity.status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                {activity.status === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                {activity.status === "info" && <Clock className="h-4 w-4 text-blue-500" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 系统状态 */}
      <Card>
        <CardHeader>
          <CardTitle>系统状态</CardTitle>
          <CardDescription>当前系统运行状态概览</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-medium">系统运行</h4>
              <p className="text-sm text-gray-500">正常运行 99.9%</p>
              <Badge className="mt-2 bg-green-100 text-green-800">在线</Badge>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-medium">数据同步</h4>
              <p className="text-sm text-gray-500">实时同步中</p>
              <Badge className="mt-2 bg-blue-100 text-blue-800">同步中</Badge>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-medium">设备连接</h4>
              <p className="text-sm text-gray-500">{Math.floor(deviceCount * 0.8)} 台在线</p>
              <Badge className="mt-2 bg-purple-100 text-purple-800">稳定</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
