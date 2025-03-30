export class User {
  _id?: string;
  username: string;
  password?: string; // Optional since we won't send the password back to the client
  name: string;
  surname: string;
  email: string;
  address: string;
  gender: string;
  birthdate: Date;
  admin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}


