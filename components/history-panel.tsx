"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Clock, Undo } from "lucide-react"

interface HistoryItem {
  id: string
  action: string
  timestamp: string
  details: string
  reversible: boolean
}

interface HistoryPanelProps {
  onClose: () => void
}

export default function HistoryPanel({ onClose }: HistoryPanelProps) {
  // Sample history data - in a real app, this would come from state or context
  const historyItems: HistoryItem[] = [
    {
      id: "hist-1",
      action: "Changed Voice",
      timestamp: "Just now",
      details: "Changed voice from James to Emma",
      reversible: true,
    },
    {
      id: "hist-2",
      action: "Adjusted Speed",
      timestamp: "5 minutes ago",
      details: "Changed speed from 1.0x to 1.2x",
      reversible: true,
    },
    {
      id: "hist-3",
      action: "Edited Text",
      timestamp: "10 minutes ago",
      details: "Modified script content",
      reversible: true,
    },
    {
      id: "hist-4",
      action: "Changed Format",
      timestamp: "15 minutes ago",
      details: "Changed output format from MP3 to WAV",
      reversible: true,
    },
    {
      id: "hist-5",
      action: "Created Project",
      timestamp: "20 minutes ago",
      details: "Created new project 'Product Review'",
      reversible: false,
    },
  ]

  return (
    <Card className="fixed right-0 top-0 h-screen w-80 z-50 rounded-none shadow-lg border-l">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-lg font-medium">History</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ScrollArea className="h-[calc(100vh-80px)] pr-4">
          <div className="space-y-4">
            {historyItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="mt-0.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{item.action}</div>
                    <div className="text-xs text-muted-foreground">{item.timestamp}</div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.details}</p>
                </div>
                {item.reversible && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5" title="Undo">
                    <Undo className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full" size="sm">
            Clear History
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

