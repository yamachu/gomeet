import { sha256 } from './hash.ts'

export async function toHashedState(state:string, salt: string): Promise<string> {
  return sha256(state + salt);
}
