export type Value = string | Buffer | number | object | boolean | any[];

export interface Cache {
  readonly prefix?: string
  readonly active: boolean

  exists(key: string): Promise<boolean>
  set(key: string, data: Value, expireInSeconds?: number): Promise<boolean>
  get(key: string): Promise<Value | null>
  del(key: string): Promise<number>
}
