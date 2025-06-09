"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Construction, ArrowLeft } from "lucide-react"

interface PlaceholderViewProps {
  title: string
  description: string
  onBack: () => void
}

export function PlaceholderView({ title, description, onBack }: PlaceholderViewProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Construction className="h-8 w-8 text-gray-600" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-6">此功能正在开发中，敬请期待...</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回仪表板
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
