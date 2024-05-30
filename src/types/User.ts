export enum Roles {
  USER = 'User',
  ADMIN = 'Admin',
}


export interface FindUser {
  _id?: string,
  email?: string
}
