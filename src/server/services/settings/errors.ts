// Erros de domínio de Configurações. Os route handlers mapeiam cada um para o
// status HTTP correto — nada de 500 para regra de negócio.
export class UserNotFoundError extends Error {
  readonly code = "NOT_FOUND";
  constructor(message = "Usuário não encontrado.") {
    super(message);
    this.name = "UserNotFoundError";
  }
}

// Conta criada só por OAuth (Google/GitHub) não tem senha para trocar.
export class PasswordNotSetError extends Error {
  readonly code = "PASSWORD_NOT_SET";
  constructor(
    message = "Esta conta entra por Google ou GitHub e não usa senha.",
  ) {
    super(message);
    this.name = "PasswordNotSetError";
  }
}

export class InvalidCurrentPasswordError extends Error {
  readonly code = "INVALID_CURRENT_PASSWORD";
  constructor(message = "A senha atual está incorreta.") {
    super(message);
    this.name = "InvalidCurrentPasswordError";
  }
}
