"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Stethoscope, Package, Activity, Heart, Thermometer, Zap, Droplets, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
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
  deviceId?: string
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

interface AddPatientDeviceDialogProps {
  patient: Patient
  inventoryDevices: InventoryDevice[]
  onAddDevice: (deviceData: PatientDevice) => void
}

// 设备类型配置 - 扩展更多设备类型
const DEVICE_TYPES = [
  {
    id: "blood_pressure",
    name: "血压监测",
    unit: "mmHg",
    normalRange: "90-140",
    icon: Heart,
    color: "text-red-500",
    description: "收缩压监测",
  },
  {
    id: "ecg",
    name: "心电监测",
    unit: "bpm",
    normalRange: "60-100",
    icon: Activity,
    color: "text-blue-500",
    description: "心率监测",
  },
  {
    id: "temperature",
    name: "体温监测",
    unit: "°C",
    normalRange: "36.0-37.5",
    icon: Thermometer,
    color: "text-orange-500",
    description: "体温测量",
  },
  {
    id: "blood_glucose",
    name: "血糖监测",
    unit: "mmol/L",
    normalRange: "3.9-6.1",
    icon: Droplets,
    color: "text-purple-500",
    description: "血糖水平监测",
  },
  {
    id: "blood_oxygen",
    name: "血氧监测",
    unit: "%",
    normalRange: "95-100",
    icon: Zap,
    color: "text-green-500",
    description: "血氧饱和度监测",
  },
  {
    id: "respiratory_rate",
    name: "呼吸频率",
    unit: "次/分",
    normalRange: "12-20",
    icon: Activity,
    color: "text-cyan-500",
    description: "呼吸频率监测",
  },
  {
    id: "cholesterol",
    name: "胆固醇",
    unit: "mmol/L",
    normalRange: "3.0-5.2",
    icon: Droplets,
    color: "text-yellow-500",
    description: "胆固醇水平监测",
  },
  {
    id: "weight",
    name: "体重监测",
    unit: "kg",
    normalRange: "50-80",
    icon: Activity,
    color: "text-indigo-500",
    description: "体重测量",
  },
  {
    id: "bmi",
    name: "BMI指数",
    unit: "",
    normalRange: "18.5-24.9",
    icon: Activity,
    color: "text-pink-500",
    description: "身体质量指数",
  },
]

