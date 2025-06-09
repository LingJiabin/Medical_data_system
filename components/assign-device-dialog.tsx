"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { LinkIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
}

interface AssignDeviceDialogProps {
  device?: InventoryDevice
  patients: Patient[]
  onAssignDevice: (deviceId: string, patientId: string, initialValue: number) => void
  trigger?: React.ReactNode
}

// 设备类型对应的单位和正常范围
const DEVICE_TYPE_MAPPINGS: Record<string, { unit: string; normalRange: string }> = {
  血压监测: { unit: "mmHg", normalRange: "90-140" },
  心电监测: { unit: "bpm", normalRange: "60-100" },
  体温监测: { unit: "°C", normalRange: "36.0-37.5" },
  血糖监测: { unit: "mmol/L", normalRange: "3.9-6.1" },
  血氧监测: { unit: "%", normalRange: "95-100" },
  超声设备: { unit: "MHz", normalRange: "1-10" },
  X光设备: { unit: "mA", normalRange: "10-100" },
  CT设备: { unit: "mGy", normalRange: "5-20" },
  MRI设备: { unit: "T", normalRange: "1.5-3.0" },
}

export function AssignDeviceDialog({ device, patients, onAssignDevice, trigger }: AssignDeviceDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [initialValue, setInitialValue] = useState("")
  const { toast } = useToast()

  // 当设备变更时，重置表单
  useEffect(() => {
    if (device) {
      setSelectedPatientId("")
      // 设置默认初始值
      const mapping = DEVICE_TYPE_MAPPINGS[device.type]
      if (mapping) {
        const range = mapping.normalRange.split("-").map(Number)
        const defaultValue = ((range[0] + range[1]) / 2).toFixed(1)
        setInitialValue(defaultValue)
      } else {
        setInitialValue("")
      }
    }
  }, [device])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!device) {
      toast({
        title: "错误",
        description: "未选择设备",
        variant: "destructive",
      })
      return
    }

    if (!selectedPatientId) {
      toast({
        title: "错误",
        description: "请选择患者",
        variant: "destructive",
      })
      return
    }

    if (!initialValue) {
      toast({
        title: "错误",
        description: "请输入初始值",
        variant: "destructive",
      })
      return
    }

    onAssignDevice(device.id, selectedPatientId, Number(initialValue))
    setIsOpen(false)
  }

  const getDeviceTypeInfo = (type: string) => {
    return DEVICE_TYPE_MAPPINGS[type] || { unit: "", normalRange: "" }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
            disabled={!device || device.status !== "空闲"}
          >
            <LinkIcon className="h-3 w-3" />
            <span>分配</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <LinkIcon className="h-5 w-5" />
            <span>分配设备给患者</span>
          </DialogTitle>
          <DialogDescription>{device ? `将设备 ${device.name} 分配给患者使用` : "请先选择一个设备"}</DialogDescription>
        </DialogHeader>

        {device && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 设备信息 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">设备信息</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">设备名称:</span> {device.name}
                </div>
                <div>
                  <span className="text-gray-600">设备ID:</span> {device.id}
                </div>
                <div>
                  <span className="text-gray-600">型号:</span> {device.model}
                </div>
                <div>
                  <span className="text-gray-600">类型:</span> {device.type}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">状态:</span>{" "}
                  <Badge
                    className={device.status === "空闲" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {device.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 患者选择 */}
            <div className="space-y-2">
              <Label htmlFor="patient">选择患者 *</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择患者" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} ({patient.id}) - {patient.age}岁 {patient.gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 初始值设置 */}
            <div className="space-y-2">
              <Label htmlFor="initialValue">初始值 ({getDeviceTypeInfo(device.type).unit}) *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="initialValue"
                  type="number"
                  step="0.1"
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                  placeholder={`请输入初始${device.type}值`}
                  required
                />
                <span className="text-sm text-gray-500">{getDeviceTypeInfo(device.type).unit}</span>
              </div>
              <p className="text-xs text-gray-500">
                正常范围: {getDeviceTypeInfo(device.type).normalRange} {getDeviceTypeInfo(device.type).unit}
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                取消
              </Button>
              <Button type="submit" className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4" />
                <span>分配设备</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
