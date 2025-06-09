"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Package,
  MapPin,
  User,
} from "lucide-react"
import { AddDeviceDialog } from "@/components/add-device-dialog"
import { MaintenanceRecordDialog } from "@/components/maintenance-record-dialog"
import { AssignDeviceDialog } from "@/components/assign-device-dialog"
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
  assignedPatient?: string
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
}

interface DeviceInventoryProps {
  patients?: Patient[]
  onAssignDeviceToPatient?: (deviceId: string, patientId: string, deviceData: PatientDevice) => void
}

export function DeviceInventory({ patients = [], onAssignDeviceToPatient }: DeviceInventoryProps) {
  const [devices, setDevices] = useState<Device[]>([])
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const { toast } = useToast()

  // 模拟设备数据
  useEffect(() => {
    const mockDevices: Device[] = [
      {
        id: "DEV001",
        name: "血压监测仪 A1",
        type: "血压监测",
        model: "BP-2000",
        serialNumber: "BP2000001",
        manufacturer: "欧姆龙",
        purchaseDate: "2023-01-15",
        warrantyExpiry: "2026-01-15",
        location: "内科诊室1",
        assignedTo: "张医生",
        status: "在用",
        lastMaintenance: "2024-01-01",
        nextMaintenance: "2024-04-01",
        usageCount: 1250,
        condition: "良好",
        assignedPatient: "P001",
        maintenanceHistory: [
          {
            id: "M001",
            date: "2024-01-01",
            type: "定期保养",
            description: "更换传感器，校准压力值",
            technician: "李技师",
            cost: 200,
            parts: ["压力传感器", "密封圈"],
            status: "已完成",
          },
        ],
      },
      {
        id: "DEV002",
        name: "心电图仪 ECG-Pro",
        type: "心电监测",
        model: "ECG-3000",
        serialNumber: "ECG3000002",
        manufacturer: "飞利浦",
        purchaseDate: "2022-08-20",
        warrantyExpiry: "2025-08-20",
        location: "心内科",
        assignedTo: "陈医生",
        status: "维护中",
        lastMaintenance: "2024-01-10",
        nextMaintenance: "2024-02-10",
        usageCount: 890,
        condition: "一般",
        maintenanceHistory: [
          {
            id: "M003",
            date: "2024-01-10",
            type: "校准检测",
            description: "心电信号校准和导联检查",
            technician: "赵技师",
            cost: 150,
            parts: [],
            status: "进行中",
          },
        ],
      },
      {
        id: "DEV003",
        name: "体温计 Digital-T",
        type: "体温监测",
        model: "DT-500",
        serialNumber: "DT500003",
        manufacturer: "泰尔茂",
        purchaseDate: "2023-06-10",
        warrantyExpiry: "2025-06-10",
        location: "急诊科",
        assignedTo: "刘护士",
        status: "在用",
        lastMaintenance: "2023-12-01",
        nextMaintenance: "2024-03-01",
        usageCount: 2100,
        condition: "优秀",
        assignedPatient: "P003",
        maintenanceHistory: [
          {
            id: "M004",
            date: "2023-12-01",
            type: "清洁消毒",
            description: "深度清洁和消毒处理",
            technician: "孙技师",
            cost: 50,
            parts: ["消毒液", "清洁布"],
            status: "已完成",
          },
        ],
      },
      {
        id: "DEV004",
        name: "血糖仪 Gluco-Check",
        type: "血糖监测",
        model: "GC-200",
        serialNumber: "GC200004",
        manufacturer: "强生",
        purchaseDate: "2023-03-15",
        warrantyExpiry: "2026-03-15",
        location: "内分泌科",
        assignedTo: "周医生",
        status: "在用",
        lastMaintenance: "2023-11-20",
        nextMaintenance: "2024-02-20",
        usageCount: 750,
        condition: "良好",
        assignedPatient: "P002",
        maintenanceHistory: [
          {
            id: "M005",
            date: "2024-01-15",
            type: "故障维修",
            description: "传感器校准完成",
            technician: "李技师",
            cost: 120,
            parts: ["校准器"],
            status: "已完成",
          },
        ],
      },
      {
        id: "DEV005",
        name: "血氧仪 Oxy-Monitor",
        type: "血氧监测",
        model: "OM-100",
        serialNumber: "OM100005",
        manufacturer: "迈瑞",
        purchaseDate: "2023-09-01",
        warrantyExpiry: "2026-09-01",
        location: "ICU",
        assignedTo: "马医生",
        status: "在用",
        lastMaintenance: "2023-12-15",
        nextMaintenance: "2024-03-15",
        usageCount: 1800,
        condition: "良好",
        assignedPatient: "P002",
        maintenanceHistory: [
          {
            id: "M006",
            date: "2023-12-15",
            type: "定期保养",
            description: "传感器清洁和校准",
            technician: "钱技师",
            cost: 100,
            parts: ["清洁套件"],
            status: "已完成",
          },
        ],
      },
      {
        id: "DEV006",
        name: "超声波仪 Ultra-S",
        type: "超声设备",
        model: "US-500",
        serialNumber: "US500006",
        manufacturer: "GE",
        purchaseDate: "2023-05-20",
        warrantyExpiry: "2026-05-20",
        location: "影像科",
        assignedTo: "未分配",
        status: "空闲",
        lastMaintenance: "2023-11-10",
        nextMaintenance: "2024-02-10",
        usageCount: 320,
        condition: "优秀",
        maintenanceHistory: [],
      },
      {
        id: "DEV007",
        name: "呼吸监测仪 Resp-Pro",
        type: "呼吸频率",
        model: "RP-300",
        serialNumber: "RP300007",
        manufacturer: "迈瑞",
        purchaseDate: "2023-07-10",
        warrantyExpiry: "2026-07-10",
        location: "ICU",
        assignedTo: "未分配",
        status: "空闲",
        lastMaintenance: "2023-12-01",
        nextMaintenance: "2024-03-01",
        usageCount: 450,
        condition: "优秀",
        maintenanceHistory: [],
      },
      {
        id: "DEV008",
        name: "胆固醇检测仪 Chol-Check",
        type: "胆固醇",
        model: "CC-150",
        serialNumber: "CC150008",
        manufacturer: "罗氏",
        purchaseDate: "2023-04-20",
        warrantyExpiry: "2026-04-20",
        location: "检验科",
        assignedTo: "未分配",
        status: "空闲",
        lastMaintenance: "2023-10-15",
        nextMaintenance: "2024-01-15",
        usageCount: 280,
        condition: "良好",
        maintenanceHistory: [],
      },
      {
        id: "DEV009",
        name: "智能体重秤 Weight-Smart",
        type: "体重监测",
        model: "WS-200",
        serialNumber: "WS200009",
        manufacturer: "小米",
        purchaseDate: "2023-08-15",
        warrantyExpiry: "2025-08-15",
        location: "体检中心",
        assignedTo: "未分配",
        status: "空闲",
        lastMaintenance: "2023-11-01",
        nextMaintenance: "2024-02-01",
        usageCount: 1200,
        condition: "优秀",
        maintenanceHistory: [],
      },
      {
        id: "DEV010",
        name: "BMI计算器 BMI-Calc",
        type: "BMI指数",
        model: "BMI-100",
        serialNumber: "BMI100010",
        manufacturer: "欧姆龙",
        purchaseDate: "2023-09-10",
        warrantyExpiry: "2026-09-10",
        location: "营养科",
        assignedTo: "未分配",
        status: "空闲",
        lastMaintenance: "2023-12-10",
        nextMaintenance: "2024-03-10",
        usageCount: 350,
        condition: "优秀",
        maintenanceHistory: [],
      },
      {
        id: "DEV011",
        name: "血压监测仪 B2",
        type: "血压监测",
        model: "BP-3000",
        serialNumber: "BP3000011",
        manufacturer: "欧姆龙",
        purchaseDate: "2023-10-05",
        warrantyExpiry: "2026-10-05",
        location: "内科诊室2",
        assignedTo: "王医生",
        status: "在用",
        lastMaintenance: "2024-01-05",
        nextMaintenance: "2024-04-05",
        usageCount: 680,
        condition: "优秀",
        assignedPatient: "P003",
        maintenanceHistory: [],
      },
      {
        id: "DEV012",
        name: "心电图仪 ECG-Basic",
        type: "心电监测",
        model: "ECG-1000",
        serialNumber: "ECG1000012",
        manufacturer: "飞利浦",
        purchaseDate: "2023-11-20",
        warrantyExpiry: "2026-11-20",
        location: "急诊科",
        assignedTo: "李医生",
        status: "在用",
        lastMaintenance: "2024-01-12",
        nextMaintenance: "2024-04-12",
        usageCount: 420,
        condition: "优秀",
        assignedPatient: "P004",
        maintenanceHistory: [],
      },
    ]
    setDevices(mockDevices)
    setFilteredDevices(mockDevices)
  }, [])

  // 搜索和过滤
  useEffect(() => {
    let filtered = devices.filter(
      (device) =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter((device) => device.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((device) => device.type === typeFilter)
    }

    setFilteredDevices(filtered)
  }, [searchTerm, statusFilter, typeFilter, devices])

  const handleAddDevice = (newDevice: Device) => {
    setDevices((prev) => [newDevice, ...prev])
    toast({
      title: "设备添加成功",
      description: `设备 ${newDevice.name} 已成功添加到库存`,
    })
  }

  const handleAddMaintenanceRecord = (deviceId: string, record: MaintenanceRecord) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId
          ? {
              ...device,
              maintenanceHistory: [record, ...device.maintenanceHistory],
              lastMaintenance: record.date,
              status: record.status === "进行中" ? "维护中" : device.status,
            }
          : device,
      ),
    )
    toast({
      title: "维护记录添加成功",
      description: "设备维护记录已更新",
    })
  }

  const handleAssignDevice = (deviceId: string, patientId: string, initialValue: number) => {
    // 查找设备和患者
    const device = devices.find((d) => d.id === deviceId)
    const patient = patients.find((p) => p.id === patientId)

    if (!device || !patient) {
      toast({
        title: "分配失败",
        description: "未找到设备或患者",
        variant: "destructive",
      })
      return
    }

    // 获取设备类型对应的单位和正常范围
    const typeMapping: Record<string, { unit: string; normalRange: string }> = {
      血压监测: { unit: "mmHg", normalRange: "90-140" },
      心电监测: { unit: "bpm", normalRange: "60-100" },
      体温监测: { unit: "°C", normalRange: "36.0-37.5" },
      血糖监测: { unit: "mmol/L", normalRange: "3.9-6.1" },
      血氧监测: { unit: "%", normalRange: "95-100" },
      呼吸频率: { unit: "次/分", normalRange: "12-20" },
      胆固醇: { unit: "mmol/L", normalRange: "3.0-5.2" },
      体重监测: { unit: "kg", normalRange: "50-80" },
      BMI指数: { unit: "", normalRange: "18.5-24.9" },
      超声设备: { unit: "MHz", normalRange: "1-10" },
      X光设备: { unit: "mA", normalRange: "10-100" },
      CT设备: { unit: "mGy", normalRange: "5-20" },
      MRI设备: { unit: "T", normalRange: "1.5-3.0" },
    }

    const mapping = typeMapping[device.type] || { unit: "", normalRange: "" }

    // 判断初始值是否在正常范围内
    let status: "正常" | "异常" | "警告" = "正常"
    if (mapping.normalRange) {
      const [min, max] = mapping.normalRange.split("-").map(Number)
      if (initialValue < min || initialValue > max) {
        status = initialValue < min * 0.8 || initialValue > max * 1.2 ? "异常" : "警告"
      }
    }

    // 创建患者设备数据
    const patientDevice: PatientDevice = {
      id: deviceId,
      name: device.name,
      type: device.type.replace("监测", ""),
      value: initialValue,
      unit: mapping.unit,
      normalRange: mapping.normalRange,
      status: status,
      timestamp: new Date().toLocaleString(),
    }

    // 更新设备状态
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId ? { ...d, status: "在用", assignedPatient: patientId, usageCount: d.usageCount + 1 } : d,
      ),
    )

    // 调用回调函数，将设备分配给患者
    if (onAssignDeviceToPatient) {
      onAssignDeviceToPatient(deviceId, patientId, patientDevice)
    }

    toast({
      title: "设备分配成功",
      description: `设备 ${device.name} 已成功分配给患者 ${patient.name}`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "在用":
        return "bg-green-100 text-green-800"
      case "空闲":
        return "bg-blue-100 text-blue-800"
      case "维护中":
        return "bg-yellow-100 text-yellow-800"
      case "故障":
        return "bg-red-100 text-red-800"
      case "报废":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "优秀":
        return "bg-green-100 text-green-800"
      case "良好":
        return "bg-blue-100 text-blue-800"
      case "一般":
        return "bg-yellow-100 text-yellow-800"
      case "需维修":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "在用":
        return <CheckCircle className="h-4 w-4" />
      case "空闲":
        return <Clock className="h-4 w-4" />
      case "维护中":
        return <Wrench className="h-4 w-4" />
      case "故障":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const deviceTypes = [...new Set(devices.map((d) => d.type))]
  const totalDevices = devices.length
  const activeDevices = devices.filter((d) => d.status === "在用").length
  const maintenanceDevices = devices.filter((d) => d.status === "维护中").length
  const faultyDevices = devices.filter((d) => d.status === "故障").length

  // 查找设备分配的患者名称
  const getAssignedPatientName = (patientId?: string) => {
    if (!patientId) return "未分配"
    const patient = patients.find((p) => p.id === patientId)
    return patient ? patient.name : "未知患者"
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">设备总数</p>
                <p className="text-3xl font-bold text-gray-900">{totalDevices}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">使用中</p>
                <p className="text-3xl font-bold text-green-600">{activeDevices}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">维护中</p>
                <p className="text-3xl font-bold text-yellow-600">{maintenanceDevices}</p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">故障设备</p>
                <p className="text-3xl font-bold text-red-600">{faultyDevices}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 设备列表 */}
        <div className="lg:col-span-2">
          <Card className="animate-in fade-in-0 slide-in-from-left-4 duration-500">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>设备库存管理</CardTitle>
                  <CardDescription>管理所有医疗设备的库存和状态</CardDescription>
                </div>
                <AddDeviceDialog onAddDevice={handleAddDevice} />
              </div>
            </CardHeader>
            <CardContent>
              {/* 搜索和过滤 */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索设备名称、ID或序列号..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="在用">在用</SelectItem>
                    <SelectItem value="空闲">空闲</SelectItem>
                    <SelectItem value="维护中">维护中</SelectItem>
                    <SelectItem value="故障">故障</SelectItem>
                    <SelectItem value="报废">报废</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    {deviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 设备表格 */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>设备信息</TableHead>
                      <TableHead>位置/负责人</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>使用次数</TableHead>
                      <TableHead>分配患者</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDevices.map((device, index) => (
                      <TableRow
                        key={device.id}
                        className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{device.name}</div>
                            <div className="text-sm text-gray-500">
                              {device.id} • {device.model}
                            </div>
                            <div className="text-xs text-gray-400">{device.serialNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{device.location}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-500">
                              <User className="h-3 w-3" />
                              <span>{device.assignedTo}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getStatusColor(device.status)}>
                              {getStatusIcon(device.status)}
                              <span className="ml-1">{device.status}</span>
                            </Badge>
                            <Badge variant="outline" className={getConditionColor(device.condition)}>
                              {device.condition}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">{device.usageCount}</div>
                            <div className="text-xs text-gray-500">次</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {device.assignedPatient ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-800">
                              {getAssignedPatientName(device.assignedPatient)}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-500">未分配</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedDevice(device)}>
                              详情
                            </Button>
                            <MaintenanceRecordDialog
                              device={device}
                              onAddRecord={(record) => handleAddMaintenanceRecord(device.id, record)}
                            />
                            {onAssignDeviceToPatient && (
                              <AssignDeviceDialog
                                device={device}
                                patients={patients}
                                onAssignDevice={handleAssignDevice}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 设备详情 */}
        <div className="lg:col-span-1">
          <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-500">
            <CardHeader>
              <CardTitle>设备详情</CardTitle>
              <CardDescription>
                {selectedDevice ? `${selectedDevice.name} 的详细信息` : "选择设备查看详细信息"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDevice ? (
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="info">基本信息</TabsTrigger>
                    <TabsTrigger value="maintenance">维护记录</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">设备信息</h4>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="text-gray-600">设备ID:</span> {selectedDevice.id}
                          </p>
                          <p>
                            <span className="text-gray-600">型号:</span> {selectedDevice.model}
                          </p>
                          <p>
                            <span className="text-gray-600">序列号:</span> {selectedDevice.serialNumber}
                          </p>
                          <p>
                            <span className="text-gray-600">制造商:</span> {selectedDevice.manufacturer}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-2">使用信息</h4>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="text-gray-600">位置:</span> {selectedDevice.location}
                          </p>
                          <p>
                            <span className="text-gray-600">负责人:</span> {selectedDevice.assignedTo}
                          </p>
                          <p>
                            <span className="text-gray-600">使用次数:</span> {selectedDevice.usageCount} 次
                          </p>
                          <p>
                            <span className="text-gray-600">设备状态:</span>
                            <Badge className={`ml-2 ${getStatusColor(selectedDevice.status)}`}>
                              {selectedDevice.status}
                            </Badge>
                          </p>
                          <p>
                            <span className="text-gray-600">分配患者:</span>{" "}
                            {selectedDevice.assignedPatient ? (
                              <Badge className="ml-2 bg-blue-50 text-blue-800">
                                {getAssignedPatientName(selectedDevice.assignedPatient)}
                              </Badge>
                            ) : (
                              "未分配"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium mb-2">保修信息</h4>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="text-gray-600">购买日期:</span> {selectedDevice.purchaseDate}
                          </p>
                          <p>
                            <span className="text-gray-600">保修到期:</span> {selectedDevice.warrantyExpiry}
                          </p>
                          <p>
                            <span className="text-gray-600">上次维护:</span> {selectedDevice.lastMaintenance}
                          </p>
                          <p>
                            <span className="text-gray-600">下次维护:</span> {selectedDevice.nextMaintenance}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="maintenance" className="space-y-4">
                    <div className="space-y-3">
                      {selectedDevice.maintenanceHistory.length > 0 ? (
                        selectedDevice.maintenanceHistory.map((record) => (
                          <div key={record.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium text-sm">{record.type}</div>
                              <Badge
                                className={
                                  record.status === "已完成"
                                    ? "bg-green-100 text-green-800"
                                    : record.status === "进行中"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-blue-100 text-blue-800"
                                }
                              >
                                {record.status}
                              </Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <p>
                                <span className="text-gray-600">日期:</span> {record.date}
                              </p>
                              <p>
                                <span className="text-gray-600">技师:</span> {record.technician}
                              </p>
                              <p>
                                <span className="text-gray-600">描述:</span> {record.description}
                              </p>
                              <p>
                                <span className="text-gray-600">费用:</span> ¥{record.cost}
                              </p>
                              {record.parts.length > 0 && (
                                <p>
                                  <span className="text-gray-600">更换部件:</span> {record.parts.join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>暂无维护记录</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>请从左侧列表选择设备</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
