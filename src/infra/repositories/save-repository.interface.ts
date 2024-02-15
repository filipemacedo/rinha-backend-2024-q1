export default interface ISaveRepository<T> {
  save(row: T): Promise<T>;
}
