"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Check, AlertTriangle, Copy, ExternalLink, Key } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LicensePanelProps {
  onClose: () => void
}

export default function LicensePanel({ onClose }: LicensePanelProps) {
  const [licenseKey, setLicenseKey] = useState("")
  const [activating, setActivating] = useState(false)
  const [activationProgress, setActivationProgress] = useState(0)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const { toast } = useToast()

  // Mock license data - in a real app, this would come from a server or local storage
  const licenseData = {
    status: "trial", // trial, active, expired
    type: "Trial Version",
    expiresIn: 14, // days
    owner: "Your Name",
    email: "your.email@example.com",
    activatedOn: "2023-11-01",
    features: {
      maxProjects: 5,
      maxDuration: 10, // minutes
      commercialUse: false,
      highQualityVoices: false,
      exportFormats: ["mp3"],
      batchProcessing: false,
    },
  }

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "$50",
      period: "lifetime",
      features: [
        "Unlimited projects",
        "Up to 30 minutes per export",
        "MP3 and WAV export",
        "10 premium voices",
        "Email support",
        "Free updates for life",
      ],
      recommended: false,
    },
    {
      id: "pro",
      name: "Professional",
      price: "$99",
      period: "lifetime",
      features: [
        "Unlimited projects",
        "Unlimited export duration",
        "All export formats",
        "All premium voices",
        "Commercial use license",
        "Batch processing",
        "Priority support",
        "Free updates for life",
      ],
      recommended: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$199",
      period: "lifetime",
      features: [
        "Everything in Professional",
        "Multiple user licenses (up to 5)",
        "Advanced voice customization",
        "API access",
        "Custom voice training",
        "Dedicated support",
        "Free updates for life",
      ],
      recommended: false,
    },
  ]

  const handleActivate = () => {
    if (!licenseKey.trim()) {
      toast({
        title: "License key required",
        description: "Please enter a valid license key",
        variant: "destructive",
      })
      return
    }

    setActivating(true)
    setActivationProgress(0)

    // Simulate activation process
    const interval = setInterval(() => {
      setActivationProgress((prev) => {
        const newProgress = prev + 20
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setActivating(false)
            toast({
              title: "License activated",
              description: "Your license has been successfully activated",
            })
          }, 500)
          return 100
        }
        return newProgress
      })
    }, 500)
  }

  const handleDeactivate = () => {
    toast({
      title: "License deactivated",
      description: "Your license has been deactivated on this device",
      variant: "destructive",
    })
  }

  const handleCopyLicenseKey = () => {
    navigator.clipboard.writeText("XXXX-XXXX-XXXX-XXXX")
    toast({
      title: "License key copied",
      description: "License key copied to clipboard",
    })
  }

  const handlePurchase = (planId: string) => {
    setSelectedPlan(planId)
    setShowPurchaseDialog(true)
  }

  const confirmPurchase = () => {
    setShowPurchaseDialog(false)
    const plan = plans.find((p) => p.id === selectedPlan)
    if (plan) {
      toast({
        title: "Purchase successful",
        description: `Thank you for purchasing the ${plan.name} lifetime license!`,
      })
    }
  }

  return (
    <Card className="fixed right-0 top-0 h-screen w-96 z-50 rounded-none shadow-lg border-l">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-lg font-medium">License Management</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Tabs defaultValue="status">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="activate">Activate</TabsTrigger>
            <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">License Status</h3>
                    {licenseData.status === "trial" ? (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        Trial
                      </Badge>
                    ) : licenseData.status === "active" ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                        Expired
                      </Badge>
                    )}
                  </div>

                  {licenseData.status === "trial" && (
                    <div className="rounded-md border p-4 bg-yellow-500/5">
                      <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="font-medium text-sm">Trial Version</p>
                          <p className="text-sm text-muted-foreground">
                            Your trial expires in {licenseData.expiresIn} days. Purchase a lifetime license starting at
                            $50 to unlock all features.
                          </p>
                          <Button size="sm" className="mt-2" onClick={() => setSelectedPlan("basic")}>
                            Purchase License
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 mt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">License Type</p>
                        <p className="font-medium">{licenseData.type}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Activated On</p>
                        <p className="font-medium">{licenseData.activatedOn}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Expires In</p>
                        <p className="font-medium">
                          {licenseData.status === "trial"
                            ? `${licenseData.expiresIn} days`
                            : licenseData.status === "active"
                              ? "Never"
                              : "Expired"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Registered To</p>
                      <p className="font-medium">
                        {licenseData.owner} ({licenseData.email})
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">License Key</p>
                      <div className="flex items-center gap-2">
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          XXXX-XXXX-XXXX-XXXX
                        </code>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyLicenseKey}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Features</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Projects</span>
                      <span className="text-sm font-medium">
                        {licenseData.features.maxProjects === Number.POSITIVE_INFINITY
                          ? "Unlimited"
                          : `${licenseData.features.maxProjects} max`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Export Duration</span>
                      <span className="text-sm font-medium">
                        {licenseData.features.maxDuration === Number.POSITIVE_INFINITY
                          ? "Unlimited"
                          : `${licenseData.features.maxDuration} minutes max`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Commercial Use</span>
                      <span className="text-sm font-medium">
                        {licenseData.features.commercialUse ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">High-Quality Voices</span>
                      <span className="text-sm font-medium">
                        {licenseData.features.highQualityVoices ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Export Formats</span>
                      <span className="text-sm font-medium">{licenseData.features.exportFormats.join(", ")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Batch Processing</span>
                      <span className="text-sm font-medium">
                        {licenseData.features.batchProcessing ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full" onClick={handleDeactivate}>
                    Deactivate License
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="activate" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Activate License</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your license key below to activate VoiceOver Pro. If you don't have a license key, you can
                    purchase one from our website.
                  </p>

                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label htmlFor="license-key" className="text-sm font-medium">
                        License Key
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="license-key"
                          placeholder="XXXX-XXXX-XXXX-XXXX"
                          value={licenseKey}
                          onChange={(e) => setLicenseKey(e.target.value)}
                          className="font-mono"
                        />
                        <Button onClick={handleActivate} disabled={activating}>
                          {activating ? "Activating..." : "Activate"}
                        </Button>
                      </div>
                      {activating && (
                        <div className="space-y-1 mt-2">
                          <div className="flex justify-between text-xs">
                            <span>Activating license...</span>
                            <span>{activationProgress}%</span>
                          </div>
                          <Progress value={activationProgress} className="h-2" />
                        </div>
                      )}
                    </div>

                    <div className="rounded-md border p-4">
                      <h4 className="text-sm font-medium mb-2">Where to find your license key</h4>
                      <p className="text-sm text-muted-foreground">
                        Your license key was sent to your email after purchase. You can also find it in your account on
                        our website.
                      </p>
                    </div>

                    <div className="rounded-md border p-4">
                      <h4 className="text-sm font-medium mb-2">License activation issues?</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        If you're having trouble activating your license, please try the following:
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Check that you've entered the key correctly</li>
                        <li>Ensure you have an active internet connection</li>
                        <li>Verify that your license hasn't been activated on too many devices</li>
                        <li>Contact our support team if problems persist</li>
                      </ul>
                    </div>

                    <div className="flex justify-center">
                      <Button variant="outline" className="gap-2" onClick={() => window.open("#", "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                        <span>Manage Licenses Online</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upgrade" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Upgrade Your License</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a lifetime license that fits your needs. All licenses include free updates for life and can
                    be upgraded to a higher tier at any time by paying the difference.
                  </p>

                  <div className="grid gap-4 mt-4">
                    {plans.map((plan) => (
                      <Card
                        key={plan.id}
                        className={`overflow-hidden ${plan.recommended ? "border-primary shadow-md" : "border-border"}`}
                      >
                        {plan.recommended && (
                          <div className="bg-primary text-primary-foreground text-xs font-medium text-center py-1">
                            RECOMMENDED
                          </div>
                        )}
                        <CardContent className={`p-4 ${plan.recommended ? "pt-3" : "pt-4"}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{plan.name}</h4>
                              <p className="text-sm text-muted-foreground">Lifetime License</p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold">{plan.price}</div>
                              <p className="text-xs text-muted-foreground">one-time payment</p>
                            </div>
                          </div>

                          <ul className="space-y-2 my-4">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <Button
                            className="w-full"
                            variant={plan.recommended ? "default" : "outline"}
                            onClick={() => handlePurchase(plan.id)}
                          >
                            Purchase
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="rounded-md border p-4 mt-4 bg-muted/50">
                    <div className="flex gap-3">
                      <Key className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="font-medium text-sm">Already have a license?</p>
                        <p className="text-sm text-muted-foreground">
                          You can upgrade your existing license at any time by paying only the difference. Contact our
                          support team with your license key to get a personalized upgrade quote.
                        </p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => window.open("#", "_blank")}>
                          Upgrade Existing License
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              You're about to purchase the lifetime {plans.find((p) => p.id === selectedPlan)?.name || "selected"}{" "}
              license.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              This is a one-time payment that includes lifetime access to the software and free updates for the version
              you purchase.
            </p>
            <div className="rounded-md border p-3 bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {plans.find((p) => p.id === selectedPlan)?.name || "Selected"} Lifetime License
                </span>
                <span className="font-bold">{plans.find((p) => p.id === selectedPlan)?.price || "$99"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPurchase}>Complete Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

