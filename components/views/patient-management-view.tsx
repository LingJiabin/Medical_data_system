"use client"

import { useState, useMemo } from "react"
import { AdminPanel } from "@/components/admin-panel"
import { PatientChart } from "@/components/patient-chart"
import { PatientDeviceManagement } from "@/components/patient-device-management"
import { PatientHistoryView } from "@/components/patient-history-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Users,
  UserPlus,
  Activity,
  Search,
  Filter,
  Calendar,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  History,
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

interface PatientManagementViewProps {
  patients: Patient[]
  onAddPatient: (patient: Patient) => void
  onUpdatePatient: (patientId: string, updatedPatient: Patient) => void
  onAddHistory: (patientId: string, record: Omit<PatientHistory, "id">) => void
}

function PatientManagementView({ patients, onAddPatient, onUpdatePatient, onAddHistory }: PatientManagementViewProps) {
  const [activeTab, setActiveTab] = useState("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ageFilter, setAgeFilter] = useState("all")
  const [genderFilter, setGenderFilter] = useState("all")
  const [deviceFilter, setDeviceFilter] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients.length > 0 ? patients[0] : null)

  // 高级搜索过滤
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // 文本搜索
      const matchesSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchTerm)) ||
        (patient.address && patient.address.toLowerCase().includes(searchTerm.toLowerCase()))

      // 状态过滤
      const matchesStatus = statusFilter === "all" || patient.status === statusFilter

      // 年龄过滤
      const matchesAge =
        ageFilter === "all" ||
        (ageFilter === "child" && patient.age < 18) ||
        (ageFilter === "adult" && patient.age >= 18 && patient.age < 60) ||
        (ageFilter === "senior" && patient.age >= 60)

      // 性别过滤
      const matchesGender = genderFilter === "all" || patient.gender === genderFilter

      // 设备过滤
      const matchesDevice =
        deviceFilter === "all" ||
        (deviceFilter === "none" && patient.devices.length === 0) ||
        (deviceFilter === "has" && patient.devices.length > 0) ||
        patient.devices.some((device) => device.type.includes(deviceFilter))

      return matchesSearch && matchesStatus && matchesAge && matchesGender && matchesDevice
    })
  }, [patients, searchTerm, statusFilter, ageFilter, genderFilter, deviceFilter])

  // 选择患者查看详情
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setActiveTab("detail")
  }

  // 获取设备类型列表
  const deviceTypes = useMemo(() => {
    const types = new Set<string>()
    patients.forEach((patient) => {
      patient.devices.forEach((device) => {
        types.add(device.type)
      })
    })
    return Array.from(types)
  }, [patients])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "正常":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "异常":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "待检查":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "正常":
        return "bg-green-100 text-green-800"
      case "异常":
        return "bg-red-100 text-red-800"
      case "待检查":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4 p-4 lg:p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4">
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">患者列表</span>
            <span className="sm:hidden">列表</span>
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">添加患者</span>
            <span className="sm:hidden">添加</span>
          </TabsTrigger>
          <TabsTrigger value="detail" className="flex items-center space-x-2" disabled={!selectedPatient}>
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">患者详情</span>
            <span className="sm:hidden">详情</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2" disabled={!selectedPatient}>
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">历史记录</span>
            <span className="sm:hidden">历史</span>
          </TabsTrigger>
        </TabsList>

        {/* 患者列表 */}
        <TabsContent value="list" className="flex-1 space-y-4">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <CardTitle>患者管理</CardTitle>
                  <CardDescription>查看和管理所有患者信息 ({filteredPatients.length} 个结果)</CardDescription>
                </div>
                <Button onClick={() => setActiveTab("add")} className="w-full lg:w-auto">
                  <UserPlus className="h-4 w-4 mr-2" />
                  添加患者
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              {/* 搜索和过滤器 */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="搜索患者姓名、ID、电话或地址..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">状态</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="正常">正常</SelectItem>
                        <SelectItem value="异常">异常</SelectItem>
                        <SelectItem value="待检查">待检查</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">年龄</Label>
                    <Select value={ageFilter} onValueChange={setAgeFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部年龄</SelectItem>
                        <SelectItem value="child">儿童 (&lt;18)</SelectItem>
                        <SelectItem value="adult">成人 (18-59)</SelectItem>
                        <SelectItem value="senior">老年 (≥60)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">性别</Label>
                    <Select value={genderFilter} onValueChange={setGenderFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部性别</SelectItem>
                        <SelectItem value="男">男</SelectItem>
                        <SelectItem value="女">女</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">设备</Label>
                    <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部设备</SelectItem>
                        <SelectItem value="none">无设备</SelectItem>
                        <SelectItem value="has">有设备</SelectItem>
                        {deviceTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">操作</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-full"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                        setAgeFilter("all")
                        setGenderFilter("all")
                        setDeviceFilter("all")
                      }}
                    >
                      <Filter className="h-3 w-3 mr-1" />
                      重置
                    </Button>
                  </div>
                </div>
              </div>

              {/* 患者列表 */}
              <div className="flex-1 overflow-auto">
                {filteredPatients.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleSelectPatient(patient)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="font-medium text-lg">{patient.name}</div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <div className="flex items-center space-x-2">
                                <span>{patient.id}</span>
                                <span>•</span>
                                <span>{patient.age}岁</span>
                                <span>•</span>
                                <span>{patient.gender}</span>
                              </div>
                              {patient.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{patient.phone}</span>
                                </div>
                              )}
                              {patient.address && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{patient.address}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(patient.status)}>
                            {getStatusIcon(patient.status)}
                            <span className="ml-1">{patient.status}</span>
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Activity className="h-3 w-3" />
                            <span>{patient.devices.length} 个设备</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>最后检查: {patient.lastCheckup}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-12 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">
                        {patients.length === 0 ? "暂无患者" : "未找到匹配的患者"}
                      </p>
                      <p className="text-sm">
                        {patients.length === 0 ? '点击"添加患者"按钮添加新患者' : "请调整搜索条件或添加新患者"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 添加患者 */}
        <TabsContent value="add" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>添加新患者</CardTitle>
              <CardDescription>填写患者信息并配置监测设备</CardDescription>\
            </CardHeader>
            <CardContent className="h-full overflow-auto">
              <AdminPanel
                onAddPatient={(patient) => {
                  onAddPatient(patient)
                  setSelectedPatient(patient)
                  setActiveTab("detail")
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 患者详情 */}
        <TabsContent value="detail" className="flex-1">
          {selectedPatient && (
            <div className="h-full flex flex-col space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-2 lg:space-y-0">
                    <div>
                      <CardTitle className="text-xl">{selectedPatient.name}</CardTitle>
                      <CardDescription className="space-y-1">
                        <div>
                          {selectedPatient.id} • {selectedPatient.age}岁 • {selectedPatient.gender}
                        </div>
                        {selectedPatient.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{selectedPatient.phone}</span>
                          </div>
                        )}
                        {selectedPatient.address && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{selectedPatient.address}</span>
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2">
                      <Badge className={getStatusColor(selectedPatient.status)}>
                        {getStatusIcon(selectedPatient.status)}
                        <span className="ml-1">{selectedPatient.status}</span>
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("history")}
                        className="w-full lg:w-auto"
                      >
                        <History className="h-4 w-4 mr-2" />
                        查看历史
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <PatientChart patient={selectedPatient} />
                </CardContent>
              </Card>

              <div className="flex-1">
                <PatientDeviceManagement
                  patients={[selectedPatient]}
                  onUpdatePatient={onUpdatePatient}
                  onAddHistory={onAddHistory}
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* 历史记录 */}
        <TabsContent value="history" className="flex-1">
          {selectedPatient && <PatientHistoryView patient={selectedPatient} onAddHistory={onAddHistory} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Use both export styles to ensure compatibility
export default PatientManagementView
export { PatientManagementView }
