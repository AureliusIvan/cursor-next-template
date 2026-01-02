"use client";

import { motion } from "framer-motion";
import { FileText, Heart, MessageSquare, Star, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { apps, communityPosts, projects, recentFiles } from "./data";

export function HomeContent() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <Badge className="rounded-xl bg-white/20 text-white hover:bg-white/30">Premium</Badge>
              <h2 className="font-bold text-3xl">Welcome to Dalim UI Blocks</h2>
              <p className="max-w-[600px] text-white/80">
                Unleash your creativity with our comprehensive suite of professional design tools
                and resources.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-2xl bg-white text-indigo-700 hover:bg-white/90">
                  Explore Plans
                </Button>
                <Button
                  className="rounded-2xl border-white bg-transparent text-white hover:bg-white/10"
                  variant="outline"
                >
                  Take a Tour
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <motion.div
                animate={{ rotate: 360 }}
                className="relative h-40 w-40"
                transition={{
                  duration: 50,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
                <div className="absolute inset-4 rounded-full bg-white/20" />
                <div className="absolute inset-8 rounded-full bg-white/30" />
                <div className="absolute inset-12 rounded-full bg-white/40" />
                <div className="absolute inset-16 rounded-full bg-white/50" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Recent Apps */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-2xl">Recent Apps</h2>
          <Button className="rounded-2xl" variant="ghost">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {apps
            .filter((app) => app.recent)
            .map((app) => (
              <motion.div
                key={app.name}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="overflow-hidden rounded-3xl transition-all duration-300 hover:border-primary/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                        {app.icon}
                      </div>
                      <Button className="h-8 w-8 rounded-2xl" size="icon" variant="ghost">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                    <CardDescription>{app.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full rounded-2xl" variant="secondary">
                      Open
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
        </div>
      </section>

      {/* Recent Files and Projects */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-2xl">Recent Files</h2>
            <Button className="rounded-2xl" variant="ghost">
              View All
            </Button>
          </div>
          <div className="rounded-3xl border">
            <div className="grid grid-cols-1 divide-y">
              {recentFiles.slice(0, 3).map((file) => (
                <motion.div
                  className="flex items-center justify-between p-4"
                  key={file.name}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                      {file.icon}
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {file.app} • {file.modified}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.shared && (
                      <Badge className="rounded-xl" variant="outline">
                        <Users className="mr-1 h-3 w-3" />
                        {file.collaborators}
                      </Badge>
                    )}
                    <Button className="rounded-xl" size="sm" variant="ghost">
                      Open
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-2xl">Active Projects</h2>
            <Button className="rounded-2xl" variant="ghost">
              View All
            </Button>
          </div>
          <div className="rounded-3xl border">
            <div className="grid grid-cols-1 divide-y">
              {projects.slice(0, 3).map((project) => (
                <motion.div
                  className="p-4"
                  key={project.name}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium">{project.name}</h3>
                    <Badge className="rounded-xl" variant="outline">
                      Due {project.dueDate}
                    </Badge>
                  </div>
                  <p className="mb-3 text-muted-foreground text-sm">{project.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress className="h-2 rounded-xl" value={project.progress} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-muted-foreground text-sm">
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {project.members} members
                    </div>
                    <div className="flex items-center">
                      <FileText className="mr-1 h-4 w-4" />
                      {project.files} files
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Community Highlights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-2xl">Community Highlights</h2>
          <Button className="rounded-2xl" variant="ghost">
            Explore
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {communityPosts.map((post) => (
            <motion.div
              key={post.title}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="overflow-hidden rounded-3xl">
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    src={post.image || "/placeholder.svg"}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-muted-foreground text-sm">by {post.author}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      {post.likes}
                      <MessageSquare className="ml-2 h-4 w-4 text-blue-500" />
                      {post.comments}
                    </div>
                    <span className="text-muted-foreground">{post.time}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
