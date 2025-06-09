"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Wrench, Plus, X } from "lucide-react"
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

interface MaintenanceRecordDialogProps {
  device: Device
  onAddRecord: (record: MaintenanceRecord) => void
}

const MAINTENANCE_TYPES = ["定期保养", "故障维修", "校准检测", "清洁消毒"]

const COMMON_PARTS = [
  "压力传感器",
  "密封圈",
  "LCD显示屏",
  "电路板",
  "电池",
  "导线",
  "探头",
  "滤网",
  "清洁套件",
  "校准器",
  "消毒液",
  "清洁布",
]

const TECHNICIANS = ["李技师", "王技师", "赵技师", "孙技师", "钱技师", "周技师"]

export function MaintenanceRecordDialog({ device, onAddRecord }: MaintenanceRecordDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "" as MaintenanceRecord["type"],
    description: "",
    technician: "",
    cost: "",
    status: "计划中" as MaintenanceRecord["status"],
  })
  const [selectedParts, setSelectedParts] = useState<string[]>([])
  const [customPart, setCustomPart] = useState("")
  const { toast } = useToast()

  const generateRecordId = () => {
    return `M${String(Date.now()).slice(-6)}`
  }

  const handleAddPart = (part: string) => {
    if (part && !selectedParts.includes(part)) {
      setSelectedParts((prev) => [...prev, part])
    }
  }

  const handleRemovePart = (part: string) => {
    setSelectedParts((prev) => prev.filter((p) => p !== part))
  }

  const handleAddCustomPart = () => {
    if (customPart.trim() && !selectedParts.includes(customPart.trim())) {
      setSelectedParts((prev) => [...prev, customPart.trim()])
      setCustomPart("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.type || !formData.description || !formData.technician) {
      toast({
        title: "表单错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    const newRecord: MaintenanceRecord = {
      id: generateRecordId(),
      date: formData.date,
      type: formData.type,
      description: formData.description,
      technician: formData.technician,
      cost: Number.parseFloat(formData.cost) || 0,
      parts: selectedParts,
      status: formData.status,
    }

    onAddRecord(newRecord)

    // 重置表单
    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "" as MaintenanceRecord["type"],
      description: "",
      technician: "",
      cost: "",
      status: "计划中",
    })
    setSelectedParts([])
    setCustomPart("")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-1">
          <Wrench className="h-3 w-3" />
          <span>维护</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5" />
            <span>添加维护记录</span>
          </DialogTitle>
          <DialogDescription>
            为设备 {device.name} ({device.id}) 添加维护记录
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 设备信息 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">设备信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
                <span className="text-gray-600">位置:</span> {device.location}
              </div>
            </div>
          </div>

          {/* 维护信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">维护信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">维护日期 *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">维护类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: MaintenanceRecord["type"]) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择维护类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAINTENANCE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="technician">维护技师 *</Label>
                <Select
                  value={formData.technician}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, technician: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择维护技师" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECHNICIANS.map((technician) => (
                      <SelectItem key={technician} value={technician}>
                        {technician}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">维护费用 (元)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cost: e.target.value }))}
                  placeholder="请输入维护费用"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="status">维护状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: MaintenanceRecord["status"]) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="计划中">计划中</SelectItem>
                    <SelectItem value="进行中">进行中</SelectItem>
                    <SelectItem value="已完成">已完成</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 维护描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">维护描述 *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="请详细描述维护内容和发现的问题..."
              rows={4}
              required
            />
          </div>

          {/* 更换部件 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">更换部件</h3>

            {/* 常用部件选择 */}
            <div className="space-y-2">
              <Label>常用部件</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_PARTS.map((part) => (
                  <Button
                    key={part}
                    type="button"
                    variant={selectedParts.includes(part) ? "default" : "outline"}
                    size="sm"
                    onClick={() => (selectedParts.includes(part) ? handleRemovePart(part) : handleAddPart(part))}
                  >
                    {part}
                  </Button>
                ))}
              </div>
            </div>

            {/* 自定义部件 */}
            <div className="space-y-2">
              <Label htmlFor="customPart">自定义部件</Label>
              <div className="flex space-x-2">
                <Input
                  id="customPart"
                  value={customPart}
                  onChange={(e) => setCustomPart(e.target.value)}
                  placeholder="输入其他部件名称"
                />
                <Button type="button" onClick={handleAddCustomPart} disabled={!customPart.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 已选择的部件 */}
            {selectedParts.length > 0 && (
              <div className="space-y-2">
                <Label>已选择的部件</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedParts.map((part) => (
                    <Badge key={part} variant="secondary" className="flex items-center space-x-1">
                      <span>{part}</span>
                      <button type="button" onClick={() => handleRemovePart(part)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              取消
            </Button>
            <Button type="submit" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>添加记录</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
