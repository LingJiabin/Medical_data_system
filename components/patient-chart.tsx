"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Activity, Heart, Thermometer } from "lucide-react"
import { useState, useEffect } from "react"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  devices: Device[]
  lastCheckup: string
  status: "正常" | "异常" | "待检查"
}

interface Device {
  id: string
  name: string
  type: string
  value: number
  unit: string
  normalRange: string
  status: "正常" | "异常" | "警告"
  timestamp: string
}

interface PatientChartProps {
  patient: Patient
}

export function PatientChart({ patient }: PatientChartProps) {
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({})

  // 动画效果
  useEffect(() => {
    const timer = setTimeout(() => {
      const values: { [key: string]: number } = {}
      patient.devices.forEach((device) => {
        values[device.id] = device.value
      })
      setAnimatedValues(values)
    }, 300)

    return () => clearTimeout(timer)
  }, [patient])

  // 模拟历史数据用于图表展示
  const generateChartData = (device: Device) => {
    const data = []
    const baseValue = device.value
    for (let i = 6; i >= 0; i--) {
      const variation = (Math.random() - 0.5) * 0.2 * baseValue
      data.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        value: Math.max(0, baseValue + variation),
      })
    }
    return data
  }

  const getChartColor = (status: string) => {
    switch (status) {
      case "正常":
        return "from-green-400 to-green-600"
      case "异常":
        return "from-red-400 to-red-600"
      case "警告":
        return "from-yellow-400 to-yellow-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "血压":
        return <Heart className="h-4 w-4" />
      case "心电":
        return <Activity className="h-4 w-4" />
      case "体温":
        return <Thermometer className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case "正常":
        return "bg-green-500"
      case "异常":
        return "bg-red-500"
      case "警告":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span>数据趋势分析</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {patient.devices.map((device, deviceIndex) => {
            const chartData = generateChartData(device)
            const maxValue = Math.max(...chartData.map((d) => d.value))
            const minValue = Math.min(...chartData.map((d) => d.value))
            const currentValue = animatedValues[device.id] || 0

            return (
              <div
                key={device.id}
                className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${deviceIndex * 200}ms` }}
              >
                {/* 设备信息头部 */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-white shadow-sm`}>{getDeviceIcon(device.type)}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{device.name}</h4>
                      <p className="text-sm text-gray-600">{device.type}监测</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusDot(device.status)} animate-pulse`}></div>
                      <span className="text-2xl font-bold text-gray-900">{currentValue.toFixed(1)}</span>
                      <span className="text-sm text-gray-600">{device.unit}</span>
                    </div>
                    <p className="text-xs text-gray-500">正常范围: {device.normalRange}</p>
                  </div>
                </div>

                {/* 数值显示卡片 */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-blue-600 font-medium">当前值</p>
                    <p className="text-lg font-bold text-blue-700">{device.value}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-green-600 font-medium">最高值</p>
                    <p className="text-lg font-bold text-green-700">{maxValue.toFixed(1)}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-orange-600 font-medium">最低值</p>
                    <p className="text-lg font-bold text-orange-700">{minValue.toFixed(1)}</p>
                  </div>
                </div>

                {/* 美化的趋势图 */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>7天趋势</span>
                  </h5>

                  <div className="relative bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border">
                    {/* 网格背景 */}
                    <div className="absolute inset-4 opacity-10">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="border-t border-gray-300" style={{ marginTop: `${i * 25}%` }}></div>
                      ))}
                    </div>

                    {/* 数据点和连线 */}
                    <div className="relative h-32">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* 渐变定义 */}
                        <defs>
                          <linearGradient id={`gradient-${device.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" className="stop-blue-400" stopOpacity="0.8" />
                            <stop offset="100%" className="stop-blue-600" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>

                        {/* 面积图 */}
                        <path
                          d={`M 0,${100 - (chartData[0].value / maxValue) * 80} ${chartData
                            .map(
                              (point, index) =>
                                `L ${(index / (chartData.length - 1)) * 100},${100 - (point.value / maxValue) * 80}`,
                            )
                            .join(" ")} L 100,100 L 0,100 Z`}
                          fill={`url(#gradient-${device.id})`}
                          className="animate-in fade-in-0 duration-1000"
                        />

                        {/* 趋势线 */}
                        <path
                          d={`M 0,${100 - (chartData[0].value / maxValue) * 80} ${chartData
                            .map(
                              (point, index) =>
                                `L ${(index / (chartData.length - 1)) * 100},${100 - (point.value / maxValue) * 80}`,
                            )
                            .join(" ")}`}
                          fill="none"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="2"
                          className="animate-in fade-in-0 duration-1000 delay-300"
                        />
                      </svg>

                      {/* 数据点 */}
                      {chartData.map((point, index) => (
                        <div
                          key={index}
                          className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-0 duration-500"
                          style={{
                            left: `${(index / (chartData.length - 1)) * 100}%`,
                            top: `${100 - (point.value / maxValue) * 80}%`,
                            animationDelay: `${index * 100 + 500}ms`,
                          }}
                          title={`${point.date}: ${point.value.toFixed(1)} ${device.unit}`}
                        />
                      ))}
                    </div>

                    {/* X轴标签 */}
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      {chartData.map((point, index) => (
                        <span key={index} className="text-center">
                          {point.date.split("/").slice(1).join("/")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 状态指示器 */}
                <div
                  className={`p-3 rounded-lg border-l-4 ${
                    device.status === "正常"
                      ? "bg-green-50 border-green-500"
                      : device.status === "异常"
                        ? "bg-red-50 border-red-500"
                        : "bg-yellow-50 border-yellow-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        device.status === "正常"
                          ? "text-green-700"
                          : device.status === "异常"
                            ? "text-red-700"
                            : "text-yellow-700"
                      }`}
                    >
                      设备状态: {device.status}
                    </span>
                    <span className="text-xs text-gray-600">更新时间: {device.timestamp}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
