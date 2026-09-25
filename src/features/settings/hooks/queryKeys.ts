// Invalidar `all` recarrega tudo o que as telas de Configurações e Minha conta
// mostram: dados pessoais, preferências e contas vêm do mesmo endpoint.
export const settingsQueryKeys = {
  all: ["settings"] as const,
};
