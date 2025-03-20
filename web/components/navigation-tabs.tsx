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
          className="w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-3"
        >
          AI Model
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
