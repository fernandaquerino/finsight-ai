"use client";

import { useQuery } from "@tanstack/react-query";

import type { Settings } from "@/features/settings/types";

import { settingsQueryKeys } from "./queryKeys";
import { request } from "./request";

export function useSettings() {
  return useQuery({
    queryKey: settingsQueryKeys.all,
    queryFn: () =>
      request<Settings>(
        "/api/settings",
        { method: "GET" },
        "Não foi possível carregar as configurações.",
      ),
  });
}
