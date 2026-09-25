// CPF é PII sensível: o valor em claro nunca sai do servidor. A tela mostra os
// três dígitos do meio, o suficiente para o usuário reconhecer o próprio número
// sem que a resposta da API carregue o dado completo.
export function maskCpf(cpf: string | null): string | null {
  if (!cpf || cpf.length !== 11) {
    return null;
  }

  return `***.***.${cpf.slice(6, 9)}-**`;
}
