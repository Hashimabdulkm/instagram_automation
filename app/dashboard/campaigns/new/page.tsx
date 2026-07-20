"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardSidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Play, Save, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { useCreateCampaign } from "@/hooks/campaigns-queries"


type TriggerType = "comment" | "dm"
type ResponseType = "predefined" | "ai"

type DraftCampaign = {
  id: string
  name: string
  triggerType: TriggerType
  triggerKeywords: string[]
  responseType: ResponseType
  predefinedMessage?: string
  aiModel?: string
  aiPrompt?: string
  optionalPostText?: string
  commentReplyText?: string
  postSelectionMode?: "all" | "specific" | "next"
  selectedPostIds?: string[]
  status: "draft" | "active"
  createdAt: number
}

export default function NewCampaignPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const createCampaignMutation = useCreateCampaign()

  const [name, setName] = useState("")
  const [triggerType, setTriggerType] = useState<TriggerType>("comment")
  const [triggerKeywords, setTriggerKeywords] = useState<string[]>([])
  const [newKeyword, setNewKeyword] = useState("")

  const [responseType, setResponseType] = useState<ResponseType>("predefined")
  const [predefinedMessage, setPredefinedMessage] = useState("")
  const [aiModel, setAiModel] = useState("gpt-4o-mini")
  const [aiPrompt, setAiPrompt] = useState("")

  const [optionalPostText, setOptionalPostText] = useState("")
  const [commentReplyText, setCommentReplyText] = useState("")

  // Post selection state
  const [postSelectionMode, setPostSelectionMode] = useState<"all" | "specific" | "next">("all")
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([])
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [showMoreMedia, setShowMoreMedia] = useState(false)
  const [mediaCursor, setMediaCursor] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<"trigger" | "response">("trigger")

  const canProceedToResponse = useMemo(() => {
    if (!name.trim()) return false
    if (triggerKeywords.length === 0) return false
    return true
  }, [name, triggerKeywords])

  const canSave = useMemo(() => {
    if (!canProceedToResponse) return false
    if (responseType === "predefined") return predefinedMessage.trim().length > 0
    return aiPrompt.trim().length > 0
  }, [canProceedToResponse, responseType, predefinedMessage, aiPrompt])

  function addKeyword() {
    const k = newKeyword.trim()
    if (!k) return
    if (triggerKeywords.includes(k)) return
    setTriggerKeywords((prev) => [...prev, k])
    setNewKeyword("")
  }

  function removeKeyword(k: string) {
    setTriggerKeywords((prev: string[]) => prev.filter((x: string) => x !== k))
  }

  async function fetchMedia(cursor?: string) {
    setLoadingMedia(true)
    try {
      const params = new URLSearchParams()
      if (cursor) params.set("cursor", cursor)

      const res = await fetch(`/api/instagram/media?${params}`)
      const data = await res.json()

      if (cursor) {
        setMediaItems((prev: any[]) => [...prev, ...data.items])
      } else {
        setMediaItems(data.items)
      }
      setMediaCursor(data.nextCursor || null)
    } catch (error) {
      console.error("Failed to fetch media:", error)
    } finally {
      setLoadingMedia(false)
    }
  }

  useEffect(() => {
    if (triggerType === "comment") {
      fetchMedia()
    }
  }, [triggerType])

  function save(status: "draft" | "active") {
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) {
      alert("Session expired or not loaded. Please sign out and sign back in.")
      return
    }

    createCampaignMutation.mutate(
      {
        name: name.trim(),
        status,
        triggerType,
        triggerKeywords,
        responseType,
        predefinedMessage: responseType === "predefined" ? predefinedMessage.trim() : undefined,
        aiModel: responseType === "ai" ? aiModel : undefined,
        aiPrompt: responseType === "ai" ? aiPrompt.trim() : undefined,
        optionalPostText: optionalPostText.trim() || undefined,
        commentReplyText: triggerType === "comment" ? commentReplyText.trim() : undefined,
        postSelectionMode,
        selectedPostIds: postSelectionMode === "specific" ? selectedPostIds : [],
      },
      {
        onSuccess: (data) => {
          console.log("Campaign created successfully:", data)
          router.push("/dashboard/campaigns")
        },
        onError: (error: Error) => {
          console.error("Error creating campaign:", error)
          alert(`Failed to create campaign: ${error.message}`)
        },
      }
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">New Campaign</h1>
                <p className="text-muted-foreground">Create an automation workflow</p>
              </div>
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="name">Campaign name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Comment reply" />
                </div>
              </CardContent>
            </Card>

            {/* Progress Indicator */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center space-x-2 ${currentStep === "trigger" ? "text-primary" : "text-muted-foreground"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "trigger" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}>
                          1
                        </div>
                        <span className="font-medium">Trigger Configuration</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      <div className={`flex items-center space-x-2 ${currentStep === "response" ? "text-primary" : "text-muted-foreground"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "response" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}>
                          2
                        </div>
                        <span className="font-medium">Response Configuration</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Step {currentStep === "trigger" ? "1" : "2"} of 2
                    </div>
                  </div>
                  <Progress value={currentStep === "trigger" ? 50 : 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Trigger Configuration */}
            {currentStep === "trigger" && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Trigger Configuration</CardTitle>
                  <CardDescription>Set up what will trigger your automation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`cursor-pointer border rounded-md p-4 ${triggerType === "comment" ? "border-primary" : "border-input"}`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="triggerType"
                          checked={triggerType === "comment"}
                          onChange={() => setTriggerType("comment")}
                          className="accent-primary"
                        />
                        <span className="font-medium">When someone comments on my post</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Triggers when new comments arrive.</p>
                    </label>

                    <label className={`cursor-pointer border rounded-md p-4 ${triggerType === "dm" ? "border-primary" : "border-input"}`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="triggerType"
                          checked={triggerType === "dm"}
                          onChange={() => setTriggerType("dm")}
                          className="accent-primary"
                        />
                        <span className="font-medium">When someone sends me a DM</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Triggers when a new DM is received.</p>
                    </label>
                  </div>

                  {triggerType === "comment" && (
                    <div className="space-y-4 border-t pt-6">
                      <Label>Which Post or Reel do you want to use in automation?</Label>

                      {/* All Posts Option */}
                      <div
                        className={cn(
                          "cursor-pointer border rounded-md p-4",
                          postSelectionMode === "all" ? "border-primary bg-primary/5" : "border-input",
                        )}
                        onClick={() => setPostSelectionMode("all")}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="postSelection"
                            checked={postSelectionMode === "all"}
                            onChange={() => setPostSelectionMode("all")}
                            className="accent-primary"
                          />
                          <span className="font-medium">All Posts or Reels</span>
                          <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded">Pro</span>
                        </div>
                      </div>

                      {/* Specific Posts Option */}
                      <div className={cn(
                        "border rounded-md p-4",
                        postSelectionMode === "specific" ? "border-primary bg-primary/5" : "border-input",
                      )}>
                        <div
                          className="cursor-pointer"
                          onClick={() => setPostSelectionMode("specific")}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="postSelection"
                              checked={postSelectionMode === "specific"}
                              onChange={() => setPostSelectionMode("specific")}
                              className="accent-primary"
                            />
                            <span className="font-medium">Specific Post or Reel</span>
                            <Button
                              variant="link"
                              size="sm"
                              className="ml-auto"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowMoreMedia(true)
                              }}
                            >
                              See More
                            </Button>
                          </div>
                        </div>

                        {postSelectionMode === "specific" && (
                          <div className="mt-4 grid grid-cols-3 gap-3">
                            {loadingMedia ? (
                              <div className="col-span-3 text-center py-8">Loading...</div>
                            ) : (
                              mediaItems.slice(0, showMoreMedia ? undefined : 6).map((item) => (
                                <div
                                  key={item.id}
                                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${selectedPostIds.includes(item.id) ? "border-primary" : "border-transparent"
                                    }`}
                                  onClick={() => {
                                    setSelectedPostIds((prev: string[]) =>
                                      prev.includes(item.id)
                                        ? prev.filter((id: string) => id !== item.id)
                                        : [...prev, item.id]
                                    )
                                  }}
                                >
                                  <img
                                    src={item.thumbnail_url || item.media_url}
                                    alt="Post"
                                    className="w-full h-full object-cover"
                                  />
                                  <div
                                    className="absolute top-2 left-2"
                                    onClick={(e) => e.stopPropagation()} // prevent selecting post
                                  >
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button className="bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full">
                                          <MoreVertical className="w-4 h-4" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="start" className="w-32">
                                        <DropdownMenuItem asChild>
                                          <a
                                            href={item.permalink || item.media_url} // Instagram post or fallback
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            View
                                          </a>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  {selectedPostIds.includes(item.id) && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                            {mediaCursor && showMoreMedia && (
                              <Button
                                variant="outline"
                                className="col-span-3"
                                onClick={() => fetchMedia(mediaCursor)}
                                disabled={loadingMedia}
                              >
                                Load More
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Next Post Option */}
                      <div
                        className={cn(
                          "cursor-pointer border rounded-md p-4 opacity-50",
                          postSelectionMode === "next" ? "border-primary bg-primary/5" : "border-input",
                        )}
                        onClick={() => setPostSelectionMode("next")}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="postSelection"
                            checked={postSelectionMode === "next"}
                            onChange={() => setPostSelectionMode("next")}
                            className="accent-primary"
                            disabled
                          />
                          <span className="font-medium">Next Post or Reel</span>
                          <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Keywords (optional filter)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add keyword and press Add"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addKeyword()
                          }
                        }}
                      />
                      <Button type="button" onClick={addKeyword} variant="secondary">
                        Add keyword
                      </Button>
                    </div>
                    {triggerKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {triggerKeywords.map((k) => (
                          <span key={k} className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm">
                            {k}
                            <button className="text-muted-foreground hover:text-foreground" onClick={() => removeKeyword(k)} aria-label={`remove ${k}`}>
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Response Configuration */}
            {currentStep === "response" && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Response Configuration</CardTitle>
                  <CardDescription>Set up how your automation will respond</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`cursor-pointer border rounded-md p-4 ${responseType === "predefined" ? "border-primary" : "border-input"}`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="responseType"
                          checked={responseType === "predefined"}
                          onChange={() => setResponseType("predefined")}
                          className="accent-primary"
                        />
                        <span className="font-medium">Use predefined message</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Send a fixed message when triggered.</p>
                    </label>

                    <label className={`cursor-pointer border rounded-md p-4 ${responseType === "ai" ? "border-primary" : "border-input"}`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="responseType"
                          checked={responseType === "ai"}
                          onChange={() => setResponseType("ai")}
                          className="accent-primary"
                        />
                        <span className="font-medium">Use AI model with prompt</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Generate a reply via your AI provider.</p>
                    </label>
                  </div>

                  {responseType === "predefined" ? (
                    <div className="grid gap-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" rows={6} value={predefinedMessage} onChange={(e) => setPredefinedMessage(e.target.value)} placeholder="Thanks for reaching out! ..." />
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="aiModel">AI Model</Label>
                        <Input id="aiModel" value={aiModel} onChange={(e) => setAiModel(e.target.value)} placeholder="e.g. gpt-4o-mini" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="aiPrompt">Prompt</Label>
                        <Textarea id="aiPrompt" rows={6} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="You are a helpful assistant who replies concisely..." />
                      </div>
                    </div>
                  )}

                  {triggerType === "comment" && (
                    <div className="grid gap-2">
                      <Label htmlFor="commentReply">Comment Reply Text</Label>
                      <Textarea
                        id="commentReply"
                        rows={4}
                        value={commentReplyText}
                        onChange={(e) => setCommentReplyText(e.target.value)}
                        placeholder="Reply to comment with this text (e.g., Thanks for your comment! 😊)"
                      />
                      <p className="text-sm text-muted-foreground">
                        This text will be posted as a reply to the comment using Instagram's comment reply API.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Optional Post</CardTitle>
                <CardDescription>Add a caption or note to post</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea rows={4} value={optionalPostText} onChange={(e) => setOptionalPostText(e.target.value)} placeholder="Optional: write something to post along with activation..." />
              </CardContent>
            </Card> */}

            {/* Navigation and Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {currentStep === "response" && (
                  <Button variant="outline" onClick={() => setCurrentStep("trigger")}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Trigger
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {currentStep === "trigger" ? (
                  <Button
                    onClick={() => setCurrentStep("response")}
                    disabled={!canProceedToResponse}
                  >
                    Continue to Response
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => save("draft")}
                      disabled={!canSave || createCampaignMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save as Draft
                    </Button>
                    <Button
                      onClick={() => save("active")}
                      disabled={!canSave || createCampaignMutation.isPending}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {createCampaignMutation.isPending ? "Creating..." : "Activate Campaign"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


