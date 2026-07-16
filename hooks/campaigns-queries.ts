import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

interface Campaign {
    id: string
    name: string
    status: "active" | "draft"
    messages?: number
    conversions?: number
}

interface CampaignsResponse extends Campaign { }

// Fetch campaigns
const fetchCampaigns = async (userId: string): Promise<Campaign[]> => {
    const res = await fetch(`/api/automations?userId=${userId}`)
    if (!res.ok) {
        throw new Error("Failed to fetch campaigns")
    }
    const campaigns = await res.json()
    return campaigns.map((a: any) => ({
        id: a.id,
        name: a.name,
        status: a.status,
        messages: 0,
        conversions: 0,
    }))
}

// Hook to fetch campaigns
export const useCampaigns = () => {
    const { data: session } = useSession()
    const userId = (session?.user as any)?.id as string | undefined

    return useQuery<Campaign[]>({
        queryKey: ["campaigns", userId],
        queryFn: () => fetchCampaigns(userId!),
        enabled: !!userId,
        staleTime: 60000, // 1 minute
    })
}

// Hook to toggle campaign status
export const useToggleCampaignStatus = () => {
    const queryClient = useQueryClient()
    const { data: session } = useSession()
    const userId = (session?.user as any)?.id as string | undefined

    return useMutation({
        mutationFn: async ({ campaignId, currentStatus }: { campaignId: string; currentStatus: string }) => {
            const newStatus = currentStatus === "active" ? "draft" : "active"
            const response = await fetch(`/api/automations/${campaignId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ active: newStatus === "active" }),
            })

            if (!response.ok) {
                throw new Error("Failed to update campaign status")
            }

            return { campaignId, newStatus }
        },
        onSuccess: () => {
            // Invalidate and refetch campaigns
            queryClient.invalidateQueries({ queryKey: ["campaigns", userId] })
        },
    })
}

// Hook to create campaign
export const useCreateCampaign = () => {
    const queryClient = useQueryClient()
    const { data: session } = useSession()
    const userId = (session?.user as any)?.id as string | undefined

    return useMutation({
        mutationFn: async (campaignData: any) => {
            const response = await fetch("/api/automations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    ...campaignData,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to create campaign")
            }

            return response.json()
        },
        onSuccess: () => {
            // Invalidate and refetch campaigns
            queryClient.invalidateQueries({ queryKey: ["campaigns", userId] })
        },
    })
}

// Hook to delete campaign
export const useDeleteCampaign = () => {
    const queryClient = useQueryClient()
    const { data: session } = useSession()
    const userId = (session?.user as any)?.id as string | undefined

    return useMutation({
        mutationFn: async (campaignId: string) => {
            const response = await fetch(`/api/automations/${campaignId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete campaign")
            }

            return campaignId
        },
        onSuccess: () => {
            // Invalidate and refetch campaigns
            queryClient.invalidateQueries({ queryKey: ["campaigns", userId] })
        },
    })
}

