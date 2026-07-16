"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardSidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Loader2, Calendar, MessageSquare, Zap, Target, Settings } from "lucide-react"
import Link from "next/link"

type TriggerType = "comment" | "dm"
type ResponseType = "predefined" | "ai"
type PostSelectionMode = "all" | "specific" | "next"

interface MediaItem {
  id: string
  media_url: string
  thumbnail_url?: string
  media_type: string
}

export default function ViewCampaignPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const campaignId = params.id as string

  const [loading, setLoading] = useState(true)

  const [name, setName] = useState("")
  const [triggerType, setTriggerType] = useState<TriggerType>("comment")
  const [triggerKeywords, setTriggerKeywords] = useState<string[]>([])
  const [responseType, setResponseType] = useState<ResponseType>("predefined")
  const [predefinedMessage, setPredefinedMessage] = useState("")
  const [aiModel, setAiModel] = useState("gpt-4o-mini")
  const [aiPrompt, setAiPrompt] = useState("")
  const [commentReplyText, setCommentReplyText] = useState("")
  const [postSelectionMode, setPostSelectionMode] = useState<PostSelectionMode>("all")
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([])
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [status, setStatus] = useState<"draft" | "active">("draft")
  const [createdAt, setCreatedAt] = useState<string>("")
  const [lastModified, setLastModified] = useState<string>("")

  // Load campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const response = await fetch(`/api/automations/${campaignId}`)
        if (response.ok) {
          const data = await response.json()
          setName(data.name)
          setTriggerType(data.trigger?.[0]?.type || "comment")
          setTriggerKeywords(data.keywords?.map((k: any) => k.word) || [])
          setResponseType(data.listener?.[0]?.listener === "MESSAGE" ? "predefined" : "ai")
          setPredefinedMessage(data.listener?.[0]?.commendReply || "")
          setAiPrompt(data.listener?.[0]?.prompt || "")
          setCommentReplyText(data.listener?.[0]?.commentReply || "")
          setStatus(data.active ? "active" : "draft")
          setCreatedAt(data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "")
          setLastModified(data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : "")

          // Load post selection data
          const postIds = data.postIds || []
          if (postIds.length === 0) {
            setPostSelectionMode("all")
            setSelectedPostIds([])
          } else {
            setPostSelectionMode("specific")
            setSelectedPostIds(postIds)
            await fetchMedia()
          }
        } else {
          router.push("/dashboard/campaigns")
        }
      } catch (error) {
        console.error("Error loading campaign:", error)
        router.push("/dashboard/campaigns")
      } finally {
        setLoading(false)
      }
    }

    if (campaignId) {
      loadCampaign()
    }
  }, [campaignId, router])

  // Media fetching functions
  async function fetchMedia() {
    try {
      const res = await fetch(`/api/instagram/media`)
      const data = await res.json()
      setMediaItems(data.items)
    } catch (error) {
      console.error("Failed to fetch media:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{name}</h1>
                  <div className="flex items-center space-x-4">
                    <Badge variant={status === "active" ? "default" : "secondary"} className="text-xs">
                      {status === "active" ? (
                        <>
                          <Zap className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <Settings className="w-3 h-3 mr-1" />
                          Draft
                        </>
                      )}
                    </Badge>
                    {createdAt && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        Created {createdAt}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button asChild>
                <Link href={`/dashboard/campaigns/edit/${campaignId}`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Campaign
                </Link>
              </Button>
            </div>

            {/* Campaign Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Trigger Type</p>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        {triggerType === "comment" ? "Comments" : "Messages"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Response Type</p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">
                        {responseType === "predefined" ? "Predefined" : "AI Generated"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Keywords</p>
                      <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                        {triggerKeywords.length || "None"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trigger Info */}
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Trigger Configuration</CardTitle>
                      <CardDescription>What activates this campaign</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Trigger Type</label>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 mt-1">
                      {triggerType === "comment" ? "Comment on Post" : "Direct Message"}
                    </p>
                  </div>
                  
                  {triggerKeywords.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Keywords Filter</label>
                      <div className="flex flex-wrap gap-2">
                        {triggerKeywords.map((k) => (
                          <span key={k} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {triggerType === "comment" && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <label className="text-sm font-medium text-muted-foreground">Post Selection</label>
                      <p className="text-lg font-semibold mt-1">
                        {postSelectionMode === "all" && "All Posts"}
                        {postSelectionMode === "specific" && `${selectedPostIds.length} Selected Posts`}
                        {postSelectionMode === "next" && "Next Post"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Response Info */}
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Response Configuration</CardTitle>
                      <CardDescription>How the campaign responds</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <label className="text-sm font-medium text-green-700 dark:text-green-300">Response Type</label>
                    <p className="text-lg font-semibold text-green-900 dark:text-green-100 mt-1">
                      {responseType === "predefined" ? "Predefined Message" : "AI Generated"}
                    </p>
                  </div>

                  {responseType === "predefined" ? (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Message Content</label>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-green-500">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{predefinedMessage}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <label className="text-sm font-medium text-muted-foreground">AI Model</label>
                        <p className="font-semibold mt-1">{aiModel}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Prompt</label>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-green-500">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{aiPrompt}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {triggerType === "comment" && commentReplyText && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Comment Reply</label>
                      <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border-l-4 border-orange-500">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{commentReplyText}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        This will be posted as a reply to comments using Instagram's API
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Selected Posts Preview */}
            {triggerType === "comment" && postSelectionMode === "specific" && selectedPostIds.length > 0 && (
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Selected Posts</CardTitle>
                      <CardDescription>{selectedPostIds.length} posts that will trigger this campaign</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {mediaItems
                      .filter(item => selectedPostIds.includes(item.id))
                      .map((item) => (
                        <div
                          key={item.id}
                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary shadow-sm hover:shadow-md transition-shadow group"
                        >
                          <img
                            src={item.thumbnail_url || item.media_url}
                            alt="Post"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-lg" />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
