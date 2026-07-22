"use client";

import { useEffect, useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Plus, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Integration = {
  id: string;
  instagramId: string;
  accountName: string | null;
  username: string | null;
  profilePicture: string | null;
  expiresAt: string | null;
};

type AccountsResponse = {
  integrations: Integration[];
  activeIntegrationId: string | null;
};

export function AccountSwitcher({ collapsed }: { collapsed?: boolean }) {
  const [data, setData] = useState<AccountsResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const [switching, setSwitching] = useState<string | null>(null);
  const router = useRouter();

  const fetchAccounts = () => {
    fetch("/api/integrations")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const activeAccount = data?.integrations.find((i) => i.id === data?.activeIntegrationId);

  const switchAccount = async (integrationId: string) => {
    if (integrationId === data?.activeIntegrationId) return;
    setSwitching(integrationId);
    try {
      const res = await fetch("/api/instagram/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId }),
      });
      if (res.ok) {
        setData((prev) => prev ? { ...prev, activeIntegrationId: integrationId } : prev);
        router.refresh();
      }
    } finally {
      setSwitching(null);
    }
  };

  const removeAccount = async (integrationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Remove this Instagram account?")) return;
    try {
      await fetch(`/api/integrations?id=${integrationId}`, { method: "DELETE" });
      fetchAccounts();
      router.refresh();
    } catch {}
  };

  const getInitials = (account: Integration) => {
    const name = account.accountName || account.username || "IG";
    return name.slice(0, 2).toUpperCase();
  };

  const getDisplayName = (account: Integration) => {
    if (account.username) return `@${account.username}`;
    return account.accountName || account.instagramId;
  };

  if (!data) {
    return (
      <div className={cn("flex items-center gap-2 px-2 py-1.5", collapsed && "justify-center")}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        {!collapsed && <span className="text-xs text-muted-foreground">Loading accounts…</span>}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-2 px-2 h-auto py-1.5 hover:bg-sidebar-accent text-sidebar-foreground",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarImage src={activeAccount?.profilePicture || undefined} />
              <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                {activeAccount ? getInitials(activeAccount) : "IG"}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 text-left">
                <p className="text-xs font-medium truncate">
                  {activeAccount ? getDisplayName(activeAccount) : "No account"}
                </p>
                <p className="text-[10px] text-muted-foreground">Instagram</p>
              </div>
            )}
          </div>
          {!collapsed && <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Connected Accounts
        </DropdownMenuLabel>

        {data.integrations.length === 0 && (
          <div className="px-3 py-2 text-xs text-muted-foreground">No accounts connected yet.</div>
        )}

        {data.integrations.map((account) => {
          const isActive = account.id === data.activeIntegrationId;
          const isLoading = switching === account.id;
          return (
            <DropdownMenuItem
              key={account.id}
              onClick={() => switchAccount(account.id)}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarImage src={account.profilePicture || undefined} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                  {getInitials(account)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{getDisplayName(account)}</p>
                {account.accountName && account.username && (
                  <p className="text-xs text-muted-foreground truncate">{account.accountName}</p>
                )}
              </div>
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin ml-auto" />
              ) : isActive ? (
                <Check className="w-3.5 h-3.5 ml-auto text-primary" />
              ) : (
                <button
                  onClick={(e) => removeAccount(account.id, e)}
                  className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a
            href="/api/instagram/connect"
            className="flex items-center gap-2 cursor-pointer text-primary"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Instagram Account</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
