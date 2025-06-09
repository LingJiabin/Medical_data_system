"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Zap,
  User,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DemoDevice {
  id: string
  name: string
  type: string
  value: number
  unit: string
  normalRange: string
  status: "正常" | "异常" | "警告"
  timestamp: string
  icon: React.ComponentType<any>
  color: string
}

interface DemoPatient {
  id: string
  name: string
  age: number
  gender: string
  devices: DemoDevice[]
}

export function DeviceDemo() {
  const [demoPatient, setDemoPatient] = useState<DemoPatient>({
    id: "DEMO001",
    name: "演示患者",
    age: 35,
    gender: "男",
    devices: [],
  })
  const { toast } = useToast()

  // 预设的演示设备
  const demoDevices: Omit<DemoDevice, "id" | "timestamp">[] = [
    {
      name: "血压监测仪",
      type: "血压",
      value: 125,
      unit: "mmHg",
      normalRange: "90-140",
      status: "正常",
      icon: Heart,
      color: "text-red-500",
    },
    {
      name: "心电图仪",
      type: "心电",
      value: 78,
      unit: "bpm",
      normalRange: "60-100",
      status: "正常",
      icon: Activity,
      color: "text-blue-500",
    },
    {
      name: "体温计",
      type: "体温",
      value: 37.8,
      unit: "°C",
      normalRange: "36.0-37.5",
      status: "警告",
      icon: Thermometer,
      color: "text-orange-500",
    },
    {
      name: "血糖仪",
      type: "血糖",
      value: 7.2,
      unit: "mmol/L",
      normalRange: "3.9-6.1",
      status: "警告",
      icon: Droplets,
      color: "text-purple-500",
    },
    {
      name: "血氧仪",
      type: "血氧",
      value: 93,
      unit: "%",
      normalRange: "95-100",
      status: "异常",
      icon: Zap,
      color: "text-green-500",
    },
    {
      name: "呼吸监测仪",
      type: "呼吸",
      value: 22,
      unit: "次/分",
      normalRange: "12-20",
      status: "警告",
      icon: Activity,
      color: "text-cyan-500",
    },
    {
      name: "胆固醇检测仪",
      type: "胆固醇",
      value: 6.8,
      unit: "mmol/L",
      normalRange: "3.0-5.2",
      status: "异常",
      icon: Droplets,
      color: "text-yellow-500",
    },
    {
      name: "智能体重秤",
      type: "体重",
      value: 75.5,
      unit: "kg",
      normalRange: "60-80",
      status: "正常",
      icon: Activity,
      color: "text-indigo-500",
    },
    {
      name: "BMI计算器",
      type: "BMI",
      value: 26.2,
      unit: "",
      normalRange: "18.5-24.9",
      status: "警告",
      icon: Activity,
      color: "text-pink-500",
    },
  ]

  const addDevice = (deviceTemplate: Omit<DemoDevice, "id" | "timestamp">) => {
    const newDevice: DemoDevice = {
      ...deviceTemplate,
      id: `DEMO_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
    }

    setDemoPatient((prev) => ({
      ...prev,
      devices: [...prev.devices, newDevice],
    }))

    toast({
      title: "设备添加成功",
      description: `${deviceTemplate.name} 已添加到患者记录`,
    })
  }

  const removeDevice = (deviceId: string) => {
    setDemoPatient((prev) => ({
      ...prev,
      devices: prev.devices.filter((d) => d.id !== deviceId),
    }))

    toast({
      title: "设备移除成功",
      description: "设备已从患者记录中移除",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "正常":
        return "bg-green-100 text-green-800"
      case "异常":
        return "bg-red-100 text-red-800"
      case "警告":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "正常":
        return <CheckCircle className="h-4 w-4" />
      case "异常":
        return <AlertTriangle className="h-4 w-4" />
      case "警告":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const normalDevices = demoPatient.devices.filter((d) => d.status === "正常").length
  const warningDevices = demoPatient.devices.filter((d) => d.status === "警告").length
  const abnormalDevices = demoPatient.devices.filter((d) => d.status === "异常").length

  return (
    <div className="space-y-6">
      {/* 演示说明 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <User className="h-5 w-5" />
            <span>设备添加演示</span>
          </CardTitle>
          <CardDescription className="text-blue-700">
            这是一个演示页面，展示如何为患者添加不同类型的医疗设备。您可以尝试添加各种设备并观察状态变化。
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 统计面板 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">设备总数</p>
                <p className="text-2xl font-bold">{demoPatient.devices.length}</p>
              </div>
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">正常设备</p>
                <p className="text-2xl font-bold text-green-600">{normalDevices}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">警告设备</p>
                <p className="text-2xl font-bold text-yellow-600">{warningDevices}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">异常设备</p>
                <p className="text-2xl font-bold text-red-600">{abnormalDevices}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 可添加的设备 */}
        <Card>
          <CardHeader>
            <CardTitle>可添加的设备类型</CardTitle>
            <CardDescription>点击下方设备卡片为患者添加不同类型的医疗设备</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {demoDevices.map((device, index) => {
                const IconComponent = device.icon
                const isAdded = demoPatient.devices.some((d) => d.type === device.type)

                return (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg transition-all duration-200 ${
                      isAdded
                        ? "border-gray-300 bg-gray-50 opacity-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                    }`}
                    onClick={() => !isAdded && addDevice(device)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`h-6 w-6 ${device.color}`} />
                        <div>
                          <div className="font-medium">{device.name}</div>
                          <div className="text-sm text-gray-500">
                            {device.value} {device.unit} • 正常范围: {device.normalRange}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(device.status)}>{device.status}</Badge>
                        {isAdded ? (
                          <Badge variant="outline" className="bg-gray-100">
                            已添加
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Plus className="h-3 w-3 mr-1" />
                            添加
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 患者当前设备 */}
        <Card>
          <CardHeader>
            <CardTitle>患者当前设备</CardTitle>
            <CardDescription>患者 {demoPatient.name} 当前配置的医疗设备列表</CardDescription>
          </CardHeader>
          <CardContent>
            {demoPatient.devices.length > 0 ? (
              <div className="space-y-3">
                {demoPatient.devices.map((device) => {
                  const IconComponent = device.icon

                  return (
                    <div key={device.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <IconComponent className={`h-5 w-5 ${device.color}`} />
                          <div>
                            <div className="font-medium">{device.name}</div>
                            <div className="text-sm text-gray-500">{device.type}监测</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(device.status)}>
                            {getStatusIcon(device.status)}
                            <span className="ml-1">{device.status}</span>
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeDevice(device.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            移除
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">当前值:</span>
                          <p className="font-medium">
                            {device.value} {device.unit}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">正常范围:</span>
                          <p className="font-medium">{device.normalRange}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">更新时间:</span>
                          <p className="font-medium">{device.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">暂无设备</p>
                <p className="text-sm">从左侧选择设备为患者添加监测设备</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 设备状态分析 */}
      {demoPatient.devices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>设备状态分析</CardTitle>
            <CardDescription>根据当前设备状态提供的健康建议</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">状态总览</TabsTrigger>
                <TabsTrigger value="warnings">警告项目</TabsTrigger>
                <TabsTrigger value="recommendations">建议</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">正常指标</h4>
                    <div className="space-y-1">
                      {demoPatient.devices
                        .filter((d) => d.status === "正常")
                        .map((device) => (
                          <p key={device.id} className="text-sm text-green-700">
                            • {device.name}: {device.value} {device.unit}
                          </p>
                        ))}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">需要关注</h4>
                    <div className="space-y-1">
                      {demoPatient.devices
                        .filter((d) => d.status === "警告")
                        .map((device) => (
                          <p key={device.id} className="text-sm text-yellow-700">
                            • {device.name}: {device.value} {device.unit}
                          </p>
                        ))}
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">异常指标</h4>
                    <div className="space-y-1">
                      {demoPatient.devices
                        .filter((d) => d.status === "异常")
                        .map((device) => (
                          <p key={device.id} className="text-sm text-red-700">
                            • {device.name}: {device.value} {device.unit}
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="warnings" className="space-y-4">
                {[...demoPatient.devices.filter((d) => d.status === "警告" || d.status === "异常")].map((device) => (
                  <div key={device.id} className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">{device.name}</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      当前值 {device.value} {device.unit} 超出正常范围 {device.normalRange}，建议进一步检查。
                    </p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">监测建议</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 建议每日定时监测异常指标</li>
                      <li>• 保持良好的生活习惯和饮食规律</li>
                      <li>• 如有持续异常，请及时就医</li>
                      <li>• 定期校准和维护监测设备</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
