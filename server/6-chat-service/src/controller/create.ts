import { IMessageDocument } from '@chat/helper/chat.interface';
import { BadRequestError } from '@chat/helper/error-handler';
import { messageSchema } from '@chat/schemes/message';
import { addMessage, createConversation } from '@chat/services/message.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const message = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(messageSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'message create()method error');
  }

  // let file: string = req.body.file;
  // const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  // const randomCharacters: string = randomBytes.toString('hex');
  //   let result: UploadApiResponse;
  //   if (file) {
  //     result = (req.body.fileType === 'zip' ? await uploads(file, `${randomCharacters}.zip`) : await uploads(file)) as UploadApiResponse;
  //     if (!result.public_id) {
  //       throw new BadRequestError('File upload error. Try again', 'Create message() method');
  //     }
  //     file = result?.secure_url;
  //   }
  const messageData: IMessageDocument = {
    conversationId: req.body.conversationId,
    body: req.body.body,
    // file,
    // fileType: req.body.fileType,
    // fileSize: req.body.fileSize,
    // fileName: req.body.fileName,
    gigId: req.body.gigId,
    buyerId: req.body.buyerId,
    sellerId: req.body.sellerId,
    senderUsername: req.body.senderUsername,
    senderPicture: req.body.senderPicture,
    receiverUsername: req.body.receiverUsername,
    receiverPicture: req.body.receiverPicture,
    isRead: req.body.isRead,
    hasOffer: req.body.hasOffer,
    offer: req.body.offer
  };
  if (!req.body.hasCoversationId) {
    await createConversation(`${req.body.conversationId}`, `${messageData.senderUsername}`, `${messageData.receiverUsername}`);
  }
  await addMessage(messageData);
  res.status(StatusCodes.OK).json({ message: 'Message addes', conversationId: req.body.conversationId });
};

export { message };
