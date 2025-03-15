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
      <TabsList className="w-full bg-[#1C1F24] p-1 rounded-lg">
        <TabsTrigger
          value="ai-model"
          className="w-1/2 data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white rounded-md py-3"
        >
          AI Model
        </TabsTrigger>
        <TabsTrigger
          value="virtual-tryon"
          className="w-1/2 data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white rounded-md py-3"
        >
          Virtual Try On
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
