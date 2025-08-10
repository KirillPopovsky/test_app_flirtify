export class UnknownError extends Error {
  type = 'unknown';

  constructor(message?: string) {
    super(message || 'Something went wrong.');
    this.name = 'unknown';
  }
}
export class AuthInvalidCredentialsError extends Error {
  type = 'invalid-credential';

  constructor(message?: string) {
    super(message || 'Invalid credentials.');
    this.name = 'InvalidCredential';
  }
}
export class ServerError extends Error {
  type = 'server-error';

  constructor(message?: string) {
    super(message || 'Server error.');
    this.name = 'ServerError';
  }
}

export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomError';
  }
}
