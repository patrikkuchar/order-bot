export const ApiErrors = [
  'ENTITY_NOT_FOUND'
] as const;
//TODO: validate if necessery
export type ApiErrorCode = typeof ApiErrors[number];

export type ApiErrorRes = {
  code: ApiErrorCode
  message: string
}
