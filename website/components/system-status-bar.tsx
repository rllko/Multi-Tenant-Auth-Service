"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff, Clock, Server, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

export function SystemStatusBar() {
  const [isOnline, setIsOnline] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [apiLatency, setApiLatency] = useState(42) // ms
  const [apiQuota, setApiQuota] = useState(35) // percent used

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Format time
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return (
    <div className="h-6 border-t border-border bg-muted/40 text-xs flex items-center px-4 text-muted-foreground">
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center mr-4">
                {isOnline ? (
                  <Wifi className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 mr-1 text-destructive" />
                )}
                <span>{isOnline ? "Online" : "Offline"}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>System connection status</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center mr-4">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formattedTime}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Current system time</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center mr-4">
                <Server className="h-3 w-3 mr-1" />
                <span>{apiLatency}ms</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>API latency</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="ml-auto flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <span>API Quota: {apiQuota}%</span>
                <div className="w-24 h-1.5">
                  <Progress
                    value={apiQuota}
                    className="h-1.5"
                    indicatorClassName={
                      apiQuota > 80 ? "bg-destructive" : apiQuota > 60 ? "bg-amber-500" : "bg-green-500"
                    }
                  />
                </div>
                {apiQuota > 80 && <AlertCircle className="h-3 w-3 text-destructive" />}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>API quota usage for current billing period</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
