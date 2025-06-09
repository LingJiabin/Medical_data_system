"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { DashboardOverview } from "@/components/views/dashboard-overview"
import PatientManagementView from "@/components/views/patient-management-view"
import { DeviceInventoryView } from "@/components/views/device-inventory-view"
import { DemoView } from "@/components/views/demo-view"
import { PlaceholderView } from "@/components/views/placeholder-view"

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

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [patients, setPatients] = useState<Patient[]>([
    // 演示患者数据
    {
      id: "P001",
      name: "张三",
      age: 45,
      gender: "男",
      phone: "138****1234",
      address: "北京市朝阳区建国路88号",
      emergencyContact: "李四 139****5678",
      devices: [
        {
          id: "D001",
          name: "血压监测仪",
          type: "血压",
          value: 135,
          unit: "mmHg",
          normalRange: "90-140",
          status: "警告",
          timestamp: "2024-01-15 14:30:00",
        },
        {
          id: "D002",
          name: "心电图仪",
          type: "心电",
          value: 78,
          unit: "bpm",
          normalRange: "60-100",
          status: "正常",
          timestamp: "2024-01-15 14:25:00",
        },
        {
          id: "D003",
          name: "体温计",
          type: "体温",
          value: 37.2,
          unit: "°C",
          normalRange: "36.0-37.5",
          status: "正常",
          timestamp: "2024-01-15 14:20:00",
        },
      ],
      lastCheckup: "2024-01-15",
      status: "待检查",
      createdAt: "2024-01-10 09:00:00",
      history: [
        {
          id: "H001",
          date: "2024-01-15 14:30:00",
          type: "数值更新",
          description: "血压监测数值更新：从 128 到 135 mmHg",
          deviceId: "D001",
          oldValue: 128,
          newValue: 135,
          operator: "张医生",
        },
        {
          id: "H002",
          date: "2024-01-15 09:00:00",
          type: "设备添加",
          description: "添加血压监测仪设备",
          deviceId: "D001",
          operator: "管理员",
        },
        {
          id: "H003",
          date: "2024-01-10 09:00:00",
          type: "检查",
          description: "患者张三已添加到系统",
          operator: "管理员",
        },
      ],
    },
    {
      id: "P002",
      name: "李美丽",
      age: 32,
      gender: "女",
      phone: "139****2345",
      address: "上海市浦东新区陆家嘴金融区",
      emergencyContact: "王五 138****9012",
      devices: [
        {
          id: "D004",
          name: "血糖仪",
          type: "血糖",
          value: 7.8,
          unit: "mmol/L",
          normalRange: "3.9-6.1",
          status: "异常",
          timestamp: "2024-01-15 16:45:00",
        },
        {
          id: "D005",
          name: "血氧仪",
          type: "血氧",
          value: 97,
          unit: "%",
          normalRange: "95-100",
          status: "正常",
          timestamp: "2024-01-15 16:40:00",
        },
      ],
      lastCheckup: "2024-01-15",
      status: "异常",
      createdAt: "2024-01-12 10:30:00",
      history: [
        {
          id: "H004",
          date: "2024-01-15 16:45:00",
          type: "状态变更",
          description: "患者状态从正常变更为异常",
          operator: "系统",
        },
        {
          id: "H005",
          date: "2024-01-15 16:45:00",
          type: "数值更新",
          description: "血糖监测数值更新：从 5.8 到 7.8 mmol/L",
          deviceId: "D004",
          oldValue: 5.8,
          newValue: 7.8,
          operator: "李医生",
        },
        {
          id: "H006",
          date: "2024-01-12 10:30:00",
          type: "检查",
          description: "患者李美丽已添加到系统",
          operator: "管理员",
        },
      ],
    },
    {
      id: "P003",
      name: "王老五",
      age: 68,
      gender: "男",
      phone: "137****3456",
      address: "广州市天河区珠江新城",
      emergencyContact: "王小明 136****7890",
      devices: [
        {
          id: "D006",
          name: "血压监测仪",
          type: "血压",
          value: 165,
          unit: "mmHg",
          normalRange: "90-140",
          status: "异常",
          timestamp: "2024-01-15 11:20:00",
        },
        {
          id: "D007",
          name: "心电图仪",
          type: "心电",
          value: 95,
          unit: "bpm",
          normalRange: "60-100",
          status: "正常",
          timestamp: "2024-01-15 11:15:00",
        },
        {
          id: "D008",
          name: "体温计",
          type: "体温",
          value: 36.8,
          unit: "°C",
          normalRange: "36.0-37.5",
          status: "正常",
          timestamp: "2024-01-15 11:10:00",
        },
        {
          id: "D009",
          name: "血氧仪",
          type: "血氧",
          value: 94,
          unit: "%",
          normalRange: "95-100",
          status: "警告",
          timestamp: "2024-01-15 11:05:00",
        },
      ],
      lastCheckup: "2024-01-15",
      status: "异常",
      createdAt: "2024-01-08 15:20:00",
      history: [
        {
          id: "H007",
          date: "2024-01-15 11:20:00",
          type: "数值更新",
          description: "血压监测数值更新：从 158 到 165 mmHg",
          deviceId: "D006",
          oldValue: 158,
          newValue: 165,
          operator: "赵医生",
        },
        {
          id: "H008",
          date: "2024-01-14 09:30:00",
          type: "设备添加",
          description: "添加血氧仪设备",
          deviceId: "D009",
          operator: "管理员",
        },
        {
          id: "H009",
          date: "2024-01-08 15:20:00",
          type: "检查",
          description: "患者王老五已添加到系统",
          operator: "管理员",
        },
      ],
    },
    {
      id: "P004",
      name: "陈小花",
      age: 28,
      gender: "女",
      phone: "135****4567",
      address: "深圳市南山区科技园",
      devices: [
        {
          id: "D010",
          name: "体温计",
          type: "体温",
          value: 36.5,
          unit: "°C",
          normalRange: "36.0-37.5",
          status: "正常",
          timestamp: "2024-01-15 13:30:00",
        },
        {
          id: "D011",
          name: "心电图仪",
          type: "心电",
          value: 72,
          unit: "bpm",
          normalRange: "60-100",
          status: "正常",
          timestamp: "2024-01-15 13:25:00",
        },
      ],
      lastCheckup: "2024-01-15",
      status: "正常",
      createdAt: "2024-01-14 11:45:00",
      history: [
        {
          id: "H010",
          date: "2024-01-15 13:30:00",
          type: "数值更新",
          description: "体温监测数值更新：从 36.3 到 36.5 °C",
          deviceId: "D010",
          oldValue: 36.3,
          newValue: 36.5,
          operator: "护士小王",
        },
        {
          id: "H011",
          date: "2024-01-14 11:45:00",
          type: "检查",
          description: "患者陈小花已添加到系统",
          operator: "管理员",
        },
      ],
    },
    {
      id: "P005",
      name: "刘大强",
      age: 55,
      gender: "男",
      phone: "133****5678",
      address: "成都市锦江区春熙路",
      emergencyContact: "刘小红 132****3456",
      devices: [
        {
          id: "D012",
          name: "血压监测仪",
          type: "血压",
          value: 118,
          unit: "mmHg",
          normalRange: "90-140",
          status: "正常",
          timestamp: "2024-01-15 15:10:00",
        },
        {
          id: "D013",
          name: "血糖仪",
          type: "血糖",
          value: 5.2,
          unit: "mmol/L",
          normalRange: "3.9-6.1",
          status: "正常",
          timestamp: "2024-01-15 15:05:00",
        },
        {
          id: "D014",
          name: "血氧仪",
          type: "血氧",
          value: 98,
          unit: "%",
          normalRange: "95-100",
          status: "正常",
          timestamp: "2024-01-15 15:00:00",
        },
      ],
      lastCheckup: "2024-01-15",
      status: "正常",
      createdAt: "2024-01-13 14:15:00",
      history: [
        {
          id: "H012",
          date: "2024-01-15 15:10:00",
          type: "数值更新",
          description: "血压监测数值更新：从 125 到 118 mmHg",
          deviceId: "D012",
          oldValue: 125,
          newValue: 118,
          operator: "孙医生",
        },
        {
          id: "H013",
          date: "2024-01-13 14:15:00",
          type: "检查",
          description: "患者刘大强已添加到系统",
          operator: "管理员",
        },
      ],
    },
  ])
  const [activeView, setActiveView] = useState("dashboard")
  const { toast } = useToast()

  const addHistoryRecord = (patientId: string, record: Omit<PatientHistory, "id">) => {
    const historyRecord: PatientHistory = {
      ...record,
      id: `H${Date.now()}`,
    }

    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              history: [historyRecord, ...p.history],
            }
          : p,
      ),
    )
  }

  const handleAddPatient = (newPatient: Patient) => {
    const patientWithHistory: Patient = {
      ...newPatient,
      history: [
        {
          id: `H${Date.now()}`,
          date: new Date().toLocaleString(),
          type: "检查",
          description: `患者 ${newPatient.name} 已添加到系统`,
          operator: "管理员",
        },
      ],
      createdAt: new Date().toLocaleString(),
    }

    setPatients((prev) => [patientWithHistory, ...prev])

    // 为每个设备添加历史记录
    newPatient.devices.forEach((device) => {
      addHistoryRecord(patientWithHistory.id, {
        date: new Date().toLocaleString(),
        type: "设备添加",
        description: `添加设备 ${device.name}，初始值 ${device.value} ${device.unit}`,
        deviceId: device.id,
        newValue: device.value,
        operator: "管理员",
      })
    })

    toast({
      title: "添加成功",
      description: `患者 ${newPatient.name} 已成功添加到系统`,
    })
  }

  const handleUpdatePatient = (patientId: string, updatedPatient: Patient) => {
    const oldPatient = patients.find((p) => p.id === patientId)
    if (!oldPatient) return

    setPatients((prev) => prev.map((p) => (p.id === patientId ? updatedPatient : p)))

    // 检查状态变更
    if (oldPatient.status !== updatedPatient.status) {
      addHistoryRecord(patientId, {
        date: new Date().toLocaleString(),
        type: "状态变更",
        description: `患者状态从 ${oldPatient.status} 变更为 ${updatedPatient.status}`,
        operator: "系统",
      })
    }

    toast({
      title: "更新成功",
      description: `患者 ${updatedPatient.name} 的信息已更新`,
    })
  }

  const handleAssignDeviceToPatient = (deviceId: string, patientId: string, deviceData: PatientDevice) => {
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

    handleUpdatePatient(patientId, updatedPatient)

    // 添加历史记录
    addHistoryRecord(patientId, {
      date: new Date().toLocaleString(),
      type: "设备添加",
      description: `从库存分配设备 ${deviceData.name}，初始值 ${deviceData.value} ${deviceData.unit}`,
      deviceId: deviceData.id,
      newValue: deviceData.value,
      operator: "管理员",
    })
  }

  // 计算统计数据
  const deviceCount = patients.reduce((sum, p) => sum + p.devices.length, 0)
  const alertCount = patients.reduce((sum, p) => sum + p.devices.filter((d) => d.status !== "正常").length, 0)

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <DashboardOverview
            patientCount={patients.length}
            deviceCount={deviceCount}
            alertCount={alertCount}
            onNavigate={setActiveView}
          />
        )
      case "patients":
        return (
          <PatientManagementView
            patients={patients}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            onAddHistory={addHistoryRecord}
          />
        )
      case "inventory":
        return <DeviceInventoryView patients={patients} onAssignDeviceToPatient={handleAssignDeviceToPatient} />
      case "demo":
        return <DemoView />
      case "analytics":
        return (
          <PlaceholderView
            title="数据分析"
            description="健康数据分析和报告功能"
            onBack={() => setActiveView("dashboard")}
          />
        )
      case "monitoring":
        return (
          <PlaceholderView
            title="设备监控"
            description="实时设备状态监控功能"
            onBack={() => setActiveView("dashboard")}
          />
        )
      case "maintenance":
        return (
          <PlaceholderView
            title="维护管理"
            description="设备维护和保养管理功能"
            onBack={() => setActiveView("dashboard")}
          />
        )
      case "data":
        return (
          <PlaceholderView
            title="数据管理"
            description="数据备份和导入导出功能"
            onBack={() => setActiveView("dashboard")}
          />
        )
      case "settings":
        return (
          <PlaceholderView
            title="系统设置"
            description="系统配置和用户管理功能"
            onBack={() => setActiveView("dashboard")}
          />
        )
      case "permissions":
        return (
          <PlaceholderView
            title="权限管理"
            description="用户权限和角色管理功能"
            onBack={() => setActiveView("dashboard")}
          />
        )
      default:
        return (
          <DashboardOverview
            patientCount={patients.length}
            deviceCount={deviceCount}
            alertCount={alertCount}
            onNavigate={setActiveView}
          />
        )
    }
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      <SidebarNavigation
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={onLogout}
        patientCount={patients.length}
        deviceCount={deviceCount}
        alertCount={alertCount}
      />

      {/* 主内容区域 */}
      <div className="lg:ml-64 pt-16 lg:pt-0 h-full overflow-auto">
        <div className="p-4 lg:p-6">{renderView()}</div>
      </div>
    </div>
  )
}
