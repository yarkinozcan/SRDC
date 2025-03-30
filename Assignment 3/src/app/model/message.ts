export class Message {
  _id?: string;
  sender: string | null;
  receiver: string | null;
  title: string;
  body: string;
  timestamp?: Date;
}
