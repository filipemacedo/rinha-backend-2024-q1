export default interface IController<Input, Output> {
  handle(request: Input): Promise<Output>;
}
