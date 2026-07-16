"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart"
import { useInstagramInsights } from "@/hooks/analytics-queries"
import { LineChart, Line, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import * as React from "react"

const combinedConfig = {
    reach: {
        label: "Reach",
        color: "var(--color-chart-1)"
    },
    engagement: {
        label: "Accounts Engaged",
        color: "var(--color-chart-2)"
    },
    value: {
        label: "Reach",
        color: "var(--color-chart-1)"
    }
} satisfies ChartConfig

const netGrowthConfig = {
    net: {
        label: "Net Growth",
        color: "var(--color-chart-5)"
    }
} satisfies ChartConfig

const contentPerformanceConfig = {
    likes: {
        label: "Likes",
        color: "var(--color-chart-1)"
    },
    comments: {
        label: "Comments",
        color: "var(--color-chart-2)"
    },
    shares: {
        label: "Shares",
        color: "var(--color-chart-3)"
    },
    saves: {
        label: "Saves",
        color: "var(--color-chart-4)"
    }
} satisfies ChartConfig

export default function AnalyticsSection() {
    const [selectedPeriod, setSelectedPeriod] = useState(30)
    const { data: insights, isLoading, error } = useInstagramInsights(selectedPeriod)

    const timeRange = selectedPeriod === 7 ? "7d" : selectedPeriod === 30 ? "30d" : "90d"

    const handlePeriodChange = (value: string) => {
        const period = value === "7d" ? 7 : value === "30d" ? 30 : 90
        setSelectedPeriod(period)
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Analytics</h2>
                </div>
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-muted-foreground mb-2">Failed to load analytics data</p>
                            <p className="text-sm text-muted-foreground">
                                {error instanceof Error ? error.message : "Unknown error occurred"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Make sure your Instagram account is connected and has the required permissions.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Analytics</h2>
            </div>
            {/* Summary Stats */}
            {!isLoading && insights && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-chart-1)' }}></div>
                                <span className="text-sm font-medium">Total Reach</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">{insights.combined.reachTotal.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {selectedPeriod === 7 ? "This week" : `Last ${selectedPeriod} days`}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-chart-2)' }}></div>
                                <span className="text-sm font-medium">Total Engagement</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">{insights.combined.engagementTotal.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {selectedPeriod === 7 ? "This week" : `Last ${selectedPeriod} days`}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-chart-5)' }}></div>
                                <span className="text-sm font-medium">Net Follower Growth</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">
                                {insights.followerGrowth.netGrowth > 0 ? "+" : ""}{insights.followerGrowth.netGrowth.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {selectedPeriod === 7 ? "This week" : `Last ${selectedPeriod} days`}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-chart-3)' }}></div>
                                <span className="text-sm font-medium">Content Engagement</span>
                            </div>
                            <p className="text-2xl font-bold mt-2">{insights.contentPerformance.totalEngagement.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {selectedPeriod === 7 ? "This week" : `Last ${selectedPeriod} days`}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Time Selection Tabs */}
            <div className="flex justify-center">
                <Tabs value={timeRange} onValueChange={handlePeriodChange} className="w-full max-w-md">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="7d">This Week</TabsTrigger>
                        <TabsTrigger value="30d">30 Days</TabsTrigger>
                        <TabsTrigger value="90d">90 Days</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Combined Reach & Engagement Area Chart - Full Width */}
                <Card className="pt-0">
                    <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                        <div className="grid flex-1 gap-1">
                            <CardTitle>Reach & Engagement</CardTitle>
                            <CardDescription>
                                Showing reach and engagement for the {selectedPeriod === 7 ? "last 7 days" : `last ${selectedPeriod} days`}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                        {isLoading ? (
                            <Skeleton className="h-[250px] w-full" />
                        ) : (
                            <ChartContainer config={combinedConfig} className="aspect-auto h-[280px] w-full">
                                <AreaChart data={insights?.combined.data || []}>
                                    <defs>
                                        <linearGradient id="fillReach" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor="var(--color-chart-1)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="var(--color-chart-1)"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                        <linearGradient id="fillEngagement" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor="var(--color-chart-2)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="var(--color-chart-2)"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={32}
                                        tickFormatter={(value) => {
                                            const date = new Date(value)
                                            return date.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })
                                        }}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(value) => {
                                                    return new Date(value).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })
                                                }}
                                                indicator="dot"
                                            />
                                        }
                                    />
                                    <Area
                                        dataKey="engagement"
                                        type="natural"
                                        fill="url(#fillEngagement)"
                                        stroke="var(--color-chart-2)"
                                        strokeWidth={2}
                                        fillOpacity={0.6}
                                    />
                                    <Area
                                        dataKey="value"
                                        type="natural"
                                        fill="url(#fillReach)"
                                        stroke="var(--color-chart-1)"
                                        strokeWidth={2}
                                        fillOpacity={0.6}
                                    />
                                    <ChartLegend
                                        content={<ChartLegendContent />}
                                        className="mt-4"
                                    />
                                </AreaChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Net Follower Growth Chart - Full Width */}
                <Card className="pt-0">
                    <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                        <div className="grid flex-1 gap-1">
                            <CardTitle>Net Follower Growth</CardTitle>
                            <CardDescription>
                                Showing net follower growth for the {selectedPeriod === 7 ? "last 7 days" : `last ${selectedPeriod} days`}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                        {isLoading ? (
                            <Skeleton className="h-[250px] w-full" />
                        ) : (
                            <ChartContainer config={netGrowthConfig} className="aspect-auto h-[250px] w-full">
                                <AreaChart data={insights?.followerGrowth.data || []}>
                                    <defs>
                                        <linearGradient id="fillNetGrowth" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor="var(--color-chart-5)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="var(--color-chart-5)"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={32}
                                        tickFormatter={(value) => {
                                            const date = new Date(value)
                                            return date.toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })
                                        }}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(value) => {
                                                    return new Date(value).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })
                                                }}
                                                indicator="dot"
                                            />
                                        }
                                    />
                                    <Area
                                        dataKey="net"
                                        type="natural"
                                        fill="url(#fillNetGrowth)"
                                        stroke="var(--color-chart-5)"
                                        strokeWidth={2}
                                        fillOpacity={0.6}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Content Performance Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Content Performance Stacked Area Chart */}
                    <Card className="pt-0">
                        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                            <div className="grid flex-1 gap-1">
                                <CardTitle>Content Performance</CardTitle>
                                <CardDescription>
                                    Likes, comments, shares, and saves over time
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                            {isLoading ? (
                                <Skeleton className="h-[250px] w-full" />
                            ) : (
                                <ChartContainer config={contentPerformanceConfig} className="aspect-auto h-[250px] w-full">
                                    <AreaChart data={insights?.contentPerformance.data || []}>
                                        <defs>
                                            <linearGradient id="fillLikes" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.1} />
                                            </linearGradient>
                                            <linearGradient id="fillComments" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.1} />
                                            </linearGradient>
                                            <linearGradient id="fillShares" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-chart-3)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--color-chart-3)" stopOpacity={0.1} />
                                            </linearGradient>
                                            <linearGradient id="fillSaves" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-chart-4)" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="var(--color-chart-4)" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            minTickGap={32}
                                            tickFormatter={(value) => {
                                                const date = new Date(value)
                                                return date.toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })
                                            }}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(value) => {
                                                        return new Date(value).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                        })
                                                    }}
                                                    indicator="dot"
                                                />
                                            }
                                        />
                                        <Area
                                            dataKey="saves"
                                            type="natural"
                                            fill="url(#fillSaves)"
                                            stroke="var(--color-chart-4)"
                                            strokeWidth={2}
                                            fillOpacity={0.6}
                                            stackId="1"
                                        />
                                        <Area
                                            dataKey="shares"
                                            type="natural"
                                            fill="url(#fillShares)"
                                            stroke="var(--color-chart-3)"
                                            strokeWidth={2}
                                            fillOpacity={0.6}
                                            stackId="1"
                                        />
                                        <Area
                                            dataKey="comments"
                                            type="natural"
                                            fill="url(#fillComments)"
                                            stroke="var(--color-chart-2)"
                                            strokeWidth={2}
                                            fillOpacity={0.6}
                                            stackId="1"
                                        />
                                        <Area
                                            dataKey="likes"
                                            type="natural"
                                            fill="url(#fillLikes)"
                                            stroke="var(--color-chart-1)"
                                            strokeWidth={2}
                                            fillOpacity={0.6}
                                            stackId="1"
                                        />
                                        <ChartLegend
                                            content={<ChartLegendContent />}
                                            className="mt-4"
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Daily Engagement Breakdown Bar Chart */}
                    <Card className="pt-0">
                        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                            <div className="grid flex-1 gap-1">
                                <CardTitle>Daily Engagement Breakdown</CardTitle>
                                <CardDescription>
                                    Total engagement per day
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                            {isLoading ? (
                                <Skeleton className="h-[250px] w-full" />
                            ) : (
                                <ChartContainer config={contentPerformanceConfig} className="aspect-auto h-[250px] w-full">
                                    <BarChart data={insights?.contentPerformance.data || []}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            minTickGap={32}
                                            tickFormatter={(value) => {
                                                const date = new Date(value)
                                                return date.toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                })
                                            }}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(value) => {
                                                        return new Date(value).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                        })
                                                    }}
                                                    indicator="dot"
                                                />
                                            }
                                        />
                                        <Bar
                                            dataKey="total"
                                            fill="var(--color-chart-1)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Content Performance Metrics Grid */}
                <Card className="pt-0">
                    <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                        <div className="grid flex-1 gap-1">
                            <CardTitle>Content Performance Summary</CardTitle>
                            <CardDescription>
                                Detailed breakdown of engagement metrics
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                        {isLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-chart-1)' }}></div>
                                        <span className="text-sm font-medium">Likes</span>
                                    </div>
                                    <p className="text-2xl font-bold">{insights?.contentPerformance.totalLikes.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Total likes</p>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-chart-2)' }}></div>
                                        <span className="text-sm font-medium">Comments</span>
                                    </div>
                                    <p className="text-2xl font-bold">{insights?.contentPerformance.totalComments.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Total comments</p>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-chart-3)' }}></div>
                                        <span className="text-sm font-medium">Shares</span>
                                    </div>
                                    <p className="text-2xl font-bold">{insights?.contentPerformance.totalShares.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Total shares</p>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-chart-4)' }}></div>
                                        <span className="text-sm font-medium">Saves</span>
                                    </div>
                                    <p className="text-2xl font-bold">{insights?.contentPerformance.totalSaves.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Total saves</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
