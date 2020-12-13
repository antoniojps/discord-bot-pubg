import mongoose, { Model, Document } from 'mongoose';
import { EmbedError } from './../embeds/Error';

const UserSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  pubgNickname: {
    type: String,
    required: true,
    unique: true,
  },
});

interface UserDocument extends Document {
  discordId: string;
  pubgNickname: string;
  createdAt: string;
  updatedAt: string;
}

type LinkProps = {
  discordId: string;
  pubgNickname: string;
};

interface UserModel extends Model<UserDocument> {
  linkPubgAccount: (props: LinkProps) => Promise<UserDocument>;
}

UserSchema.set('timestamps', true);

// instance
UserSchema.methods = {};

// model
UserSchema.statics = {
  async linkPubgAccount({ discordId, pubgNickname }: LinkProps) {
    // find in DB
    const userWithNick: UserDocument = await this.findOne({ pubgNickname });

    if (userWithNick) {
      throw new EmbedError(`user <@${userWithNick.discordId}> already linked to pubg account ${pubgNickname}`);
    }

    const userFromDB: UserDocument = await this.findOne({ discordId });
    if (userFromDB) {
      // update nickname
      userFromDB.pubgNickname = pubgNickname;
      const userFromDBUpdated = await userFromDB.save();
      return userFromDBUpdated;
    }

    // get player stats from pubg api
    const newPlayer = new User({ discordId, pubgNickname });
    await newPlayer.save();
    return newPlayer;
  },
};

const User = mongoose.model<UserDocument, UserModel>('User', UserSchema);

export default User;
