export interface IMapperDTO<Input, Output> {
  toDTO(data: Input): Output;
}