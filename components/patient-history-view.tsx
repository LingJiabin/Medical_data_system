"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Calendar,
  Activity,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  User,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  devices: PatientDevice[]
  lastCheckup: string
  status: "正常" | "异常" | "待检查"
  history: PatientHistory[]
  createdAt: string
  phone?: string
  address?: string
  emergencyContact?: string
}

interface PatientDevice {
  id: string
  name: string
  type: string
  value: number
  unit: string
  normalRange: string
  status: "正常" | "异常" | "警告"
  timestamp: string
}

interface PatientHistory {
  id: string
  date: string
  type: "检查" | "设备添加" | "设备移除" | "数值更新" | "状态变更"
  description: string
  deviceId?: string
  oldValue?: number
  newValue?: number
  operator: string
}

interface PatientHistoryViewProps {
  patient: Patient
  onAddHistory: (patientId: string, record: Omit<PatientHistory, "id">) => void
}

export function PatientHistoryView({ patient, onAddHistory }: PatientHistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("timeline")

  // 过滤历史记录
  const filteredHistory = useMemo(() => {
    let filtered = patient.history.filter((record) =>
      record.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (typeFilter !== "all") {
      filtered = filtered.filter((record) => record.type === typeFilter)
    }

    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filtered = filtered.filter((record) => new Date(record.date) >= filterDate)
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [patient.history, searchTerm, typeFilter, dateFilter])

  // 设备数值变化统计
  const deviceValueChanges = useMemo(() => {
    const changes: { [deviceId: string]: { name: string; changes: PatientHistory[] } } = {}

    patient.history
      .filter((record) => record.type === "数值更新" && record.deviceId)
      .forEach((record) => {
        if (record.deviceId) {
          const device = patient.devices.find((d) => d.id === record.deviceId)
          if (device) {
            if (!changes[record.deviceId]) {
              changes[record.deviceId] = {
                name: device.name,
                changes: [],
              }
            }
            changes[record.deviceId].changes.push(record)
          }
        }
      })

    return changes
  }, [patient.history, patient.devices])

  // 统计数据
  const stats = useMemo(() => {
    const total = patient.history.length
    const deviceAdded = patient.history.filter((r) => r.type === "设备添加").length
    const deviceRemoved = patient.history.filter((r) => r.type === "设备移除").length
    const valueUpdates = patient.history.filter((r) => r.type === "数值更新").length
    const statusChanges = patient.history.filter((r) => r.type === "状态变更").length

    return {
      total,
      deviceAdded,
      deviceRemoved,
      valueUpdates,
      statusChanges,
    }
  }, [patient.history])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "设备添加":
        return <Plus className="h-4 w-4 text-green-600" />
      case "设备移除":
        return <Minus className="h-4 w-4 text-red-600" />
      case "数值更新":
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      case "状态变更":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "检查":
        return <Activity className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "设备添加":
        return "bg-green-100 text-green-800"
      case "设备移除":
        return "bg-red-100 text-red-800"
      case "数值更新":
        return "bg-blue-100 text-blue-800"
      case "状态变更":
        return "bg-yellow-100 text-yellow-800"
      case "检查":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return `今天 ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays === 1) {
      return `昨天 ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays < 7) {
      return `${diffDays}天前 ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return date.toLocaleString("zh-CN")
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
            <div>
              <CardTitle>患者历史记录</CardTitle>
              <CardDescription>
                {patient.name} 的完整医疗记录和设备使用历史 ({filteredHistory.length} 条记录)
              </CardDescription>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 text-center">
              <div className="p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-blue-600">总记录</div>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">{stats.deviceAdded}</div>
                <div className="text-xs text-green-600">设备添加</div>
              </div>
              <div className="p-2 bg-red-50 rounded">
                <div className="text-lg font-bold text-red-600">{stats.deviceRemoved}</div>
                <div className="text-xs text-red-600">设备移除</div>
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <div className="text-lg font-bold text-purple-600">{stats.valueUpdates}</div>
                <div className="text-xs text-purple-600">数值更新</div>
              </div>
              <div className="p-2 bg-yellow-50 rounded">
                <div className="text-lg font-bold text-yellow-600">{stats.statusChanges}</div>
                <div className="text-xs text-yellow-600">状态变更</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">时间线</TabsTrigger>
          <TabsTrigger value="devices">设备历史</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="flex-1 flex flex-col space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="搜索历史记录..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full lg:w-32">
                    <SelectValue placeholder="类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="检查">检查</SelectItem>
                    <SelectItem value="设备添加">设备添加</SelectItem>
                    <SelectItem value="设备移除">设备移除</SelectItem>
                    <SelectItem value="数值更新">数值更新</SelectItem>
                    <SelectItem value="状态变更">状态变更</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full lg:w-32">
                    <SelectValue placeholder="时间" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部时间</SelectItem>
                    <SelectItem value="today">今天</SelectItem>
                    <SelectItem value="week">最近一周</SelectItem>
                    <SelectItem value="month">最近一月</SelectItem>
                    <SelectItem value="year">最近一年</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setTypeFilter("all")
                    setDateFilter("all")
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  重置
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="p-4 h-full overflow-auto">
              {filteredHistory.length > 0 ? (
                <div className="space-y-4">
                  {filteredHistory.map((record, index) => (
                    <div key={record.id} className="flex space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                          {getTypeIcon(record.type)}
                        </div>
                        {index < filteredHistory.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-2" />}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-2 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getTypeColor(record.type)}>{record.type}</Badge>
                              <span className="text-sm text-gray-500">{formatDate(record.date)}</span>
                            </div>
                            <p className="text-sm text-gray-900 mb-2">{record.description}</p>
                            {(record.oldValue !== undefined || record.newValue !== undefined) && (
                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                {record.oldValue !== undefined && (
                                  <span className="flex items-center space-x-1">
                                    <TrendingDown className="h-3 w-3" />
                                    <span>原值: {record.oldValue}</span>
                                  </span>
                                )}
                                {record.newValue !== undefined && (
                                  <span className="flex items-center space-x-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>新值: {record.newValue}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            <span>{record.operator}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">暂无历史记录</p>
                    <p className="text-sm">没有找到符合条件的历史记录</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>设备使用历史</CardTitle>
              <CardDescription>各设备的数值变化记录</CardDescription>
            </CardHeader>
            <CardContent className="h-full overflow-auto">
              {Object.keys(deviceValueChanges).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(deviceValueChanges).map(([deviceId, data]) => (
                    <div key={deviceId} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{data.name}</h4>
                      <div className="space-y-2">
                        {data.changes.slice(0, 10).map((change) => (
                          <div key={change.id} className="flex justify-between items-center text-sm">
                            <span>{formatDate(change.date)}</span>
                            <div className="flex items-center space-x-2">
                              {change.oldValue !== undefined && (
                                <span className="text-gray-500">{change.oldValue}</span>
                              )}
                              <span>→</span>
                              {change.newValue !== undefined && <span className="font-medium">{change.newValue}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">暂无设备历史</p>
                    <p className="text-sm">还没有设备数值变化记录</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>数据分析</CardTitle>
              <CardDescription>患者健康数据趋势分析</CardDescription>
            </CardHeader>
            <CardContent className="h-full overflow-auto">
              <div className="text-center text-gray-500 py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">数据分析功能</p>
                <p className="text-sm">此功能正在开发中，将提供详细的健康数据趋势分析</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
