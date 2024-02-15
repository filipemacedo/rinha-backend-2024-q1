export default interface IUseCase<Input, Output> {
  execute(request: Input): Promise<Output>;
}
