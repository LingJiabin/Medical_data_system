"use client"

import { DeviceInventory } from "@/components/device-inventory"

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

interface DeviceInventoryViewProps {
  patients: Patient[]
  onAssignDeviceToPatient: (deviceId: string, patientId: string, deviceData: PatientDevice) => void
}

export function DeviceInventoryView({ patients, onAssignDeviceToPatient }: DeviceInventoryViewProps) {
  return (
    <div className="space-y-6">
      <DeviceInventory patients={patients} onAssignDeviceToPatient={onAssignDeviceToPatient} />
    </div>
  )
}
