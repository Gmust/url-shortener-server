export enum Roles {
  USER = 'User',
  ADMIN = 'Admin',
  SUPPORT = 'Support'
}


export interface FindUser {
  _id?: string,
  email?: string
}
