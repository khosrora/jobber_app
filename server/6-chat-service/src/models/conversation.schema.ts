import { IConversationDocument } from '@chat/helper/chat.interface';
import { model, Model, Schema } from 'mongoose';

const conversationSchema: Schema = new Schema({
  conversationId: { type: String, required: true, unique: true, index: true },
  senderUsername: { type: String, required: true, index: true },
  receiverUsername: { type: String, required: true, index: true }
});

const ConversationModel: Model<IConversationDocument> = model<IConversationDocument>('Conversation', conversationSchema);
export { ConversationModel };
