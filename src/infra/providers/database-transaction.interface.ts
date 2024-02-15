export default interface IDatabaseTransaction {
  transaction<T>(callback: (trx: any) => Promise<T>): Promise<T>
}