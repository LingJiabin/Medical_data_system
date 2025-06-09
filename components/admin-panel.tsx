"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, UserPlus, Settings, Activity, Heart, Thermometer, Zap, Droplets } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

interface PatientHistory {
  timestamp: string
  status: "正常" | "异常" | "待检查"
  devices: Device[]
}

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  devices: Device[]
  lastCheckup: string
  status: "正常" | "异常" | "待检查"
  history: PatientHistory[]
  createdAt: string
  phone?: string
  address?: string
  emergencyContact?: string
}

interface AdminPanelProps {
  onAddPatient: (patient: Patient) => void
}

// 可选择的医疗设备列表
const AVAILABLE_DEVICES = [
  {
    id: "blood_pressure",
    name: "血压监测仪",
    type: "血压",
    unit: "mmHg",
    normalRange: "90-140",
    icon: Heart,
    color: "text-red-500",
  },
  {
    id: "ecg",
    name: "心电图仪",
    type: "心电",
    unit: "bpm",
    normalRange: "60-100",
    icon: Activity,
    color: "text-blue-500",
  },
  {
    id: "thermometer",
    name: "体温计",
    type: "体温",
    unit: "°C",
    normalRange: "36.0-37.5",
    icon: Thermometer,
    color: "text-orange-500",
  },
  {
    id: "blood_glucose",
    name: "血糖仪",
    type: "血糖",
    unit: "mmol/L",
    normalRange: "3.9-6.1",
    icon: Droplets,
    color: "text-purple-500",
  },
  {
    id: "pulse_oximeter",
    name: "血氧仪",
    type: "血氧",
    unit: "%",
    normalRange: "95-100",
    icon: Zap,
    color: "text-green-500",
  },
]

export function AdminPanel({ onAddPatient }: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    emergencyContact: "",
  })
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [deviceValues, setDeviceValues] = useState<{ [key: string]: string }>({})
  const { toast } = useToast()

  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDevices((prev) => (prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]))
  }

  const handleDeviceValueChange = (deviceId: string, value: string) => {
    setDeviceValues((prev) => ({
      ...prev,
      [deviceId]: value,
    }))
  }

  const generatePatientId = () => {
    return `P${String(Date.now()).slice(-6)}`
  }

  const getDeviceStatus = (value: number, normalRange: string) => {
    const [min, max] = normalRange.split("-").map(Number)
    if (value < min || value > max) {
      return value < min * 0.8 || value > max * 1.2 ? "异常" : "警告"
    }
    return "正常"
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.age || !formData.gender) {
      toast({
        title: "表单错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    if (selectedDevices.length === 0) {
      toast({
        title: "设备错误",
        description: "请至少选择一个医疗设备",
        variant: "destructive",
      })
      return
    }

    // 检查所选设备是否都有数值
    const missingValues = selectedDevices.filter((deviceId) => !deviceValues[deviceId])
    if (missingValues.length > 0) {
      toast({
        title: "数值错误",
        description: "请为所有选中的设备输入检测数值",
        variant: "destructive",
      })
      return
    }

    const devices: Device[] = selectedDevices.map((deviceId) => {
      const deviceTemplate = AVAILABLE_DEVICES.find((d) => d.id === deviceId)!
      const value = Number.parseFloat(deviceValues[deviceId])
      const status = getDeviceStatus(value, deviceTemplate.normalRange)

      return {
        id: `${deviceId}_${Date.now()}`,
        name: deviceTemplate.name,
        type: deviceTemplate.type,
        value,
        unit: deviceTemplate.unit,
        normalRange: deviceTemplate.normalRange,
        status,
        timestamp: new Date().toLocaleString(),
      }
    })

    const patientStatus = devices.some((d) => d.status === "异常")
      ? "异常"
      : devices.some((d) => d.status === "警告")
        ? "待检查"
        : "正常"

    const newPatient: Patient = {
      id: generatePatientId(),
      name: formData.name,
      age: Number.parseInt(formData.age),
      gender: formData.gender,
      devices,
      lastCheckup: new Date().toLocaleDateString(),
      status: patientStatus,
      history: [],
      createdAt: new Date().toLocaleString(),
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      emergencyContact: formData.emergencyContact || undefined,
    }

    onAddPatient(newPatient)

    // 重置表单
    setFormData({
      name: "",
      age: "",
      gender: "",
      phone: "",
      address: "",
      emergencyContact: "",
    })
    setSelectedDevices([])
    setDeviceValues({})
    setIsOpen(false)

    toast({
      title: "添加成功",
      description: `患者 ${newPatient.name} 已成功添加到系统`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <UserPlus className="h-4 w-4" />
          <span>添加患者</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>添加新患者</span>
          </DialogTitle>
          <DialogDescription>填写患者基本信息并选择需要监测的医疗设备</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">患者姓名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入患者姓名"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">年龄 *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                  placeholder="请输入年龄"
                  min="1"
                  max="120"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">性别 *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男</SelectItem>
                    <SelectItem value="女">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">联系电话</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="请输入联系电话"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">地址</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="请输入地址"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emergencyContact">紧急联系人</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="请输入紧急联系人信息"
                />
              </div>
            </CardContent>
          </Card>

          {/* 设备选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">医疗设备选择</CardTitle>
              <CardDescription>选择需要为患者配置的医疗设备并输入检测数值</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_DEVICES.map((device) => {
                  const IconComponent = device.icon
                  const isSelected = selectedDevices.includes(device.id)

                  return (
                    <div
                      key={device.id}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={device.id}
                          checked={isSelected}
                          onCheckedChange={() => handleDeviceToggle(device.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-2">
                            <IconComponent className={`h-5 w-5 ${device.color}`} />
                            <Label htmlFor={device.id} className="font-medium cursor-pointer">
                              {device.name}
                            </Label>
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            <p>类型: {device.type}</p>
                            <p>单位: {device.unit}</p>
                            <Badge variant="outline" className="text-xs">
                              正常范围: {device.normalRange}
                            </Badge>
                          </div>

                          {isSelected && (
                            <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                              <Label htmlFor={`value-${device.id}`} className="text-sm">
                                检测数值 *
                              </Label>
                              <Input
                                id={`value-${device.id}`}
                                type="number"
                                step="0.1"
                                value={deviceValues[device.id] || ""}
                                onChange={(e) => handleDeviceValueChange(device.id, e.target.value)}
                                placeholder={`请输入${device.type}数值`}
                                className="w-full"
                                required
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedDevices.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">已选择 {selectedDevices.length} 个设备</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedDevices.map((deviceId) => {
                      const device = AVAILABLE_DEVICES.find((d) => d.id === deviceId)
                      return (
                        <Badge key={deviceId} variant="secondary">
                          {device?.name}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              取消
            </Button>
            <Button type="submit" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>添加患者</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