export function AddPatientDeviceDialog({ patient, inventoryDevices, onAddDevice }: AddPatientDeviceDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("inventory")
  const [selectedInventoryDevice, setSelectedInventoryDevice] = useState<InventoryDevice | null>(null)
  const [customDeviceData, setCustomDeviceData] = useState({
    name: "",
    type: "",
    unit: "",
    normalRange: "",
  })
  const [deviceValue, setDeviceValue] = useState("")
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  const generateDeviceId = () => {
    return `PD${String(Date.now()).slice(-6)}`
  }

  const getDeviceStatus = (value: number, normalRange: string) => {
    if (!normalRange) return "正常"
    const [min, max] = normalRange.split("-").map(Number)
    if (value < min || value > max) {
      return value < min * 0.8 || value > max * 1.2 ? "异常" : "警告"
    }
    return "正常"
  }

  const handleSubmitInventoryDevice = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedInventoryDevice || !deviceValue) {
      toast({
        title: "表单错误",
        description: "请选择设备并输入检测数值",
        variant: "destructive",
      })
      return
    }

    // 根据设备类型获取单位和正常范围
    const deviceTypeConfig = DEVICE_TYPES.find((dt) => selectedInventoryDevice.type.includes(dt.name))
    const unit = deviceTypeConfig?.unit || ""
    const normalRange = deviceTypeConfig?.normalRange || ""

    const value = Number.parseFloat(deviceValue)
    const status = getDeviceStatus(value, normalRange)

    const newDevice: PatientDevice = {
      id: generateDeviceId(),
      name: selectedInventoryDevice.name,
      type: selectedInventoryDevice.type.replace("监测", ""),
      value,
      unit,
      normalRange,
      status,
      timestamp: new Date().toLocaleString(),
      deviceId: selectedInventoryDevice.id,
      notes,
    }

    onAddDevice(newDevice)
    resetForm()
    setIsOpen(false)
  }

  const handleSubmitCustomDevice = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customDeviceData.name || !customDeviceData.type || !deviceValue) {
      toast({
        title: "表单错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    const value = Number.parseFloat(deviceValue)
    const status = getDeviceStatus(value, customDeviceData.normalRange)

    const newDevice: PatientDevice = {
      id: generateDeviceId(),
      name: customDeviceData.name,
      type: customDeviceData.type,
      value,
      unit: customDeviceData.unit,
      normalRange: customDeviceData.normalRange,
      status,
      timestamp: new Date().toLocaleString(),
      notes,
    }

    onAddDevice(newDevice)
    resetForm()
    setIsOpen(false)
  }

  const resetForm = () => {
    setSelectedInventoryDevice(null)
    setCustomDeviceData({ name: "", type: "", unit: "", normalRange: "" })
    setDeviceValue("")
    setNotes("")
    setActiveTab("inventory")
  }

  const handleDeviceTypeSelect = (deviceType: (typeof DEVICE_TYPES)[0]) => {
    setCustomDeviceData({
      name: `${deviceType.name}仪`,
      type: deviceType.name,
      unit: deviceType.unit,
      normalRange: deviceType.normalRange,
    })
  }

  // 过滤可用的库存设备
  const availableDevices = inventoryDevices.filter((device) => device.status === "空闲")

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>添加设备</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5" />
            <span>为患者添加设备</span>
          </DialogTitle>
          <DialogDescription>为患者 {patient.name} 添加医疗监测设备</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inventory" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>从库存选择</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>自定义设备</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            <form onSubmit={handleSubmitInventoryDevice} className="space-y-6">
              {/* 设备选择 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">选择库存设备</h3>
                {availableDevices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {availableDevices.map((device) => (
                      <div
                        key={device.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedInventoryDevice?.id === device.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedInventoryDevice(device)}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedInventoryDevice?.id === device.id}
                            onChange={() => {}}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{device.name}</div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>型号: {device.model}</p>
                              <p>类型: {device.type}</p>
                              <p>位置: {device.location}</p>
                            </div>
                            <Badge variant="outline" className="mt-2 bg-green-50 text-green-800">
                              {device.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无可用的库存设备</p>
                    <p className="text-sm">请先在设备管理中添加设备</p>
                  </div>
                )}
              </div>

              {/* 检测数值输入 */}
              {selectedInventoryDevice && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">设置初始数值</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inventoryValue">
                        检测数值 *{" "}
                        {DEVICE_TYPES.find((dt) => selectedInventoryDevice.type.includes(dt.name))?.unit && (
                          <span className="text-gray-500">
                            ({DEVICE_TYPES.find((dt) => selectedInventoryDevice.type.includes(dt.name))?.unit})
                          </span>
                        )}
                      </Label>
                      <Input
                        id="inventoryValue"
                        type="number"
                        step="0.1"
                        value={deviceValue}
                        onChange={(e) => setDeviceValue(e.target.value)}
                        placeholder="请输入检测数值"
                        required
                      />
                      {DEVICE_TYPES.find((dt) => selectedInventoryDevice.type.includes(dt.name))?.normalRange && (
                        <p className="text-xs text-gray-500">
                          正常范围:{" "}
                          {DEVICE_TYPES.find((dt) => selectedInventoryDevice.type.includes(dt.name))?.normalRange}{" "}
                          {DEVICE_TYPES.find((dt) => selectedInventoryDevice.type.includes(dt.name))?.unit}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inventoryNotes">备注</Label>
                      <Textarea
                        id="inventoryNotes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="添加备注信息（可选）"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={!selectedInventoryDevice || !deviceValue}>
                  添加设备
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <form onSubmit={handleSubmitCustomDevice} className="space-y-6">
              {/* 设备类型选择 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">选择设备类型</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DEVICE_TYPES.map((deviceType) => {
                    const IconComponent = deviceType.icon
                    const isSelected = customDeviceData.type === deviceType.name

                    return (
                      <div
                        key={deviceType.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => handleDeviceTypeSelect(deviceType)}
                      >
                        <div className="flex items-start space-x-3">
                          <IconComponent className={`h-6 w-6 ${deviceType.color} flex-shrink-0 mt-1`} />
                          <div className="flex-1">
                            <div className="font-medium">{deviceType.name}</div>
                            <div className="text-sm text-gray-500 mb-1">{deviceType.description}</div>
                            <div className="text-xs text-gray-400">
                              正常范围: {deviceType.normalRange} {deviceType.unit}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 设备信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">设备信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customName">设备名称 *</Label>
                    <Input
                      id="customName"
                      value={customDeviceData.name}
                      onChange={(e) => setCustomDeviceData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="请输入设备名称"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customType">设备类型 *</Label>
                    <Input
                      id="customType"
                      value={customDeviceData.type}
                      onChange={(e) => setCustomDeviceData((prev) => ({ ...prev, type: e.target.value }))}
                      placeholder="请输入设备类型"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customUnit">单位 *</Label>
                    <Input
                      id="customUnit"
                      value={customDeviceData.unit}
                      onChange={(e) => setCustomDeviceData((prev) => ({ ...prev, unit: e.target.value }))}
                      placeholder="请输入单位"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customRange">正常范围 *</Label>
                    <Input
                      id="customRange"
                      value={customDeviceData.normalRange}
                      onChange={(e) => setCustomDeviceData((prev) => ({ ...prev, normalRange: e.target.value }))}
                      placeholder="例如: 90-140"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 检测数值 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">设置初始数值</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customValue">
                      检测数值 *{" "}
                      {customDeviceData.unit && <span className="text-gray-500">({customDeviceData.unit})</span>}
                    </Label>
                    <Input
                      id="customValue"
                      type="number"
                      step="0.1"
                      value={deviceValue}
                      onChange={(e) => setDeviceValue(e.target.value)}
                      placeholder="请输入检测数值"
                      required
                    />
                    {customDeviceData.normalRange && (
                      <p className="text-xs text-gray-500">
                        正常范围: {customDeviceData.normalRange} {customDeviceData.unit}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customNotes">备注</Label>
                    <Textarea
                      id="customNotes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="添加备注信息（可选）"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={!customDeviceData.name || !customDeviceData.type || !deviceValue}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>添加设备</span>
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
