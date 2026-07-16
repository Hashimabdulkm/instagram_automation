import { useQuery } from "@tanstack/react-query"

export interface InstagramInsightsData {
    period: number
    reach: {
        data: Array<{
            date: string
            value: number
            end_time: string
        }>
        total: number
    }
    engagement: {
        data: Array<{
            date: string
            value: number
            end_time: string
        }>
        total: number
    }
    combined: {
        data: Array<{
            date: string
            value: number
            engagement: number
            end_time: string
        }>
        reachTotal: number
        engagementTotal: number
    }
    followerGrowth: {
        data: Array<{
            date: string
            follows: number
            unfollows: number
            net: number
            end_time: string
        }>
        totalFollows: number
        totalUnfollows: number
        netGrowth: number
    }
    contentPerformance: {
        data: Array<{
            date: string
            likes: number
            comments: number
            shares: number
            saves: number
            total: number
            end_time: string
        }>
        totalLikes: number
        totalComments: number
        totalShares: number
        totalSaves: number
        totalEngagement: number
    }
}

export function useInstagramInsights(period: number = 30) {
    return useQuery<InstagramInsightsData>({
        queryKey: ["instagram-insights", period],
        queryFn: async () => {
            const response = await fetch(`/api/instagram/insights?period=${period}`)

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
                throw new Error(error.error || `Failed to fetch insights: ${response.status}`)
            }

            return response.json()
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // 10 minutes
        retry: 2,
    })
}
