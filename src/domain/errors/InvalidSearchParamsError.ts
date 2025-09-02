export class InvalidSearchParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSearchParamsError";
  }
}
