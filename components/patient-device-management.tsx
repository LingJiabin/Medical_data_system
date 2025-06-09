"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Trash2, AlertTriangle, CheckCircle, Clock, User, Stethoscope } from "lucide-react"
import { AddPatientDeviceDialog } from "@/components/add-patient-device-dialog"
import { useToast } from "@/hooks/use-toast"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  devices: PatientDevice[]
  lastCheckup: string
  status: "正常" | "异常" | "待检查"
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
  deviceId?: string // 关联的设备库存ID
  notes?: string
}

interface InventoryDevice {
  id: string
  name: string
  type: string
  model: string
  serialNumber: string
  manufacturer: string
  status: "在用" | "空闲" | "维护中" | "故障" | "报废"
  location: string
}

interface PatientHistory {
  id: string
  date: string
  type: string
  description: string
  deviceId: string
  oldValue?: number
  newValue?: number
  operator: string
}

interface PatientDeviceManagementProps {
  patients: Patient[]
  inventoryDevices?: InventoryDevice[]
  onUpdatePatient: (patientId: string, updatedPatient: Patient) => void
  onAddHistory?: (patientId: string, record: Omit<PatientHistory, "id">) => void
}

export function PatientDeviceManagement({
  patients,
  inventoryDevices = [],
  onUpdatePatient,
  onAddHistory,
}: PatientDeviceManagementProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deviceFilter, setDeviceFilter] = useState("all")
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(patients)
  const { toast } = useToast()

  // 搜索和过滤患者
  useEffect(() => {
    let filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter((patient) => patient.status === statusFilter)
    }

    setFilteredPatients(filtered)
  }, [searchTerm, statusFilter, patients])

  // 为患者添加设备
  const handleAddDeviceToPatient = (patientId: string, deviceData: PatientDevice) => {
    const patient = patients.find((p) => p.id === patientId)
    if (!patient) return

    const updatedDevices = [...patient.devices, deviceData]

    // 更新患者状态
    const hasAbnormal = updatedDevices.some((d) => d.status === "异常")
    const hasWarning = updatedDevices.some((d) => d.status === "警告")
    const newStatus = hasAbnormal ? "异常" : hasWarning ? "待检查" : "正常"

    const updatedPatient: Patient = {
      ...patient,
      devices: updatedDevices,
      status: newStatus,
      lastCheckup: new Date().toLocaleDateString(),
    }

    onUpdatePatient(patientId, updatedPatient)

    // 如果选中的是当前患者，更新选中状态
    if (selectedPatient?.id === patientId) {
      setSelectedPatient(updatedPatient)
    }

    toast({
      title: "设备添加成功",
      description: `已为患者 ${patient.name} 添加设备 ${deviceData.name}`,
    })
  }

  // 移除患者设备
  const handleRemoveDevice = (patientId: string, deviceId: string) => {
    const patient = patients.find((p) => p.id === patientId)
    if (!patient) return

    const deviceToRemove = patient.devices.find((d) => d.id === deviceId)
    const updatedDevices = patient.devices.filter((d) => d.id !== deviceId)

    // 更新患者状态
    const hasAbnormal = updatedDevices.some((d) => d.status === "异常")
    const hasWarning = updatedDevices.some((d) => d.status === "警告")
    const newStatus = updatedDevices.length === 0 ? "待检查" : hasAbnormal ? "异常" : hasWarning ? "待检查" : "正常"

    const updatedPatient: Patient = {
      ...patient,
      devices: updatedDevices,
      status: newStatus,
      lastCheckup: new Date().toLocaleDateString(),
    }

    onUpdatePatient(patientId, updatedPatient)

    // 添加历史记录
    if (onAddHistory && deviceToRemove) {
      onAddHistory(patientId, {
        date: new Date().toLocaleString(),
        type: "设备移除",
        description: `移除设备 ${deviceToRemove.name}`,
        deviceId: deviceToRemove.id,
        operator: "管理员",
      })
    }

    // 如果选中的是当前患者，更新选中状态
    if (selectedPatient?.id === patientId) {
      setSelectedPatient(updatedPatient)
    }

    toast({
      title: "设备移除成功",
      description: "设备已从患者记录中移除",
    })
  }

  // 更新设备数值
  const handleUpdateDeviceValue = (patientId: string, deviceId: string, newValue: number) => {
    const patient = patients.find((p) => p.id === patientId)
    if (!patient) return

    const oldDevice = patient.devices.find((d) => d.id === deviceId)
    const oldValue = oldDevice?.value

    const updatedDevices = patient.devices.map((device) => {
      if (device.id === deviceId) {
        // 判断新数值的状态
        let status: "正常" | "异常" | "警告" = "正常"
        if (device.normalRange) {
          const [min, max] = device.normalRange.split("-").map(Number)
          if (newValue < min || newValue > max) {
            status = newValue < min * 0.8 || newValue > max * 1.2 ? "异常" : "警告"
          }
        }

        return {
          ...device,
          value: newValue,
          status,
          timestamp: new Date().toLocaleString(),
        }
      }
      return device
    })

    // 更新患者状态
    const hasAbnormal = updatedDevices.some((d) => d.status === "异常")
    const hasWarning = updatedDevices.some((d) => d.status === "警告")
    const newStatus = hasAbnormal ? "异常" : hasWarning ? "待检查" : "正常"

    const updatedPatient: Patient = {
      ...patient,
      devices: updatedDevices,
      status: newStatus,
      lastCheckup: new Date().toLocaleDateString(),
    }

    onUpdatePatient(patientId, updatedPatient)

    // 添加历史记录
    if (onAddHistory && oldDevice && oldValue !== newValue) {
      onAddHistory(patientId, {
        date: new Date().toLocaleString(),
        type: "数值更新",
        description: `更新 ${oldDevice.name} 数值从 ${oldValue} 到 ${newValue} ${oldDevice.unit}`,
        deviceId: deviceId,
        oldValue: oldValue,
        newValue: newValue,
        operator: "管理员",
      })
    }

    // 如果选中的是当前患者，更新选中状态
    if (selectedPatient?.id === patientId) {
      setSelectedPatient(updatedPatient)
    }

    toast({
      title: "数值更新成功",
      description: "设备检测数值已更新",
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
      case "待检查":
        return "bg-blue-100 text-blue-800"
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

  const deviceTypes = [...new Set(patients.flatMap((p) => p.devices.map((d) => d.type)))]

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总患者数</p>
                <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">设备总数</p>
                <p className="text-3xl font-bold text-green-600">
                  {patients.reduce((sum, p) => sum + p.devices.length, 0)}
                </p>
              </div>
              <Stethoscope className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">异常设备</p>
                <p className="text-3xl font-bold text-red-600">
                  {patients.reduce((sum, p) => sum + p.devices.filter((d) => d.status === "异常").length, 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">正常设备</p>
                <p className="text-3xl font-bold text-blue-600">
                  {patients.reduce((sum, p) => sum + p.devices.filter((d) => d.status === "正常").length, 0)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 患者列表 */}
        <div className="lg:col-span-1">
          <Card className="animate-in fade-in-0 slide-in-from-left-4 duration-500">
            <CardHeader>
              <CardTitle>患者列表</CardTitle>
              <CardDescription>选择患者管理其设备</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 搜索和过滤 */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索患者..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="正常">正常</SelectItem>
                    <SelectItem value="异常">异常</SelectItem>
                    <SelectItem value="待检查">待检查</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 患者列表 */}
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedPatient?.id === patient.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-sm text-gray-500">
                          {patient.id} • {patient.age}岁 • {patient.gender}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{patient.devices.length} 个设备</div>
                      </div>
                      <Badge className={getStatusColor(patient.status)}>
                        {getStatusIcon(patient.status)}
                        <span className="ml-1">{patient.status}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 设备管理 */}
        <div className="lg:col-span-2">
          <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>设备管理</CardTitle>
                  <CardDescription>
                    {selectedPatient ? `管理患者 ${selectedPatient.name} 的设备` : "请选择患者"}
                  </CardDescription>
                </div>
                {selectedPatient && (
                  <AddPatientDeviceDialog
                    patient={selectedPatient}
                    inventoryDevices={inventoryDevices}
                    onAddDevice={(deviceData) => handleAddDeviceToPatient(selectedPatient.id, deviceData)}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <Tabs defaultValue="devices" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="devices">设备列表</TabsTrigger>
                    <TabsTrigger value="history">检测历史</TabsTrigger>
                  </TabsList>

                  <TabsContent value="devices" className="space-y-4">
                    {selectedPatient.devices.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>设备信息</TableHead>
                              <TableHead>当前数值</TableHead>
                              <TableHead>状态</TableHead>
                              <TableHead>最后更新</TableHead>
                              <TableHead>操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedPatient.devices.map((device, index) => (
                              <TableRow
                                key={device.id}
                                className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                                style={{ animationDelay: `${index * 100}ms` }}
                              >
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{device.name}</div>
                                    <div className="text-sm text-gray-500">{device.type}监测</div>
                                    <div className="text-xs text-gray-400">
                                      正常范围: {device.normalRange} {device.unit}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      type="number"
                                      step="0.1"
                                      defaultValue={device.value}
                                      className="w-20"
                                      onBlur={(e) => {
                                        const newValue = Number.parseFloat(e.target.value)
                                        if (!isNaN(newValue) && newValue !== device.value) {
                                          handleUpdateDeviceValue(selectedPatient.id, device.id, newValue)
                                        }
                                      }}
                                    />
                                    <span className="text-sm text-gray-500">{device.unit}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(device.status)}>
                                    {getStatusIcon(device.status)}
                                    <span className="ml-1">{device.status}</span>
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">{device.timestamp}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRemoveDevice(selectedPatient.id, device.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Stethoscope className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">暂无设备</p>
                        <p className="text-sm">为该患者添加医疗设备开始监测</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4">
                    <div className="space-y-4">
                      {selectedPatient.devices.map((device) => (
                        <div key={device.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium">{device.name}</h4>
                            <Badge className={getStatusColor(device.status)}>{device.status}</Badge>
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
                          {device.notes && (
                            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                              <span className="text-gray-600">备注:</span> {device.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">请选择患者</p>
                  <p className="text-sm">从左侧列表选择患者以管理其设备</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
