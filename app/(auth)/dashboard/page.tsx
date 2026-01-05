"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProjectForm } from "@/components/crm/project-form";
import { HomeContent } from "@/components/home-content";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();

  return (
    <main className="flex-1 p-4 md:p-6">
      <Tabs className="w-full" defaultValue="home" onValueChange={setActiveTab} value={activeTab}>
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList className="grid w-full max-w-[600px] grid-cols-6 rounded-2xl p-1">
            <TabsTrigger className="rounded-xl" value="home">
              Home
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value="apps">
              Apps
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value="files">
              Files
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value="projects">
              Projects
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value="learn">
              Learn
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value="crm">
              CRM
            </TabsTrigger>
          </TabsList>
          <div className="hidden gap-2 md:flex">
            <Button className="rounded-2xl" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
            <ProjectForm />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            key={activeTab}
            transition={{ duration: 0.2 }}
          >
            <TabsContent className="mt-0" value="home">
              <HomeContent />
            </TabsContent>
            <TabsContent className="mt-0" value="apps">
              <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed">
                <p className="text-muted-foreground">Apps content will go here</p>
              </div>
            </TabsContent>
            <TabsContent className="mt-0" value="files">
              <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed">
                <p className="text-muted-foreground">Files content will go here</p>
              </div>
            </TabsContent>
            <TabsContent className="mt-0" value="projects">
              <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed">
                <p className="text-muted-foreground">Manage your projects</p>
                <Button className="rounded-2xl" onClick={() => router.push("/dashboard/projects")}>
                  Go to Projects
                </Button>
              </div>
            </TabsContent>
            <TabsContent className="mt-0" value="learn">
              <div className="flex h-96 items-center justify-center rounded-3xl border border-dashed">
                <p className="text-muted-foreground">Learn content will go here</p>
              </div>
            </TabsContent>
            <TabsContent className="mt-0" value="crm">
              <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed">
                <p className="text-muted-foreground">CRM content will go here</p>
                <Button
                  className="rounded-2xl"
                  onClick={() => router.push("/dashboard/crm/contacts")}
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
