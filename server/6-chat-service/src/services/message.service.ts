import { IConversationDocument, IMessageDetails, IMessageDocument } from '@chat/helper/chat.interface';
import { lowerCase } from '@chat/helper/helpers';
import { ConversationModel } from '@chat/models/conversation.schema';
import { MessageModel } from '@chat/models/message.schema';
import { publishDirectMessage } from '@chat/queues/chat.producer';
import { chatChannel, socketIOChatObject } from '@chat/server';

const createConversation = async (conversationId: string, sender: string, reciver: string): Promise<void> => {
  await ConversationModel.create({
    conversationId,
    senderUsername: sender,
    receiverUsername: reciver
  });
};

const addMessage = async (data: IMessageDocument): Promise<IMessageDocument> => {
  const message: IMessageDocument = (await MessageModel.create(data)) as IMessageDocument;
  if (data.hasOffer) {
    const emailMessageDetails: IMessageDetails = {
      sender: data.senderUsername,
      amount: `${data.offer?.price}`,
      buyerUsername: lowerCase(`${data.receiverUsername}`),
      sellerUsername: lowerCase(`${data.senderUsername}`),
      title: data.offer?.gigTitle,
      description: data.offer?.description,
      deliveryDays: `${data.offer?.deliveryInDays}`,
      template: 'offer'
    };
    // send email
    await publishDirectMessage(
      chatChannel,
      'jobber-order-notification',
      'order-email',
      JSON.stringify(emailMessageDetails),
      'Order email sent to notification service'
    );
  }
  socketIOChatObject.emit(`message received`, message);
  return message;
};

const getConversation = async (sender: string, reciver: string): Promise<IConversationDocument[]> => {
  const query = {
    $or: [
      { senderUsername: sender, receiverUsername: reciver },
      { senderUsername: reciver, receiverUsername: sender }
    ]
  };
  const conversation: IConversationDocument[] = await ConversationModel.aggregate([
    {
      $match: query
    }
  ]);
  return conversation;
};

const getUserConversationList = async (username: string): Promise<IMessageDocument[]> => {
  const query = {
    $or: [{ senderUsername: username }, { receiverUsername: username }]
  };
  const messages: IMessageDocument[] = await MessageModel.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: '$conversationId',
        result: { $top: { output: '$$ROOT', sortBy: { createdAt: -1 } } }
      }
    },
    {
      $project: {
        _id: '$result._id',
        conversationId: '$result.conversationId',
        sellerId: '$result.sellerId',
        buyerId: '$result.buyerId',
        receiverUsername: '$result.receiverUsername',
        receiverPicture: '$result.receiverPicture',
        senderUsername: '$result.senderUsername',
        senderPicture: '$result.senderPicture',
        body: '$result.body',
        file: '$result.file',
        gigId: '$result.gigId',
        isRead: '$result.isRead',
        hasOffer: '$result.hasOffer',
        createdAt: '$result.createdAt'
      }
    }
  ]);
  return messages;
};

const getMessages = async (sender: string, reciver: string): Promise<IMessageDocument[]> => {
  const query = {
    $or: [
      { senderUsername: sender, receiverUsername: reciver },
      { senderUsername: reciver, receiverUsername: sender }
    ]
  };
  const conversation: IMessageDocument[] = await MessageModel.aggregate([
    {
      $match: query
    },
    {
      $sort: { createdAt: 1 }
    }
  ]);
  return conversation;
};

const getUserMessages = async (messageConversationId: string): Promise<IMessageDocument[]> => {
  const conversation: IMessageDocument[] = await MessageModel.aggregate([
    {
      $match: { conversationId: messageConversationId }
    },
    {
      $sort: { createdAt: 1 }
    }
  ]);
  return conversation;
};

const updateOffer = async (messageId: string, type: string): Promise<IMessageDocument> => {
  const message: IMessageDocument = (await MessageModel.findOneAndUpdate(
    { _id: messageId },
    {
      $set: {
        [`offer.${type}`]: true
      }
    },
    { new: true }
  )) as IMessageDocument;
  return message;
};

const markMessageAsRead = async (messageId: string): Promise<IMessageDocument> => {
  const message: IMessageDocument = (await MessageModel.findOneAndUpdate(
    { _id: messageId },
    {
      $set: {
        isRead: true
      }
    },
    { new: true }
  )) as IMessageDocument;
  socketIOChatObject.emit('message updated', message);
  return message;
};

const markManyMesageAsRead = async (reciver: string, sender: string, messageId: string): Promise<IMessageDocument> => {
  (await MessageModel.updateMany(
    { senderUsername: sender, receiverUsername: reciver, isRead: false },
    {
      $set: {
        isRead: true
      }
    }
  )) as IMessageDocument;
  const message: IMessageDocument = (await MessageModel.findOne({ _id: messageId }).exec()) as IMessageDocument;
  socketIOChatObject.emit('message updated', message);
  return message;
};

export {
  addMessage,
  createConversation,
  getConversation,
  getUserConversationList,
  getMessages,
  getUserMessages,
  updateOffer,
  markMessageAsRead,
  markManyMesageAsRead
};
