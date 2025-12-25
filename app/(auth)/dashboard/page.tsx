"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { HomeContent } from "@/components/home-content";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();

  return (
    <main className="flex-1 p-4 md:p-6">
      <Tabs
        defaultValue="home"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList className="grid w-full max-w-[600px] grid-cols-6 rounded-2xl p-1">
            <TabsTrigger value="home" className="rounded-xl">
              Home
            </TabsTrigger>
            <TabsTrigger value="apps" className="rounded-xl">
              Apps
            </TabsTrigger>
            <TabsTrigger value="files" className="rounded-xl">
              Files
            </TabsTrigger>
            <TabsTrigger value="projects" className="rounded-xl">
              Projects
            </TabsTrigger>
            <TabsTrigger value="learn" className="rounded-xl">
              Learn
            </TabsTrigger>
            <TabsTrigger value="crm" className="rounded-xl">
              CRM
            </TabsTrigger>
          </TabsList>
          <div className="hidden gap-2 md:flex">
            <Button variant="outline" className="rounded-2xl">
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
            <Button className="rounded-2xl">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="home" className="mt-0">
              <HomeContent />
            </TabsContent>
            <TabsContent value="apps" className="mt-0">
              <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed">
                <p className="text-muted-foreground">
                  Apps content will go here
                </p>
              </div>
            </TabsContent>
            <TabsContent value="files" className="mt-0">
              <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed">
                <p className="text-muted-foreground">
                  Files content will go here
                </p>
              </div>
            </TabsContent>
            <TabsContent value="projects" className="mt-0">
              <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed">
                <p className="text-muted-foreground">
                  Projects content will go here
                </p>
              </div>
            </TabsContent>
            <TabsContent value="learn" className="mt-0">
              <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed">
                <p className="text-muted-foreground">
                  Learn content will go here
                </p>
              </div>
            </TabsContent>
            <TabsContent value="crm" className="mt-0">
              <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed">
                <p className="text-muted-foreground">
                  CRM content will go here
                </p>
                <Button
                  onClick={() => router.push("/dashboard/crm/contacts")}
                  className="rounded-2xl"
                >
                  Go to Contacts
                </Button>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </main>
  );
}
