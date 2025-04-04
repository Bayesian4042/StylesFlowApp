"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface NavigationTabsProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export function NavigationTabs({ onTabChange, activeTab }: NavigationTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="w-full"
    >
      <TabsList className="w-full bg-card p-1 rounded-lg">
        <TabsTrigger
          value="ai-model"
          className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-3"
        >
          AI Model
        </TabsTrigger>
        <TabsTrigger
          value="campaign"
          className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-3"
        >
          Campaign
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
