export default class ClientNotFoundError extends Error {
  constructor() {
    super("Client not found");
    this.name = "ClientNotFoundError";
  }
}
