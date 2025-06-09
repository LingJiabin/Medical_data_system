"use client"

import type React from "react"

import { useState } from "react"
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
import { Plus, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Device {
  id: string
  name: string
  type: string
  model: string
  serialNumber: string
  manufacturer: string
  purchaseDate: string
  warrantyExpiry: string
  location: string
  assignedTo: string
  status: "在用" | "空闲" | "维护中" | "故障" | "报废"
  lastMaintenance: string
  nextMaintenance: string
  maintenanceHistory: MaintenanceRecord[]
  usageCount: number
  condition: "优秀" | "良好" | "一般" | "需维修"
}

interface MaintenanceRecord {
  id: string
  date: string
  type: "定期保养" | "故障维修" | "校准检测" | "清洁消毒"
  description: string
  technician: string
  cost: number
  parts: string[]
  status: "已完成" | "进行中" | "计划中"
}

interface AddDeviceDialogProps {
  onAddDevice: (device: Device) => void
}

const DEVICE_TYPES = [
  "血压监测",
  "心电监测",
  "体温监测",
  "血糖监测",
  "血氧监测",
  "超声设备",
  "X光设备",
  "CT设备",
  "MRI设备",
  "其他",
]

const MANUFACTURERS = ["欧姆龙", "飞利浦", "泰尔茂", "强生", "迈瑞", "GE", "西门子", "东芝", "其他"]

const LOCATIONS = [
  "内科诊室1",
  "内科诊室2",
  "外科诊室1",
  "外科诊室2",
  "心内科",
  "内分泌科",
  "急诊科",
  "ICU",
  "手术室1",
  "手术室2",
  "检验科",
  "影像科",
  "设备库房",
]

export function AddDeviceDialog({ onAddDevice }: AddDeviceDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    model: "",
    serialNumber: "",
    manufacturer: "",
    purchaseDate: "",
    warrantyExpiry: "",
    location: "",
    assignedTo: "",
    status: "空闲" as const,
    condition: "优秀" as const,
  })
  const { toast } = useToast()

  const generateDeviceId = () => {
    return `DEV${String(Date.now()).slice(-6)}`
  }

  const calculateNextMaintenance = (purchaseDate: string) => {
    const purchase = new Date(purchaseDate)
    const nextMaintenance = new Date(purchase)
    nextMaintenance.setMonth(nextMaintenance.getMonth() + 3) // 3个月后维护
    return nextMaintenance.toISOString().split("T")[0]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name ||
      !formData.type ||
      !formData.model ||
      !formData.serialNumber ||
      !formData.manufacturer ||
      !formData.purchaseDate ||
      !formData.location
    ) {
      toast({
        title: "表单错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    const newDevice: Device = {
      id: generateDeviceId(),
      name: formData.name,
      type: formData.type,
      model: formData.model,
      serialNumber: formData.serialNumber,
      manufacturer: formData.manufacturer,
      purchaseDate: formData.purchaseDate,
      warrantyExpiry: formData.warrantyExpiry || calculateNextMaintenance(formData.purchaseDate),
      location: formData.location,
      assignedTo: formData.assignedTo || "未分配",
      status: formData.status,
      lastMaintenance: formData.purchaseDate,
      nextMaintenance: calculateNextMaintenance(formData.purchaseDate),
      usageCount: 0,
      condition: formData.condition,
      maintenanceHistory: [],
    }

    onAddDevice(newDevice)

    // 重置表单
    setFormData({
      name: "",
      type: "",
      model: "",
      serialNumber: "",
      manufacturer: "",
      purchaseDate: "",
      warrantyExpiry: "",
      location: "",
      assignedTo: "",
      status: "空闲",
      condition: "优秀",
    })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>添加设备</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>添加新设备</span>
          </DialogTitle>
          <DialogDescription>填写设备的详细信息以添加到库存管理系统</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">设备名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入设备名称"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">设备类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择设备类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">设备型号 *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                  placeholder="请输入设备型号"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">序列号 *</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, serialNumber: e.target.value }))}
                  placeholder="请输入设备序列号"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">制造商 *</Label>
                <Select
                  value={formData.manufacturer}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, manufacturer: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择制造商" />
                  </SelectTrigger>
                  <SelectContent>
                    {MANUFACTURERS.map((manufacturer) => (
                      <SelectItem key={manufacturer} value={manufacturer}>
                        {manufacturer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 采购信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">采购信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">采购日期 *</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, purchaseDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyExpiry">保修到期日期</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => setFormData((prev) => ({ ...prev, warrantyExpiry: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* 使用信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">使用信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">设备位置 *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择设备位置" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">负责人</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="请输入负责人姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">设备状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "在用" | "空闲" | "维护中" | "故障" | "报废") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="空闲">空闲</SelectItem>
                    <SelectItem value="在用">在用</SelectItem>
                    <SelectItem value="维护中">维护中</SelectItem>
                    <SelectItem value="故障">故障</SelectItem>
                    <SelectItem value="报废">报废</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">设备状况</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value: "优秀" | "良好" | "一般" | "需维修") =>
                    setFormData((prev) => ({ ...prev, condition: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="优秀">优秀</SelectItem>
                    <SelectItem value="良好">良好</SelectItem>
                    <SelectItem value="一般">一般</SelectItem>
                    <SelectItem value="需维修">需维修</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              取消
            </Button>
            <Button type="submit" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>添加设备</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
